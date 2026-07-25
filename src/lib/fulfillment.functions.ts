/**
 * Server function called by the success page to verify payment and release
 * the clean image. This is the synchronous, user-facing half of fulfillment;
 * the Stripe webhook (server.ts) is the authoritative async half. Both record
 * the order idempotently.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  retrieveStripeSession,
  recordPaidOrder,
  signCleanDownloadUrl,
} from "@/lib/fulfillment.server";
import { sendOrderConfirmationEmail, sendBundleReadyEmail } from "@/lib/email.server";
import { generateNextBundlePortrait, getBundlePortraitStatus, type BundlePortrait } from "@/lib/bundle.server";
import { generateHeroPack } from "@/lib/hero-pack.server";
import { getExecutionCtx, type CloudflareEnv } from "@/lib/env.server";

const InputSchema = z.object({
  sessionId: z.string().min(1),
  generationId: z.string().uuid(),
});

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId, env } = context;
    const { sessionId, generationId } = data;

    // The generation must belong to the caller.
    const { data: gen } = await supabaseAdmin
      .from("generations")
      .select("user_id, theme, generation_params")
      .eq("id", generationId)
      .single();
    if (!gen || gen.user_id !== userId) {
      return { paid: false as const, downloadUrl: null, orderId: null, wantsBundle: false };
    }

    // Verify the Stripe session is genuinely paid for THIS generation.
    const session = await retrieveStripeSession(sessionId, env);
    if (!session.paid || session.generationId !== generationId) {
      return { paid: false as const, downloadUrl: null, orderId: null, wantsBundle: false };
    }

    // Record the order (idempotent) and release the clean image via signed URL.
    const { orderId } = await recordPaidOrder({
      sessionId,
      generationId,
      amountTotalCents: session.amountTotalCents,
      wantsBundle: session.wantsBundle,
      orderType: session.orderType,
    });
    const downloadUrl = await signCleanDownloadUrl(generationId);

    // Hero Pack (certificate/card/wallpaper) only applies to the single-pet
    // flow — multi-subject orders never generate one.
    if (session.orderType !== "multi_subject") {
      // Fire-and-forget: Hero Pack generation must not delay this response.
      // generateHeroPack is idempotent per order_id, so it's safe to also
      // trigger it from the Stripe webhook (src/server.ts) — whichever of the
      // two fires first wins, the other exits immediately.
      const heroPackPromise = generateHeroPack(orderId, generationId, env).catch((err) => {
        console.error("[hero-pack] generation failed (confirmCheckout trigger):", {
          orderId,
          generationId,
          error: err instanceof Error ? err.message : err,
        });
      });
      getExecutionCtx()?.waitUntil(heroPackPromise);
    }

    // Send confirmation email (best-effort — failure does not affect the download URL).
    try {
      const resendKey = env?.RESEND_API_KEY;
      console.log("[email/confirmCheckout] RESEND_API_KEY present:", !!resendKey);
      if (resendKey) {
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
        const customerEmail = authData?.user?.email;
        console.log("[email/confirmCheckout] customerEmail:", customerEmail ?? "(none)");
        if (customerEmail) {
          const emailDownloadUrl = await signCleanDownloadUrl(generationId, 86400);
          console.log("[email/confirmCheckout] emailDownloadUrl generated:", !!emailDownloadUrl);
          if (emailDownloadUrl) {
            const petName = (gen.generation_params as { petName?: string } | null)?.petName ?? null;
            await sendOrderConfirmationEmail({
              to: customerEmail,
              name: authData.user?.user_metadata?.full_name ?? null,
              theme: gen.theme ?? "portrait",
              downloadUrl: emailDownloadUrl,
              resendApiKey: resendKey,
              orderId,
              petName,
            });
            console.log("[email/confirmCheckout] email sent successfully");
          }
        }
      }
    } catch (emailErr) {
      console.error("[email/confirmCheckout] Failed to send order confirmation email:", emailErr);
    }

    return { paid: true as const, downloadUrl, orderId, wantsBundle: session.wantsBundle, orderType: session.orderType };
  });

const CheckBundleInput = z.object({
  orderId: z.string().uuid(),
});

/**
 * Polled by the success page every 10 s. On each call it generates ONE missing
 * bundle style (if any remain), then returns status for all portraits.
 * Splitting into one-per-invocation keeps each Worker call within the 128 MB
 * memory limit — two sequential generations in one invocation exceeds it.
 */
export const checkBundleReady = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CheckBundleInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId, env } = context;

    // Verify ownership and get current status.
    let status = await getBundlePortraitStatus(data.orderId, userId);
    if (!status.ready && status.portraits.length < 2) {
      // Generate the next missing style in this invocation (one at a time).
      try {
        await generateNextBundlePortrait(data.orderId, userId, env);
      } catch (err) {
        console.error("[bundle] checkBundleReady generation error:", err instanceof Error ? err.message : err);
      }
      // Re-fetch status after generation attempt.
      status = await getBundlePortraitStatus(data.orderId, userId);
    }

    if (status.ready) {
      await sendBundleReadyEmailIfNeeded(data.orderId, userId, status.portraits, env);
    }

    return status;
  });

/**
 * Sends the "your 2 extra styles are ready" email the first time an order's
 * bundle finishes, guarded by orders.bundle_email_sent. The flag is only set
 * after a successful send, so a failed send is retried on a later poll
 * (unless that poll is also the one where ready first became true).
 */
async function sendBundleReadyEmailIfNeeded(
  orderId: string,
  userId: string,
  portraits: BundlePortrait[],
  env: CloudflareEnv,
): Promise<void> {
  const resendKey = env?.RESEND_API_KEY;
  if (!resendKey) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("bundle_email_sent")
    .eq("id", orderId)
    .single();
  if (!order || order.bundle_email_sent) return;

  const items = portraits
    .filter((p): p is BundlePortrait & { downloadUrl: string } => !!p.downloadUrl)
    .map((p) => ({ label: p.artStyleLabel, downloadUrl: p.downloadUrl }));
  if (items.length === 0) return;

  try {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const customerEmail = authData?.user?.email;
    if (!customerEmail) return;

    // hero_profiles.pet_name is denormalized at Hero Pack generation time —
    // may not exist yet if that background job hasn't finished, which is
    // fine, the email just falls back to "your pet's Hero Pack".
    const { data: heroProfile } = await supabaseAdmin.from("hero_profiles").select("pet_name").eq("order_id", orderId).maybeSingle();

    await sendBundleReadyEmail({
      to: customerEmail,
      name: authData.user?.user_metadata?.full_name ?? null,
      items,
      resendApiKey: resendKey,
      orderId,
      petName: heroProfile?.pet_name ?? null,
    });

    const { error: flagError } = await supabaseAdmin
      .from("orders")
      .update({ bundle_email_sent: true })
      .eq("id", orderId);
    if (flagError) {
      console.error("[bundle-email] Failed to set bundle_email_sent flag:", { orderId, error: flagError });
    }
  } catch (err) {
    console.error("[bundle-email] Failed to send bundle-ready email:", err instanceof Error ? err.message : err);
  }
}
