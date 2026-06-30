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
import { sendOrderConfirmationEmail } from "@/lib/email.server";
import { generateNextBundlePortrait, getBundlePortraitStatus } from "@/lib/bundle.server";

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
      .select("user_id, theme")
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
    });
    const downloadUrl = await signCleanDownloadUrl(generationId);

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
            await sendOrderConfirmationEmail({
              to: customerEmail,
              name: authData.user?.user_metadata?.full_name ?? null,
              theme: gen.theme ?? "portrait",
              downloadUrl: emailDownloadUrl,
              resendApiKey: resendKey,
            });
            console.log("[email/confirmCheckout] email sent successfully");
          }
        }
      }
    } catch (emailErr) {
      console.error("[email/confirmCheckout] Failed to send order confirmation email:", emailErr);
    }

    return { paid: true as const, downloadUrl, orderId, wantsBundle: session.wantsBundle };
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
    const status = await getBundlePortraitStatus(data.orderId, userId);
    if (!status.ready && status.portraits.length < 2) {
      // Generate the next missing style in this invocation (one at a time).
      try {
        await generateNextBundlePortrait(data.orderId, userId, env);
      } catch (err) {
        console.error("[bundle] checkBundleReady generation error:", err instanceof Error ? err.message : err);
      }
      // Re-fetch status after generation attempt.
      return getBundlePortraitStatus(data.orderId, userId);
    }

    return status;
  });
