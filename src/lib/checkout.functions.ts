/**
 * Server function: create Stripe Checkout for the fixed digital download.
 * Creates a pending `orders` row and stores `stripe_session_id`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const InputSchema = z.object({}).optional();

const DIGITAL_PRODUCT_NAME = "Pet Portrait Perfection - Digital Download";
const DIGITAL_DESCRIPTION = "Instant digital delivery of your AI pet portrait.";
const DIGITAL_PRICE_CENTS = 299; // £2.99
const DIGITAL_CURRENCY = "gbp";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");

    const origin = process.env.APP_ORIGIN ?? "http://localhost:5173";

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ??
      `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL ?? `${origin}/checkout/cancel`;

    // Stripe v1 endpoint expects application/x-www-form-urlencoded.
    const params = new URLSearchParams({
      mode: "payment",
      "client_reference_id": userId,
      "success_url": successUrl,
      "cancel_url": cancelUrl,

      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": DIGITAL_CURRENCY,
      "line_items[0][price_data][unit_amount]": DIGITAL_PRICE_CENTS.toString(),
      "line_items[0][price_data][product_data][name]": DIGITAL_PRODUCT_NAME,
      "line_items[0][price_data][product_data][description]": DIGITAL_DESCRIPTION,

      "metadata[user_id]": userId,
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const stripePayload: any = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok) {
      const msg = stripePayload?.error?.message ?? `Stripe error (${stripeRes.status}).`;
      throw new Error(msg);
    }

    const checkoutUrl: string | undefined = stripePayload?.url;
    const stripeSessionId: string | undefined = stripePayload?.id;
    if (!checkoutUrl || !stripeSessionId) throw new Error("Stripe did not return a checkout session.");

    // Create pending order and persist the Stripe session id.
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        subtotal_cents: DIGITAL_PRICE_CENTS,
        total_cents: DIGITAL_PRICE_CENTS,
        currency: DIGITAL_CURRENCY,
        stripe_session_id: stripeSessionId,
      })
      .select("id")
      .single();

    if (orderErr || !orderRow) throw new Error(orderErr?.message ?? "Could not create order.");

    const { error: itemErr } = await supabase.from("order_items").insert({
      order_id: orderRow.id,
      product_id: null,
      generation_id: null,
      quantity: 1,
      unit_price_cents: DIGITAL_PRICE_CENTS,
      options: { kind: "digital_download" },
    });
    if (itemErr) throw new Error(itemErr.message);

    return { url: checkoutUrl };
  });