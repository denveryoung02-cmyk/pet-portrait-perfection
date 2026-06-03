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
import { getEnv } from "@/lib/env.server";

const InputSchema = z.object({
  uploadedImageId: z.string().uuid(),
  themeId: z.string().min(1).max(64),
  themeName: z.string().max(128).optional(),
  personalityId: z.string().min(1).max(64),
  personalityName: z.string().max(128).optional(),
  personalityDesc: z.string().max(280).optional(),
  traits: z.array(z.string().min(1).max(48)).max(8).optional(),
  petType: z.string().max(64).optional(),
  petName: z.string().max(64).optional(),
});

const OPENAI_VISION_MODEL = "gpt-4o";
const OPENAI_IMAGE_MODEL = "dall-e-3";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

export const generatePawtoon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Load the uploaded image (owner-scoped via RLS)
    console.log('[generatePawtoon] Looking for uploadedImageId:', data.uploadedImageId, 'userId:', userId);
    const { data: img, error: imgErr } = await supabase
      .from("uploaded_images")
      .select("id, storage_path")
      .eq("id", data.uploadedImageId)
      .single();
    console.log('[generatePawtoon] Query result - img:', !!img, 'error:', imgErr?.message);
    if (imgErr || !img) {
      console.error('[generatePawtoon] Failed to fetch uploaded image:', imgErr);
      throw new Error(`Uploaded image not found or not accessible: ${imgErr?.message ?? 'no data'}`);
    }

    // 2. Build prompt and insert a generations row in processing state
    const prompt = buildPrompt({
      petType: data.petType,
      themeId: data.themeId,
      themeName: data.themeName,
      personalityId: data.personalityId,
      personalityName: data.personalityName,
      personalityDesc: data.personalityDesc,
      traits: data.traits,
      petName: data.petName,
    });

    const { data: genRow, error: insErr } = await supabase
      .from("generations")
      .insert({
        user_id: userId,
        uploaded_image_id: img.id,
        theme: data.themeId,
        prompt,
        status: "processing",
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
      const env = getEnv();
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Get your key from https://platform.openai.com/api-keys");

      // Step 4a: Analyze pet photo with GPT-4 Vision
      console.log('[generatePawtoon] Step 1: Analyzing pet photo with GPT-4 Vision...');
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

      console.log('[generatePawtoon] Pet analysis:', petDescription);

      // Step 4b: Generate portrait with DALL-E 3 using enhanced prompt
      console.log('[generatePawtoon] Step 2: Generating portrait with DALL-E 3...');
      const enhancedPrompt = `${prompt}

Pet details from photo: ${petDescription}

Important: Create a portrait that captures this specific pet's unique characteristics (breed, colors, features) in the requested artistic style.`;

      const dalleRes = await fetch(OPENAI_IMAGE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_IMAGE_MODEL,
          prompt: enhancedPrompt.slice(0, 4000), // DALL-E 3 has 4000 char limit
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "b64_json",
        }),
      });

      if (!dalleRes.ok) {
        const errText = await dalleRes.text().catch(() => "");
        if (dalleRes.status === 429) throw new Error("OpenAI rate limit reached — please try again in a minute.");
        if (dalleRes.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
        if (dalleRes.status === 400) throw new Error("OpenAI rejected the prompt — try a different theme or personality.");
        throw new Error(`OpenAI DALL-E 3 error (${dalleRes.status}): ${errText.slice(0, 300)}`);
      }

      const dalleData = await dalleRes.json();
      const resultBase64 = dalleData.data?.[0]?.b64_json;

      if (!resultBase64) {
        throw new Error("DALL-E 3 did not return an image — please try again.");
      }

      console.log('[generatePawtoon] Generation successful');
      const resultBytes = Buffer.from(resultBase64, "base64");

      // 5a. Store the CLEAN original in the private bucket (never public).
      const cleanPath = `${userId}/${generationId}.png`;
      const { error: cleanErr } = await supabaseAdmin.storage
        .from("caricatures-clean")
        .upload(cleanPath, resultBytes, { contentType: "image/png", upsert: true });
      if (cleanErr) throw new Error(`Could not save result: ${cleanErr.message}`);

      // 5b. Bake a watermark and store the PREVIEW in the public bucket.
      const previewBytes = bakeWatermark(new Uint8Array(resultBytes));
      const previewPath = `${userId}/${generationId}.png`;
      const { error: prevErr } = await supabaseAdmin.storage
        .from("caricature-previews")
        .upload(previewPath, previewBytes, { contentType: "image/png", upsert: true });
      if (prevErr) throw new Error(`Could not save preview: ${prevErr.message}`);

      const { data: pub } = supabaseAdmin.storage
        .from("caricature-previews")
        .getPublicUrl(previewPath);

      // 6. Mark generation as completed — store the public preview URL and the
      // private clean path (the clean image is released only via signed URL
      // after payment). No public URL to the clean original is ever stored.
      const { error: upErr } = await supabaseAdmin
        .from("generations")
        .update({
          status: "completed",
          preview_url: pub.publicUrl,
          clean_path: cleanPath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", generationId);
      if (upErr) throw new Error(upErr.message);

      return { generationId, status: "completed" as const, previewUrl: pub.publicUrl };

    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      await supabaseAdmin
        .from("generations")
        .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
        .eq("id", generationId);
      return { generationId, status: "failed" as const, previewUrl: null, error: message };
    }
  });