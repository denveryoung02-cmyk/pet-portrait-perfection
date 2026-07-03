/**
 * Server-only fulfillment helpers shared by the success-page confirm flow
 * (fulfillment.functions.ts) and the Stripe webhook (server.ts).
 *
 * Responsibilities:
 *  - verify a Stripe Checkout Session is actually paid (server-side),
 *  - idempotently record the paid order,
 *  - mint a short-lived signed URL to the CLEAN (un-watermarked) image.
 *
 * All DB/storage access uses the service-role client (bypasses RLS).
 *
 * IMPORTANT: All functions accept env as a parameter instead of calling getEnv()
 * because TanStack Start server functions run in an isolated context where
 * globalThis storage is not accessible. Callers must pass env explicitly.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { CloudflareEnv } from "@/lib/env.server";

const DIGITAL_PRICE_CENTS = 299;
const SIGNED_URL_TTL_SECONDS = 600;

export type StripeSessionResult = {
  paid: boolean;
  generationId: string | null;
  amountTotalCents: number | null;
  wantsBundle: boolean;
};

/** Retrieve a Checkout Session from Stripe and report whether it is paid. */
export async function retrieveStripeSession(
  sessionId: string,
  env: CloudflareEnv,
): Promise<StripeSessionResult> {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");

  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) return { paid: false, generationId: null, amountTotalCents: null, wantsBundle: false };

  const session: any = await res.json();
  return {
    paid: session?.payment_status === "paid",
    generationId: session?.metadata?.generationId ?? null,
    amountTotalCents: typeof session?.amount_total === "number" ? session.amount_total : null,
    wantsBundle: session?.metadata?.wantsBundle === "true",
  };
}

/**
 * Idempotently record a paid order for a Stripe session. Keyed on
 * stripe_session_id so repeated calls (success page + webhook) are safe.
 * Derives the owning user from the generation row.
 */
export async function recordPaidOrder(opts: {
  sessionId: string;
  generationId: string;
  amountTotalCents?: number | null;
  wantsBundle?: boolean;
}): Promise<{ orderId: string }> {
  const { sessionId, generationId } = opts;
  const total = opts.amountTotalCents ?? DIGITAL_PRICE_CENTS;

  // Already recorded? (idempotency)
  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (existing) return { orderId: existing.id };

  const { data: gen } = await supabaseAdmin
    .from("generations")
    .select("user_id")
    .eq("id", generationId)
    .single();
  if (!gen?.user_id) throw new Error("Generation not found for order.");

  const { data: order, error: ordErr } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: gen.user_id,
      status: "paid",
      currency: "gbp",
      subtotal_cents: total,
      total_cents: total,
      stripe_session_id: sessionId,
      wants_bundle: opts.wantsBundle ?? false,
    })
    .select("id")
    .single();
  if (ordErr || !order) throw new Error(ordErr?.message ?? "Could not record order.");

  const { error: itemErr } = await supabaseAdmin.from("order_items").insert({
    order_id: order.id,
    generation_id: generationId,
    quantity: 1,
    unit_price_cents: total,
    options: { type: "digital_download" },
  });
  if (itemErr) {
    console.error("[order] Failed to insert order_item:", {
      orderId: order.id,
      generationId,
      error: itemErr,
    });
  }

  return { orderId: order.id };
}

/** Store the AIML video task ID on an order row once generation has been kicked off. */
export async function storeVideoTaskId(orderId: string, taskId: string): Promise<void> {
  const { error: videoErr } = await supabaseAdmin
    .from("orders")
    .update({ video_task_id: taskId })
    .eq("id", orderId);
  if (videoErr) {
    console.error("[video] Failed to store video_task_id:", { orderId, taskId, error: videoErr });
  }
}

/**
 * Verify a Stripe webhook signature (the `t=...,v1=...` scheme) using Web
 * Crypto — works in both the Workers runtime and Node, with no Stripe SDK.
 * Returns the parsed event on success, or null if the signature is invalid.
 */
export async function verifyStripeWebhook(
  payload: string,
  signatureHeader: string | null,
  secret: string,
): Promise<any | null> {
  if (!signatureHeader) return null;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const idx = kv.indexOf("=");
      return [kv.slice(0, idx), kv.slice(idx + 1)];
    }),
  );
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return null;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time compare.
  if (expected.length !== v1.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  if (diff !== 0) return null;

  // Reject events older than 5 minutes (replay protection).
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (Number.isFinite(age) && age > 300) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Short-lived signed URL to the clean image for a generation. Falls back to a
 * legacy public `result_url` for pre-migration rows that have no clean_path.
 */
export async function signCleanDownloadUrl(
  generationId: string,
  ttlSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string | null> {
  const { data: gen } = await supabaseAdmin
    .from("generations")
    .select("clean_path, result_url")
    .eq("id", generationId)
    .single();
  if (!gen) return null;

  if (gen.clean_path) {
    const { data, error } = await supabaseAdmin.storage
      .from("caricatures-clean")
      .createSignedUrl(gen.clean_path, ttlSeconds);
    if (error) throw new Error(error.message);
    return data?.signedUrl ?? null;
  }

  // Legacy pre-migration generation — clean image was public.
  return gen.result_url ?? null;
}
