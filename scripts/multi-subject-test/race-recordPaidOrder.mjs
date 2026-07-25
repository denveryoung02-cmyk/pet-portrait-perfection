/**
 * DISPOSABLE TEST — NOT part of the app, safe to delete.
 *
 * Simulates the real webhook-vs-success-page race for recordPaidOrder
 * (fulfillment.server.ts) by forging two correctly HMAC-signed
 * checkout.session.completed events for the SAME fake stripe_session_id and
 * firing them at the real running dev server's /api/stripe/webhook endpoint
 * concurrently. This exercises the actual server.ts -> recordPaidOrder code
 * path for real, over HTTP, rather than reimplementing its logic.
 *
 * Run: node scripts/multi-subject-test/race-recordPaidOrder.mjs <real-generation-id>
 * Requires the dev server running on localhost:8080 and STRIPE_WEBHOOK_SECRET
 * in .dev.vars to match what server.ts verifies against.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDevVar(key) {
  const devVarsPath = path.resolve(__dirname, "../../.dev.vars");
  const content = fs.readFileSync(devVarsPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (k === key && v) return v;
  }
  return null;
}

const WEBHOOK_SECRET = loadDevVar("STRIPE_WEBHOOK_SECRET");
if (!WEBHOOK_SECRET) {
  console.error("STRIPE_WEBHOOK_SECRET not found in .dev.vars");
  process.exit(1);
}

const generationId = process.argv[2];
if (!generationId) {
  console.error("Usage: node scripts/multi-subject-test/race-recordPaidOrder.mjs <real-generation-id>");
  process.exit(1);
}

const fakeSessionId = `cs_test_RACE_${crypto.randomUUID()}`;

const payload = JSON.stringify({
  id: `evt_race_${crypto.randomUUID()}`,
  type: "checkout.session.completed",
  data: {
    object: {
      id: fakeSessionId,
      payment_status: "paid",
      amount_total: 199,
      metadata: {
        generationId,
        wantsBundle: "false",
        orderType: "single_pet",
      },
    },
  },
});

function signPayload(body) {
  const t = Math.floor(Date.now() / 1000).toString();
  const v1 = crypto.createHmac("sha256", WEBHOOK_SECRET).update(`${t}.${body}`).digest("hex");
  return `t=${t},v1=${v1}`;
}

async function sendWebhook() {
  const signature = signPayload(payload);
  const res = await fetch("http://localhost:8080/api/stripe/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  console.log(`Fake session id: ${fakeSessionId}`);
  console.log(`Generation id used: ${generationId}`);
  console.log("Firing 2 concurrent checkout.session.completed webhook calls for the SAME session id...\n");

  const [r1, r2] = await Promise.all([sendWebhook(), sendWebhook()]);

  console.log("Response 1:", r1.status, r1.body);
  console.log("Response 2:", r2.status, r2.body);
  console.log(`\nNow check: select count(*) from public.orders where stripe_session_id = '${fakeSessionId}';`);
  console.log("Expected: exactly 1 row if the fix works.");
}

main().catch((err) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
