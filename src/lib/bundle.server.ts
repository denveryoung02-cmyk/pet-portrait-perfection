import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildPrompt, type GenerationInput } from "@/services/prompts";
import { bakeWatermark } from "@/lib/watermark.server";
import type { CloudflareEnv } from "@/lib/env.server";

const ALL_ART_STYLES = ["oil-painting", "pixar-3d", "comic-book", "graffiti-splash"] as const;
type ArtStyle = (typeof ALL_ART_STYLES)[number];

const ART_STYLE_LABELS: Record<string, string> = {
  "oil-painting": "Oil Painting",
  "pixar-3d": "Pixar 3D",
  "comic-book": "Comic Book",
  "graffiti-splash": "Graffiti Splash",
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

    const { error: updateErr } = await supabaseAdmin
      .from("generations")
      .update({ status: "completed", preview_url: pub.publicUrl, clean_path: cleanPath, updated_at: new Date().toISOString() })
      .eq("id", generationId);
    if (updateErr) {
      console.error("[bundle] Failed to mark generation completed:", {
        generationId,
        error: updateErr,
      });
    }

    return generationId;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed.";
    const { error: updateErr } = await supabaseAdmin
      .from("generations")
      .update({ status: "failed", error: msg, updated_at: new Date().toISOString() })
      .eq("id", generationId);
    if (updateErr) {
      console.error("[bundle] Failed to mark generation failed:", {
        generationId,
        error: updateErr,
      });
    }
    throw err;
  }
}

/** Extra portraits in a bundle: every style except the one the customer chose. */
export const BUNDLE_EXTRA_COUNT = ALL_ART_STYLES.length - 1;
/** Total tries per style (first attempt + 2 retries) before it is shown as failed. */
const BUNDLE_MAX_ATTEMPTS = 3;
/**
 * A Worker invocation cannot outlive its 120 s wall-clock limit, so a generation
 * still "processing" after this long was killed mid-run (e.g. exceeded memory)
 * and will never finish on its own.
 */
const STALE_PROCESSING_MS = 130_000;

type BundleItem = {
  itemId: string;
  generationId: string | null;
  artStyle: string;
  attempts: number;
  status: string | null;
  createdAt: string | null;
  cleanPath: string | null;
};

async function loadBundleItems(orderId: string): Promise<BundleItem[]> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("id, generation_id, options")
    .eq("order_id", orderId)
    .contains("options", { type: "bundle_portrait" });

  const genIds = (items ?? []).map(i => i.generation_id).filter(Boolean) as string[];
  const { data: gens } = genIds.length
    ? await supabaseAdmin.from("generations").select("id, status, created_at, clean_path").in("id", genIds)
    : { data: [] };
  const gensById = new Map((gens ?? []).map(g => [g.id, g]));

  return (items ?? []).map((item) => {
    const options = item.options as { art_style?: string; attempts?: number };
    const gen = item.generation_id ? gensById.get(item.generation_id) : undefined;
    return {
      itemId: item.id,
      generationId: item.generation_id,
      artStyle: options.art_style ?? "oil-painting",
      attempts: options.attempts ?? 1,
      status: gen?.status ?? null,
      createdAt: gen?.created_at ?? null,
      cleanPath: gen?.clean_path ?? null,
    };
  });
}

function isStaleProcessing(item: BundleItem): boolean {
  return item.status === "processing"
    && !!item.createdAt
    && Date.now() - new Date(item.createdAt).getTime() > STALE_PROCESSING_MS;
}

/** Failed, or killed mid-run — either way it will not complete without a retry. */
function isDead(item: BundleItem): boolean {
  return item.status === "failed" || isStaleProcessing(item);
}

/**
 * Generates ONE bundle portrait per call, and only when no other portrait for
 * the order is mid-generation. Concurrent generations can land in the same
 * Worker isolate and together exceed its 128 MB memory limit, which kills
 * every in-flight request at once. Called repeatedly by checkBundleReady
 * polling until every non-chosen style is done; a style whose generation
 * failed or was killed is retried up to BUNDLE_MAX_ATTEMPTS in total.
 *
 * Returns true if a portrait was generated, false if nothing was started.
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

  const items = await loadBundleItems(orderId);

  if (items.some(i => i.status === "processing" && !isStaleProcessing(i))) {
    console.log(`[bundle] orderId=${orderId} a portrait is already generating — waiting`);
    return false;
  }

  // Record killed generations as failed so their state is visible in the DB.
  for (const item of items.filter(isStaleProcessing)) {
    const { error: staleErr } = await supabaseAdmin
      .from("generations")
      .update({ status: "failed", error: "Generation did not finish (Worker terminated)", updated_at: new Date().toISOString() })
      .eq("id", item.generationId!)
      .eq("status", "processing");
    if (staleErr) {
      console.error("[bundle] Failed to mark stale generation as failed:", { generationId: item.generationId, error: staleErr });
    }
  }

  // New styles first, then retries of dead ones.
  const claimedStyles = new Set(items.map(i => i.artStyle));
  const newStyle = otherStyles.find(s => !claimedStyles.has(s)) ?? null;
  const retryItem = newStyle ? null : items.find(i => isDead(i) && i.attempts < BUNDLE_MAX_ATTEMPTS) ?? null;
  const nextStyle = newStyle ?? retryItem?.artStyle ?? null;

  if (!nextStyle) {
    console.log("[bundle] nothing left to generate");
    return false;
  }

  const { data: uploadedImg } = await supabaseAdmin
    .from("uploaded_images")
    .select("storage_path")
    .eq("id", gen.uploaded_image_id!)
    .single();
  if (!uploadedImg?.storage_path) throw new Error("Uploaded image not found.");

  // Pre-create the generation row and claim the order_items slot BEFORE the expensive
  // OpenAI work, so concurrent checkBundleReady calls (e.g. two open tabs) cannot
  // both pick the same style.
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

  let claimErr: { message: string; code?: string } | null = null;
  if (retryItem) {
    // Repoint the style's existing slot at the new generation. The generation_id
    // match means only one concurrent caller can win the retry.
    const { data: repointed, error } = await supabaseAdmin
      .from("order_items")
      .update({
        generation_id: preGenRow.id,
        options: { type: "bundle_portrait", art_style: nextStyle, attempts: retryItem.attempts + 1 },
      })
      .eq("id", retryItem.itemId)
      .eq("generation_id", retryItem.generationId!)
      .select("id");
    if (error) claimErr = error;
    else if (!repointed?.length) claimErr = { message: "retry already claimed by concurrent call", code: "23505" };
  } else {
    const { error } = await supabaseAdmin.from("order_items").insert({
      order_id: orderId,
      generation_id: preGenRow.id,
      quantity: 1,
      unit_price_cents: 0,
      options: { type: "bundle_portrait", art_style: nextStyle, attempts: 1 },
    });
    claimErr = error;
  }

  if (claimErr) {
    // Clean up the orphaned generations row regardless of error type.
    const { error: cleanupErr } = await supabaseAdmin
      .from("generations")
      .update({ status: "failed", error: `bundle claim failed: ${claimErr.message}` })
      .eq("id", preGenRow.id);
    if (cleanupErr) {
      console.error("[bundle] Failed to mark orphaned generation as failed:", {
        generationId: preGenRow.id,
        error: cleanupErr,
      });
    }
    if (claimErr.code === "23505") {
      // Unique constraint violation: another concurrent Worker already claimed this
      // style. Nothing to do — the other invocation will handle generation.
      console.log(`[bundle] ${nextStyle}: already claimed by concurrent call (23505) — skipping`);
      return false;
    }
    throw new Error(`Could not claim style slot: ${claimErr.message}`);
  }

  console.log(`[bundle] orderId=${orderId} slot claimed style=${nextStyle} genId=${preGenRow.id} attempt=${retryItem ? retryItem.attempts + 1 : 1}`);
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

/**
 * `ready`: every extra portrait completed. `settled`: nothing left to do —
 * every extra is completed or has used all its attempts — so polling can stop.
 * A dead portrait with attempts left is reported as "processing" because a
 * retry is coming.
 */
export async function getBundlePortraitStatus(orderId: string, userId: string): Promise<{
  ready: boolean;
  settled: boolean;
  portraits: BundlePortrait[];
}> {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, wants_bundle")
    .eq("id", orderId)
    .single();
  if (!order || order.user_id !== userId) return { ready: false, settled: true, portraits: [] };
  if (!(order as any).wants_bundle) return { ready: false, settled: true, portraits: [] };

  const items = (await loadBundleItems(orderId)).filter(i => i.generationId);
  if (items.length === 0) return { ready: false, settled: false, portraits: [] };

  const portraits: BundlePortrait[] = await Promise.all(
    items.map(async (item) => {
      let downloadUrl: string | null = null;
      if (item.status === "completed" && item.cleanPath) {
        const { data } = await supabaseAdmin.storage
          .from("caricatures-clean")
          .createSignedUrl(item.cleanPath, 3600);
        downloadUrl = data?.signedUrl ?? null;
      }
      const status = isDead(item)
        ? (item.attempts < BUNDLE_MAX_ATTEMPTS ? "processing" : "failed")
        : (item.status ?? "processing");
      return {
        generationId: item.generationId!,
        artStyle: item.artStyle,
        artStyleLabel: ART_STYLE_LABELS[item.artStyle] ?? item.artStyle,
        downloadUrl,
        status,
      };
    }),
  );

  const complete = portraits.length === BUNDLE_EXTRA_COUNT;
  const ready = complete && portraits.every(p => p.status === "completed");
  const settled = complete && portraits.every(p => p.status === "completed" || p.status === "failed");
  return { ready, settled, portraits };
}
