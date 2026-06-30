import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildPrompt, type GenerationInput } from "@/services/prompts";
import { bakeWatermark } from "@/lib/watermark.server";
import type { CloudflareEnv } from "@/lib/env.server";

const ALL_ART_STYLES = ["oil-painting", "pixar-3d", "comic-book"] as const;
type ArtStyle = (typeof ALL_ART_STYLES)[number];

const ART_STYLE_LABELS: Record<string, string> = {
  "oil-painting": "Oil Painting",
  "pixar-3d": "Pixar 3D",
  "comic-book": "Comic Book",
};

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

export type BundlePortrait = {
  generationId: string;
  artStyle: string;
  artStyleLabel: string;
  downloadUrl: string | null;
  status: string;
};

async function runPortraitGeneration(opts: {
  uploadedImagePath: string;
  uploadedImageId: string;
  userId: string;
  params: GenerationInput & { artStyleId: string };
  apiKey: string;
  /** Pre-created generation ID — skips the initial DB insert when provided. */
  generationId?: string;
}): Promise<string> {
  const { uploadedImagePath, uploadedImageId, userId, params, apiKey } = opts;
  const prompt = buildPrompt(params);

  let generationId: string;
  if (opts.generationId) {
    generationId = opts.generationId;
  } else {
    const { data: genRow, error: insErr } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: userId,
        uploaded_image_id: uploadedImageId,
        theme: params.themeId,
        prompt,
        status: "processing",
        generation_params: params as any,
      })
      .select("id")
      .single();
    if (insErr || !genRow) throw new Error(`Could not create generation: ${insErr?.message}`);
    generationId = genRow.id as string;
  }

  try {
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from("pet-uploads")
      .download(uploadedImagePath);
    if (dlErr || !blob) throw new Error(`Could not load source photo: ${dlErr?.message}`);

    const arrayBuf = await blob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuf).toString("base64");
    const mimeType = (blob.type || "image/jpeg") as string;

    const visionRes = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this pet photo in detail. Describe: species (dog/cat/other), breed or breed mix if identifiable, coat color and pattern, distinctive physical features (ears, eyes, markings), apparent size, and current pose/expression. Be specific and concise (3-4 sentences max). Focus on visual details that would help an artist recreate this specific pet." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          ],
        }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    if (!visionRes.ok) throw new Error(`Vision API error (${visionRes.status})`);
    const visionData = await visionRes.json();
    const petDescription = visionData.choices?.[0]?.message?.content;
    if (!petDescription) throw new Error("Vision API did not return a description.");

    const enhancedPrompt = `${prompt}\n\nPet details from photo: ${petDescription}\n\nImportant: Create a portrait that captures this specific pet's unique characteristics (breed, colors, features) in the requested artistic style.`;

    const dalleRes = await fetch(OPENAI_IMAGE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt: enhancedPrompt.slice(0, 4000),
        n: 1,
        size: "1024x1024",
        quality: "medium",
      }),
    });
    if (!dalleRes.ok) throw new Error(`Image API error (${dalleRes.status})`);
    const dalleData = await dalleRes.json();
    const imageUrl = dalleData.data?.[0]?.url;
    const imageB64 = dalleData.data?.[0]?.b64_json;
    if (!imageUrl && !imageB64) throw new Error("Image API did not return an image.");

    let resultBytes: Uint8Array;
    if (imageB64) {
      const bin = atob(imageB64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      resultBytes = bytes;
    } else {
      const r = await fetch(imageUrl!);
      if (!r.ok) throw new Error("Failed to download generated image.");
      resultBytes = new Uint8Array(await r.arrayBuffer());
    }

    const cleanPath = `${userId}/${generationId}.png`;
    const { error: cleanErr } = await supabaseAdmin.storage
      .from("caricatures-clean")
      .upload(cleanPath, resultBytes, { contentType: "image/png", upsert: true });
    if (cleanErr) throw new Error(`Could not save result: ${cleanErr.message}`);

    const previewBytes = bakeWatermark(new Uint8Array(resultBytes));
    const previewPath = `${userId}/${generationId}.png`;
    await supabaseAdmin.storage
      .from("caricature-previews")
      .upload(previewPath, previewBytes, { contentType: "image/png", upsert: true });

    const { data: pub } = supabaseAdmin.storage.from("caricature-previews").getPublicUrl(previewPath);

    await supabaseAdmin
      .from("generations")
      .update({ status: "completed", preview_url: pub.publicUrl, clean_path: cleanPath, updated_at: new Date().toISOString() })
      .eq("id", generationId);

    return generationId;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed.";
    await supabaseAdmin
      .from("generations")
      .update({ status: "failed", error: msg, updated_at: new Date().toISOString() })
      .eq("id", generationId);
    throw err;
  }
}

/**
 * Generates ONE missing bundle portrait per call to stay within CF Workers
 * 128 MB memory limit. Called repeatedly by checkBundleReady polling until
 * the 2 non-chosen styles are done — each invocation handles one style.
 *
 * Returns true if a portrait was generated, false if nothing was needed.
 */
export async function generateNextBundlePortrait(orderId: string, userId: string, env: CloudflareEnv): Promise<boolean> {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured.");

  const { data: primaryItem } = await supabaseAdmin
    .from("order_items")
    .select("generation_id")
    .eq("order_id", orderId)
    .contains("options", { type: "digital_download" })
    .maybeSingle();
  if (!primaryItem?.generation_id) throw new Error("No primary generation found for order.");

  const { data: gen } = await supabaseAdmin
    .from("generations")
    .select("generation_params, uploaded_image_id")
    .eq("id", primaryItem.generation_id)
    .single();
  if (!gen?.generation_params) throw new Error("generation_params missing — portrait was generated before bundle feature.");

  const params = gen.generation_params as GenerationInput;
  const originalStyle = (params.artStyleId ?? "oil-painting") as ArtStyle;
  const otherStyles = ALL_ART_STYLES.filter(s => s !== originalStyle);

  // Find the first missing style
  let nextStyle: ArtStyle | null = null;
  for (const artStyleId of otherStyles) {
    const { data: existing } = await supabaseAdmin
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .contains("options", { type: "bundle_portrait", art_style: artStyleId })
      .maybeSingle();
    if (!existing) {
      nextStyle = artStyleId;
      break;
    }
  }

  if (!nextStyle) {
    console.log("[bundle] all styles already generated, nothing to do");
    return false;
  }

  const { data: uploadedImg } = await supabaseAdmin
    .from("uploaded_images")
    .select("storage_path")
    .eq("id", gen.uploaded_image_id!)
    .single();
  if (!uploadedImg?.storage_path) throw new Error("Uploaded image not found.");

  // Pre-create the generation row and claim the order_items slot BEFORE the expensive
  // OpenAI work. This prevents concurrent checkBundleReady calls from both picking the
  // same style when the generation takes longer than the 10-second poll interval.
  const bundleParams = { ...params, artStyleId: nextStyle } as GenerationInput & { artStyleId: string };
  const bundlePrompt = buildPrompt(bundleParams);
  const { data: preGenRow, error: preGenErr } = await supabaseAdmin
    .from("generations")
    .insert({
      user_id: userId,
      uploaded_image_id: gen.uploaded_image_id!,
      theme: (params as any).themeId,
      prompt: bundlePrompt,
      status: "processing",
      generation_params: bundleParams as any,
    })
    .select("id")
    .single();
  if (preGenErr || !preGenRow) throw new Error(`Could not pre-create generation: ${preGenErr?.message}`);

  const { error: claimErr } = await supabaseAdmin.from("order_items").insert({
    order_id: orderId,
    generation_id: preGenRow.id,
    quantity: 1,
    unit_price_cents: 0,
    options: { type: "bundle_portrait", art_style: nextStyle },
  });

  if (claimErr) {
    // Clean up the orphaned generations row regardless of error type.
    await supabaseAdmin
      .from("generations")
      .update({ status: "failed", error: `bundle claim failed: ${claimErr.message}` })
      .eq("id", preGenRow.id);
    if (claimErr.code === "23505") {
      // Unique constraint violation: another concurrent Worker already claimed this
      // style. Nothing to do — the other invocation will handle generation.
      console.log(`[bundle] ${nextStyle}: already claimed by concurrent call (23505) — skipping`);
      return false;
    }
    throw new Error(`Could not claim style slot: ${claimErr.message}`);
  }

  console.log(`[bundle] orderId=${orderId} slot claimed style=${nextStyle} genId=${preGenRow.id}`);
  console.log(`[bundle] storage_path=${uploadedImg.storage_path}`);

  try {
    await runPortraitGeneration({
      uploadedImagePath: uploadedImg.storage_path,
      uploadedImageId: gen.uploaded_image_id!,
      userId,
      params: bundleParams,
      apiKey,
      generationId: preGenRow.id,
    });
    console.log(`[bundle] ${nextStyle}: succeeded genId=${preGenRow.id}`);
    return true;
  } catch (err) {
    console.error(`[bundle] ${nextStyle}: FAILED —`, err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function getBundlePortraitStatus(orderId: string, userId: string): Promise<{
  ready: boolean;
  portraits: BundlePortrait[];
}> {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, wants_bundle")
    .eq("id", orderId)
    .single();
  if (!order || order.user_id !== userId) return { ready: false, portraits: [] };
  if (!(order as any).wants_bundle) return { ready: false, portraits: [] };

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("generation_id, options")
    .eq("order_id", orderId)
    .contains("options", { type: "bundle_portrait" });

  const genIds = (items ?? []).map(i => i.generation_id).filter(Boolean) as string[];
  if (genIds.length === 0) return { ready: false, portraits: [] };

  const { data: gens } = await supabaseAdmin
    .from("generations")
    .select("id, status, clean_path, generation_params")
    .in("id", genIds);

  const portraits: BundlePortrait[] = await Promise.all(
    (gens ?? []).map(async (gen) => {
      const params = gen.generation_params as GenerationInput | null;
      const artStyle = params?.artStyleId ?? "oil-painting";
      let downloadUrl: string | null = null;
      if (gen.status === "completed" && gen.clean_path) {
        const { data } = await supabaseAdmin.storage
          .from("caricatures-clean")
          .createSignedUrl(gen.clean_path, 3600);
        downloadUrl = data?.signedUrl ?? null;
      }
      return {
        generationId: gen.id,
        artStyle,
        artStyleLabel: ART_STYLE_LABELS[artStyle] ?? artStyle,
        downloadUrl,
        status: gen.status,
      };
    }),
  );

  const ready = portraits.length === 2 && portraits.every(p => p.status === "completed");
  return { ready, portraits };
}
