/**
 * Server function: run an AI image generation via the Lovable AI Gateway
 * (Nano Banana / Gemini image model), persist the result to the public
 * `caricatures` storage bucket, and write a row in `generations`.
 *
 * Called from the wizard's "Generate" step. Authenticated.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildPrompt } from "@/services/prompts";

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

const MODEL = "google/gemini-2.5-flash-image";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

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

    // 2. Insert a `generations` row in `processing` state immediately
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
      // 3. Download the source pet photo (admin client to bypass RLS server-side)
      const { data: blob, error: dlErr } = await supabaseAdmin.storage
        .from("pet-uploads")
        .download(img.storage_path);
      if (dlErr || !blob) throw new Error(`Could not load source photo: ${dlErr?.message}`);

      const arrayBuf = await blob.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString("base64");
      const mime = blob.type || "image/jpeg";
      const dataUrl = `data:${mime};base64,${base64}`;

      // 4. Call the AI Gateway (Nano Banana / Gemini image model)
      const apiKey = process.env.LOVABLE_API_KEY;
      if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured.");

      const aiRes = await fetch(GATEWAY_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text().catch(() => "");
        if (aiRes.status === 429) throw new Error("Rate limit reached — please try again in a minute.");
        if (aiRes.status === 402) throw new Error("Generation credits exhausted — top up your workspace.");
        throw new Error(`AI gateway error (${aiRes.status}): ${errText.slice(0, 200)}`);
      }

      const payload = await aiRes.json();
      const message = payload?.choices?.[0]?.message;

      // Gemini returns images either in message.images[0].image_url.url or as data URLs in content
      const imageUrl: string | undefined =
        message?.images?.[0]?.image_url?.url ??
        (Array.isArray(message?.content)
          ? message.content.find((c: any) => c?.type === "image_url")?.image_url?.url
          : undefined);

      if (!imageUrl || !imageUrl.startsWith("data:")) {
        throw new Error("AI did not return an image — try a clearer pet photo.");
      }

      // 5. Decode + upload to public `caricatures` bucket
      const [, b64part] = imageUrl.split(",", 2);
      const resultBytes = Buffer.from(b64part, "base64");
      const resultPath = `${userId}/${generationId}.png`;

      const { error: putErr } = await supabaseAdmin.storage
        .from("caricatures")
        .upload(resultPath, resultBytes, { contentType: "image/png", upsert: true });
      if (putErr) throw new Error(`Could not save result: ${putErr.message}`);

      const { data: pub } = supabaseAdmin.storage.from("caricatures").getPublicUrl(resultPath);

      // 6. Update generation row → completed
      const { error: upErr } = await supabaseAdmin
        .from("generations")
        .update({
          status: "completed",
          result_url: pub.publicUrl,
          storage_path: resultPath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", generationId);
      if (upErr) throw new Error(upErr.message);

      return { generationId, status: "completed" as const, resultUrl: pub.publicUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed.";
      await supabaseAdmin
        .from("generations")
        .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
        .eq("id", generationId);
      return { generationId, status: "failed" as const, resultUrl: null, error: message };
    }
  });
