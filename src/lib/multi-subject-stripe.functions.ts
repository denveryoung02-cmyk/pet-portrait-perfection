/**
 * Multi-subject (owner+pet) checkout — Step 5 of the owner+pet build plan.
 *
 * A sibling to createCheckoutSession (src/lib/stripe.functions.ts), not a
 * modification of it — the live single-pet checkout path is untouched.
 * Fixed price per tier (no per-subject metering, no Stripe Price IDs),
 * built inline with price_data the same way createCheckoutSession does.
 *
 * metadata.orderType = "multi_subject" is the flag the webhook (server.ts)
 * and confirmCheckout (fulfillment.functions.ts) read to record the order
 * with orders.order_type = 'multi_subject' and skip Hero Pack generation.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TIER_PRICES_CENTS = {
  solo: 299,
  family: 499,
  full_house: 699,
} as const;

const TIER_LABELS = {
  solo: "Solo (1 person + 1 pet)",
  family: "Family (up to 2 people + 2 pets)",
  full_house: "Full House (up to 3 people + 3 pets)",
} as const;

const InputSchema = z.object({
  generationId: z.string().uuid(),
  tier: z.enum(["solo", "family", "full_house"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const createMultiSubjectCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const stripeSecretKey = context.env?.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const unitAmount = TIER_PRICES_CENTS[data.tier];
    const params = new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][product_data][name]": `Pawtoons — Group Portrait (${TIER_LABELS[data.tier]})`,
      "line_items[0][price_data][product_data][description]":
        "Instant digital delivery of your combined owner + pet AI portrait. High-resolution PNG.",
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": data.successUrl,
      "cancel_url": data.cancelUrl,
      "metadata[generationId]": data.generationId,
      "metadata[orderType]": "multi_subject",
      "metadata[tier]": data.tier,
      "allow_promotion_codes": "true",
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Stripe error: ${(err as any)?.error?.message ?? res.statusText}`);
    }

    const session = await res.json();
    return { url: session.url as string, sessionId: session.id as string };
  });
