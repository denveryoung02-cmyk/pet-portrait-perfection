/**
 * Server function: run an AI image generation via the Google Gemini API,
 * persist the result to the public `caricatures` storage bucket,
 * and write a row in `generations`.
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
  themeId: z.string().min(1).max(64),
  themeName: z.string().max(128).optional(),
  personalityId: z.string().min(1).max(64),
  personalityName: z.string().max(128).optional(),
  personalityDesc: z.string().max(280).optional(),
  traits: z.array(z.string().min(1).max(48)).max(8).optional(),
  petType: z.string().max(64).optional(),
  petName: z.string().max(64).optional(),
});

const GEMINI_MODEL = "gemini-2.5-flash-image";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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
    if (imgErr || !img) throw new Error("Uploaded image not found or not accessible.");

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

      // 4. Call Google Gemini API for image generation
      const apiKey = import.meta.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

      const aiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            temperature: 1,
          },
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text().catch(() => "");
        if (aiRes.status === 429) throw new Error("Rate limit reached — please try again in a minute.");
        if (aiRes.status === 403) throw new Error("Gemini API key invalid or not authorised.");
        throw new Error(`Gemini API error (${aiRes.status}): ${errText.slice(0, 300)}`);
      }

      const payload = await aiRes.json();

      // Extract the base64 image from Gemini's response
      const parts = payload?.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));

      if (!imagePart?.inlineData?.data) {
        const textPart = parts.find((p: any) => p.text);
        throw new Error(
          textPart?.text
            ? `Gemini declined: ${textPart.text.slice(0, 200)}`
            : "Gemini did not return an image — try a clearer pet photo."
        );
      }

      const resultBase64 = imagePart.inlineData.data;
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