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

const InputSchema = z.object({
  sessionId: z.string().min(1),
  generationId: z.string().uuid(),
});

export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { sessionId, generationId } = data;

    // The generation must belong to the caller.
    const { data: gen } = await supabaseAdmin
      .from("generations")
      .select("user_id")
      .eq("id", generationId)
      .single();
    if (!gen || gen.user_id !== userId) {
      return { paid: false as const, downloadUrl: null };
    }

    // Verify the Stripe session is genuinely paid for THIS generation.
    const session = await retrieveStripeSession(sessionId);
    if (!session.paid || session.generationId !== generationId) {
      return { paid: false as const, downloadUrl: null };
    }

    // Record the order (idempotent) and release the clean image via signed URL.
    await recordPaidOrder({
      sessionId,
      generationId,
      amountTotalCents: session.amountTotalCents,
    });
    const downloadUrl = await signCleanDownloadUrl(generationId);

    return { paid: true as const, downloadUrl };
  });
