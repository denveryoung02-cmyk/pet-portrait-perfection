import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { verifyStripeWebhook, recordPaidOrder } from "./lib/fulfillment.server";
import { setEnv, setExecutionCtx, getExecutionCtx, type CloudflareEnv } from "./lib/env.server";
import { generateHeroPack } from "./lib/hero-pack.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
// Only applies to GET requests (SSR page renders). POST requests are createServerFn
// calls; converting their error response to HTML breaks TanStack Start's client
// wrapper, which expects structured JSON and routes the parse failure to the
// root error boundary instead of the Promise .catch() chain.
async function normalizeCatastrophicSsrResponse(request: Request, response: Response): Promise<Response> {
  if (request.method !== "GET") return response;
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Stripe webhook — authoritative, async order recording. Handled here (ahead
// of the TanStack router) so we get the raw request body for signature
// verification. On checkout.session.completed we idempotently mark the order
// paid (the success page's confirmCheckout does the same, keyed on session id).
async function handleStripeWebhook(request: Request, env: CloudflareEnv): Promise<Response> {
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const payload = await request.text();
  const event = await verifyStripeWebhook(payload, request.headers.get("stripe-signature"), secret);
  if (!event) return new Response("Invalid signature", { status: 400 });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data?.object ?? {};
      const generationId: string | undefined = session?.metadata?.generationId;
      if (session?.payment_status === "paid" && session?.id && generationId) {
        const { orderId } = await recordPaidOrder({
          sessionId: session.id,
          generationId,
          amountTotalCents: typeof session.amount_total === "number" ? session.amount_total : null,
          wantsBundle: session.metadata?.wantsBundle === "true",
        });

        // Fire-and-forget: Hero Pack generation must not delay the webhook's
        // 200 response to Stripe. generateHeroPack is idempotent per order_id,
        // so it's safe to also trigger it from confirmCheckout below.
        const heroPackPromise = generateHeroPack(orderId, generationId, env).catch((err) => {
          console.error("[hero-pack] generation failed (webhook trigger):", {
            orderId,
            generationId,
            error: err instanceof Error ? err.message : err,
          });
        });
        getExecutionCtx()?.waitUntil(heroPackPromise);
      }
    }
  } catch (error) {
    // Log but still 200 so Stripe doesn't hammer retries on a transient issue;
    // the success page's confirmCheckout is a backstop for recording.
    console.error("Stripe webhook handling error:", error);
  }

  return new Response("ok", { status: 200 });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const cfEnv = env as CloudflareEnv;

    // Store Cloudflare Workers env bindings for webhook handler and fallback access
    setEnv(cfEnv);
    setExecutionCtx(ctx as { waitUntil(promise: Promise<unknown>): void });

    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/stripe/webhook") {
        return await handleStripeWebhook(request, cfEnv);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(request, response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
