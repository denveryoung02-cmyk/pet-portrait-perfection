import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getEnv } from "@/lib/env.server";

const InputSchema = z.object({
  generationId: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    console.log('[createCheckoutSession] Handler called, getting env...');
    const env = getEnv();
    console.log('[createCheckoutSession] Env retrieved, checking STRIPE_SECRET_KEY...');
    console.log('[createCheckoutSession] Env keys present:', Object.keys(env).join(', '));
    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    console.log('[createCheckoutSession] STRIPE_SECRET_KEY exists:', !!stripeSecretKey);
    if (!stripeSecretKey) {
      console.error('[createCheckoutSession] STRIPE_SECRET_KEY is undefined or null');
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const params = new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][product_data][name]": "Pawtoons — Digital Download",
      "line_items[0][price_data][product_data][description]": "Instant digital delivery of your AI pet portrait. High-resolution PNG.",
      "line_items[0][price_data][unit_amount]": "299",
      "line_items[0][quantity]": "1",
      "mode": "payment",
      "success_url": data.successUrl,
      "cancel_url": data.cancelUrl,
      "metadata[generationId]": data.generationId,
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