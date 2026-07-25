/**
 * Multi-subject (owner+pet) generation — core logic.
 *
 * Split out of multi-subject-generation.functions.ts (into a .server.ts file,
 * matching this codebase's convention for watermark.server.ts/client.server.ts/
 * etc.) because it was breaking the dev/production client bundle: this file
 * imports bakeWatermark -> @cf-wasm/photon (a wasm module), and having that
 * import reachable from a SEPARATELY EXPORTED function in the same file the
 * client-rendered create-group.tsx imports from meant TanStack Start's
 * server-fn Vite plugin — which only strips the literal .handler(fn) argument
 * of a createServerFn(...) call, not arbitrary sibling exports — had no way to
 * elide it from the browser bundle. Keeping all of this in a file that's only
 * ever referenced from inside generateMultiSubjectPawtoon's .handler() (in
 * multi-subject-generation.functions.ts) lets that same stripping mechanism
 * work correctly, exactly as it already does for generatePawtoon's own
 * bakeWatermark/supabaseAdmin usage in generations.functions.ts.
 */
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { ART_STYLE_PREFIX } from "@/services/prompts";
import { bakeWatermark } from "@/lib/watermark.server";

export const SubjectSchema = z.object({
  uploadedImageId: z.string().uuid(),
  subjectType: z.enum(["person", "pet"]),
  name: z.string().max(64),
});

export const InputSchema = z.object({
  // Solo always sends exactly 2 (1 person + 1 pet). Family/Full House can
  // send as few as 1 (a single pet, everything else skipped in the wizard).
  subjects: z.array(SubjectSchema).min(1).max(6),
  artStyleId: z.string().min(1).max(64),
  tier: z.enum(["solo", "family", "full_house"]),
});

export type MultiSubjectSubject = z.infer<typeof SubjectSchema>;
export type MultiSubjectInput = z.infer<typeof InputSchema>;

const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_EDIT_URL = "https://api.openai.com/v1/images/edits";

function mimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return (
    {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      heic: "image/heic",
      heif: "image/heif",
    }[ext] ?? "image/jpeg"
  );
}

// Same merge approach proven in scripts/multi-subject-test/test-edit.mjs's
// buildEditPrompt(), swapped to the real ART_STYLE_PREFIX (exported from
// prompts.ts) and the actual subject list/names instead of the disposable
// script's hardcoded two-subject copy.
function buildMultiSubjectEditPrompt(subjects: MultiSubjectSubject[], artStyleId: string): string {
  const stylePrefix = ART_STYLE_PREFIX[artStyleId] ?? ART_STYLE_PREFIX["oil-painting"];
  const listed = subjects
    .map((s, i) => `${i + 1}) ${s.subjectType === "person" ? "a person" : "a pet"} named ${s.name}`)
    .join(" ");

  return [
    `${stylePrefix}.`,
    `Combine the following subjects from the attached reference images into a single portrait, together in one cohesive scene: ${listed}`,
    `Keep every subject clearly recognisable and faithful to their reference photo — preserve each person's face and each pet's breed, fur colour and markings.`,
    `High-quality digital illustration, premium gifting product art, square 1:1 composition, centred subjects, clean background.`,
    `No text, no watermarks, no logos.`,
  ].join(" ");
}

export type GenerateMultiSubjectDeps = {
  supabaseAdmin: SupabaseClient<Database>;
  openaiApiKey: string;
};

export type MultiSubjectResult =
  | { status: "completed"; generationId: string; previewUrl: string }
  | { status: "failed"; generationId: string | null; error: string };

/**
 * Core logic, framework-agnostic: takes its dependencies explicitly instead
 * of reaching for the ambient supabaseAdmin/getEnv() singletons (which need a
 * live Cloudflare Workers request context — see src/lib/env.server.ts). This
 * lets it run from a standalone script as well as from the createServerFn
 * wrapper in multi-subject-generation.functions.ts, with zero logic
 * duplicated between the two.
 */
export async function runMultiSubjectGeneration(
  input: MultiSubjectInput,
  userId: string,
  deps: GenerateMultiSubjectDeps
): Promise<MultiSubjectResult> {
  const db = deps.supabaseAdmin;

  // 1. Load each subject's storage_path up front.
  const { data: rows, error: rowsErr } = await db
    .from("uploaded_images")
    .select("id, storage_path")
    .in(
      "id",
      input.subjects.map((s) => s.uploadedImageId)
    );
  if (rowsErr || !rows || rows.length !== input.subjects.length) {
    throw new Error(
      `Could not load all uploaded photos: ${rowsErr?.message ?? `expected ${input.subjects.length}, found ${rows?.length ?? 0}`}`
    );
  }
  const pathById = new Map(rows.map((r) => [r.id, r.storage_path]));

  // 2. Insert a generations row in processing state, same pattern as
  // generatePawtoon (generations.functions.ts:68-91). uploaded_image_id
  // points at the first subject for traceability; the full subject list
  // lives in generation_params per the Step 1 migration comment.
  const prompt = buildMultiSubjectEditPrompt(input.subjects, input.artStyleId);
  const { data: genRow, error: insErr } = await db
    .from("generations")
    .insert({
      user_id: userId,
      uploaded_image_id: input.subjects[0]?.uploadedImageId ?? null,
      theme: "multi_subject",
      art_style: input.artStyleId,
      prompt,
      status: "processing",
      generation_params: {
        subjects: input.subjects,
        tier: input.tier,
        artStyleId: input.artStyleId,
      },
    })
    .select("id")
    .single();
  if (insErr || !genRow) throw new Error(`Could not queue generation: ${insErr?.message}`);
  const generationId = genRow.id as string;

  try {
    // 3. Download every reference photo — real photo bytes, not a text
    // description. Reuses the same supabaseAdmin.storage.from("pet-uploads")
    // .download(...) pattern as generatePawtoon (generations.functions.ts:97-99),
    // once per subject.
    const attachments: { bytes: Uint8Array; mime: string; filename: string }[] = [];
    for (const subject of input.subjects) {
      const path = pathById.get(subject.uploadedImageId);
      if (!path) throw new Error(`No storage_path found for uploadedImageId ${subject.uploadedImageId}`);
      const { data: blob, error: dlErr } = await db.storage.from("pet-uploads").download(path);
      if (dlErr || !blob) throw new Error(`Could not load source photo for ${subject.name}: ${dlErr?.message}`);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      attachments.push({
        bytes,
        mime: (blob.type || mimeFromPath(path)) as string,
        filename: path.split("/").pop() ?? `${subject.uploadedImageId}.jpg`,
      });
    }

    // 4. images/edits — multipart/form-data, NOT JSON like images/generations.
    // Shape confirmed working in scripts/multi-subject-test/test-edit.mjs.
    const form = new FormData();
    form.append("model", OPENAI_IMAGE_MODEL);
    form.append("prompt", prompt.slice(0, 4000));
    form.append("n", "1");
    form.append("size", "1024x1024");
    form.append("quality", "medium");
    for (const a of attachments) {
      form.append("image[]", new Blob([a.bytes as BlobPart], { type: a.mime }), a.filename);
    }

    const imageRes = await fetch(OPENAI_EDIT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${deps.openaiApiKey}` },
      body: form,
    });
    if (!imageRes.ok) {
      const errText = await imageRes.text().catch(() => "");
      if (imageRes.status === 429) throw new Error("OpenAI rate limit reached — please try again in a minute.");
      if (imageRes.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
      throw new Error(`OpenAI images/edits error (${imageRes.status}): ${errText.slice(0, 500)}`);
    }
    const editData = await imageRes.json();
    const imageUrl = editData.data?.[0]?.url;
    const imageB64 = editData.data?.[0]?.b64_json;
    if (!imageUrl && !imageB64) throw new Error("gpt-image-2 (edits) did not return an image.");

    let bytesOut: Uint8Array;
    if (imageB64) {
      const binaryString = atob(imageB64);
      bytesOut = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytesOut[i] = binaryString.charCodeAt(i);
    } else {
      const dl = await fetch(imageUrl!);
      if (!dl.ok) throw new Error(`Failed to download generated image: ${dl.statusText}`);
      bytesOut = new Uint8Array(await dl.arrayBuffer());
    }

    // 5. Store clean + watermarked preview — same buckets and path
    // convention as generatePawtoon (generations.functions.ts:205-220).
    const cleanPath = `${userId}/${generationId}-v1.png`;
    const { error: cleanErr } = await db.storage
      .from("caricatures-clean")
      .upload(cleanPath, bytesOut, { contentType: "image/png", upsert: true });
    if (cleanErr) throw new Error(`Could not save clean image: ${cleanErr.message}`);

    const previewBytes = bakeWatermark(new Uint8Array(bytesOut));
    const previewPath = `${userId}/${generationId}-v1.png`;
    const { error: prevErr } = await db.storage
      .from("caricature-previews")
      .upload(previewPath, previewBytes, { contentType: "image/png", upsert: true });
    if (prevErr) throw new Error(`Could not save preview: ${prevErr.message}`);

    const { data: pub } = db.storage.from("caricature-previews").getPublicUrl(previewPath);
    const previewUrl = pub.publicUrl;

    // 6. Mark completed.
    const { error: upErr } = await db
      .from("generations")
      .update({
        status: "completed",
        preview_url: previewUrl,
        clean_path: cleanPath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", generationId);
    if (upErr) throw new Error(upErr.message);

    return { status: "completed", generationId, previewUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    await db
      .from("generations")
      .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
      .eq("id", generationId);
    return { status: "failed", generationId, error: message };
  }
}
