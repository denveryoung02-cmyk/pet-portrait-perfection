/**
 * Server function: run an AI image generation via OpenAI (GPT-4 Vision + DALL-E 3),
 * persist the result to the public `caricatures` storage bucket,
 * and write a row in `generations`.
 *
 * Two-step process:
 * 1. GPT-4 Vision analyzes uploaded pet photo (breed, colors, features)
 * 2. DALL-E 3 generates stylized portrait using enhanced prompt
 *
 * Called from the wizard's "Generate" step. Authenticated.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildPrompt } from "@/services/prompts";
import { bakeWatermark } from "@/lib/watermark.server";

const InputSchema = z.object({
  uploadedImageId: z.string().uuid(),
  artStyleId: z.string().min(1).max(64).optional(),
  themeId: z.string().min(1).max(64),
  themeName: z.string().max(128).optional(),
  personalityId: z.string().min(1).max(64),
  personalityName: z.string().max(128).optional(),
  personalityDesc: z.string().max(280).optional(),
  traits: z.array(z.string().min(1).max(48)).max(8).optional(),
  petType: z.string().max(64).optional(),
  petName: z.string().max(64).optional(),
  personalisationText: z.string().max(30).optional(),
});

const OPENAI_VISION_MODEL = "gpt-4o";
const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

export const generatePawtoon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Load the uploaded image (owner-scoped via RLS)
    const { data: img, error: imgErr } = await supabase
      .from("uploaded_images")
      .select("id, storage_path")
      .eq("id", data.uploadedImageId)
      .single();
    if (imgErr || !img) {
      throw new Error(`Uploaded image not found or not accessible: ${imgErr?.message ?? 'no data'}`);
    }

    // 2. Build prompt and insert a generations row in processing state
    const prompt = buildPrompt({
      petType: data.petType,
      artStyleId: data.artStyleId,
      themeId: data.themeId,
      themeName: data.themeName,
      personalityId: data.personalityId,
      personalityName: data.personalityName,
      personalityDesc: data.personalityDesc,
      traits: data.traits,
      petName: data.petName,
      personalisationText: data.personalisationText,
    });

    const { data: genRow, error: insErr } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        uploaded_image_id: img.id,
        theme: data.themeId,
        prompt,
        status: "processing",
        generation_params: {
          artStyleId: data.artStyleId,
          themeId: data.themeId,
          themeName: data.themeName,
          personalityId: data.personalityId,
          personalityName: data.personalityName,
          personalityDesc: data.personalityDesc,
          traits: data.traits,
          petType: data.petType,
          petName: data.petName,
          personalisationText: data.personalisationText,
        },
      })
      .select("id")
      .single();
    if (insErr || !genRow) throw new Error(`Could not queue generation: ${insErr?.message}`);

    const generationId = genRow.id as string;

    try {
      // 3. Download the source pet photo via admin client (bypasses RLS)
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from("pet-uploads")
        .download(img.storage_path);
      if (dlErr || !blob) throw new Error(`Could not load source photo: ${dlErr?.message}`);

      const arrayBuf = await blob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuf).toString("base64");
      const mimeType = (blob.type || "image/jpeg") as string;

      // 4. Two-step OpenAI process: Analyze pet photo, then generate portrait
      const env = context.env;
      const apiKey = env?.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Get your key from https://platform.openai.com/api-keys");

      // Step 4a: Analyze pet photo with GPT-4 Vision
      const visionRes = await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_VISION_MODEL,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this pet photo in detail. Describe: species (dog/cat/other), breed or breed mix if identifiable, coat color and pattern, distinctive physical features (ears, eyes, markings), apparent size, and current pose/expression. Be specific and concise (3-4 sentences max). Focus on visual details that would help an artist recreate this specific pet.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!visionRes.ok) {
        const errText = await visionRes.text().catch(() => "");
        if (visionRes.status === 429) throw new Error("OpenAI rate limit reached — please try again in a minute.");
        if (visionRes.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
        throw new Error(`OpenAI Vision API error (${visionRes.status}): ${errText.slice(0, 300)}`);
      }

      const visionData = await visionRes.json();
      const petDescription = visionData.choices?.[0]?.message?.content;

      if (!petDescription) {
        throw new Error("GPT-4 Vision did not return a pet description — try a clearer photo.");
      }

      // Step 4b: Generate v1 (Cinematic Edition) — v2/v3 are fired separately by the client
      const v1Prompt = buildPrompt({
        petType: data.petType,
        artStyleId: data.artStyleId,
        themeId: data.themeId,
        themeName: data.themeName,
        personalityId: data.personalityId,
        personalityName: data.personalityName,
        personalityDesc: data.personalityDesc,
        traits: data.traits,
        petName: data.petName,
        personalisationText: data.personalisationText,
      });
      const enhancedPrompt = `${v1Prompt}\n\nPet details from photo: ${petDescription}\n\nImportant: Create a portrait that captures this specific pet's unique characteristics (breed, colors, features) in the requested artistic style.`;

      const imageRes = await fetch(OPENAI_IMAGE_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OPENAI_IMAGE_MODEL,
          prompt: enhancedPrompt.slice(0, 4000),
          n: 1,
          size: "1024x1024",
          quality: "medium",
        }),
      });
      if (!imageRes.ok) {
        const errText = await imageRes.text().catch(() => "");
        console.error("[generatePawtoon] DALL-E error:", imageRes.status, errText);
        if (imageRes.status === 429) throw new Error("OpenAI rate limit reached — please try again in a minute.");
        if (imageRes.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
        throw new Error(`OpenAI error (${imageRes.status}): ${errText.slice(0, 300)}`);
      }
      const dalleData = await imageRes.json();
      const imageUrl = dalleData.data?.[0]?.url;
      const imageB64 = dalleData.data?.[0]?.b64_json;
      if (!imageUrl && !imageB64) throw new Error("DALL-E did not return an image.");

      let bytes_v1: Uint8Array;
      if (imageB64) {
        const binaryString = atob(imageB64);
        bytes_v1 = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes_v1[i] = binaryString.charCodeAt(i);
      } else {
        const imgRes = await fetch(imageUrl!);
        if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.statusText}`);
        bytes_v1 = new Uint8Array(await imgRes.arrayBuffer());
      }

      // 5. Store v1 — clean original + watermarked preview
      const v1CleanPath = `${userId}/${generationId}-v1.png`;
      const { error: cleanErr } = await supabaseAdmin.storage
        .from("caricatures-clean")
        .upload(v1CleanPath, bytes_v1, { contentType: "image/png", upsert: true });
      if (cleanErr) throw new Error(`Could not save clean image: ${cleanErr.message}`);

      const previewBytes = bakeWatermark(new Uint8Array(bytes_v1));
      const v1PreviewPath = `${userId}/${generationId}-v1.png`;
      const { error: prevErr } = await supabaseAdmin.storage
        .from("caricature-previews")
        .upload(v1PreviewPath, previewBytes, { contentType: "image/png", upsert: true });
      if (prevErr) throw new Error(`Could not save preview: ${prevErr.message}`);

      const { data: pub } = supabaseAdmin.storage.from("caricature-previews").getPublicUrl(v1PreviewPath);
      const v1PreviewUrl = pub.publicUrl;

      // 6. Mark generation completed. petDescription stored for use by generateVariant calls.
      const { error: upErr } = await supabaseAdmin
        .from("generations")
        .update({
          status: "completed",
          preview_url: v1PreviewUrl,
          clean_path: v1CleanPath,
          generation_params: {
            artStyleId: data.artStyleId,
            themeId: data.themeId,
            themeName: data.themeName,
            personalityId: data.personalityId,
            personalityName: data.personalityName,
            personalityDesc: data.personalityDesc,
            traits: data.traits,
            petType: data.petType,
            petName: data.petName,
            personalisationText: data.personalisationText,
            petDescription,
            variantPreviews: { v1: v1PreviewUrl },
            variantCleanPaths: { v1: v1CleanPath },
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", generationId);
      if (upErr) throw new Error(upErr.message);

      return {
        generationId,
        status: "completed" as const,
        previewUrl: v1PreviewUrl,
        previewUrls: { v1: v1PreviewUrl },
      };

    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      await supabaseAdmin
        .from("generations")
        .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
        .eq("id", generationId);
      return { generationId, status: "failed" as const, previewUrl: null, error: message };
    }
  });

