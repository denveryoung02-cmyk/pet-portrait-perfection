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
  orderType: "single_pet" | "multi_subject";
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
  if (!res.ok) return { paid: false, generationId: null, amountTotalCents: null, wantsBundle: false, orderType: "single_pet" };

  const session: any = await res.json();
  return {
    paid: session?.payment_status === "paid",
    generationId: session?.metadata?.generationId ?? null,
    amountTotalCents: typeof session?.amount_total === "number" ? session.amount_total : null,
    wantsBundle: session?.metadata?.wantsBundle === "true",
    orderType: session?.metadata?.orderType === "multi_subject" ? "multi_subject" : "single_pet",
  };
}

/**
 * Idempotently record a paid order for a Stripe session. Keyed on
 * stripe_session_id (now a unique column — see the
 * orders_stripe_session_id_unique migration) so repeated calls (success
 * page + webhook, or a Stripe webhook retry) are safe even under real
 * concurrency. Derives the owning user from the generation row.
 *
 * Uses an atomic upsert+onConflict claim, the same pattern as
 * generateHeroPack (hero-pack.server.ts:180-184), instead of a
 * select-then-insert: the old check-then-act had a real race window between
 * the webhook and success-page paths that produced duplicate orders rows in
 * production data (found and cleaned up before this fix landed).
 */
export async function recordPaidOrder(opts: {
  sessionId: string;
  generationId: string;
  amountTotalCents?: number | null;
  wantsBundle?: boolean;
  orderType?: "single_pet" | "multi_subject";
}): Promise<{ orderId: string }> {
  const { sessionId, generationId } = opts;
  const total = opts.amountTotalCents ?? DIGITAL_PRICE_CENTS;

  const { data: gen } = await supabaseAdmin
    .from("generations")
    .select("user_id")
    .eq("id", generationId)
    .single();
  if (!gen?.user_id) throw new Error("Generation not found for order.");

  const { data: claimed, error: upsertErr } = await supabaseAdmin
    .from("orders")
    .upsert(
      {
        user_id: gen.user_id,
        status: "paid",
        currency: "gbp",
        subtotal_cents: total,
        total_cents: total,
        stripe_session_id: sessionId,
        wants_bundle: opts.wantsBundle ?? false,
        order_type: opts.orderType ?? "single_pet",
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();
  if (upsertErr) throw new Error(upsertErr.message);

  if (claimed) {
    // We won the claim — this is the only call that writes order_items too.
    const { error: itemErr } = await supabaseAdmin.from("order_items").insert({
      order_id: claimed.id,
      generation_id: generationId,
      quantity: 1,
      unit_price_cents: total,
      options: { type: "digital_download" },
    });
    if (itemErr) {
      console.error("[order] Failed to insert order_item:", {
        orderId: claimed.id,
        generationId,
        error: itemErr,
      });
    }
    return { orderId: claimed.id };
  }

  // Another call already claimed this session — look up its order id instead.
  const { data: existing, error: existingErr } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .single();
  if (existingErr || !existing) throw new Error(existingErr?.message ?? "Could not find existing order for session.");
  return { orderId: existing.id };
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
