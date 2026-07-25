#!/usr/bin/env node
/**
 * DISPOSABLE FEASIBILITY TEST — NOT part of the Pawtoons app.
 * Safe to delete at any time (this whole scripts/multi-subject-test/ folder).
 *
 * Companion to test.mjs. Where test.mjs mirrors the CURRENT production
 * pipeline (GPT-4o Vision text description -> gpt-image-2 images/generations,
 * no real photo ever reaches the image model), this script tests the
 * alternative: sending the actual reference photo(s) directly to OpenAI's
 * images/edits endpoint, which accepts real image input alongside a text
 * prompt. Goal: see if that produces better human-subject likeness than the
 * text-only approach.
 *
 * Confirmed from OpenAI's docs (developers.openai.com) before writing this:
 *   - POST https://api.openai.com/v1/images/edits  (note: "edits", plural)
 *   - Content-Type: multipart/form-data — NOT JSON like images/generations
 *   - Reference images attached as repeated "image[]" form fields (file
 *     uploads), up to 16 images, not a JSON image_url string
 *   - model "gpt-image-2" is supported for edits (per OpenAI's image
 *     generation guide, which shows edit examples using it) — one other
 *     OpenAI reference page's model enum did NOT list gpt-image-2 for this
 *     endpoint, so this is flagged as unconfirmed with 100% certainty;
 *     verify directly against your OpenAI account/docs before relying on
 *     it for production.
 *   - size/quality accept the same values as images/generations
 *     ("1024x1024", "medium", etc.)
 *
 * This script does not import from, modify, or depend on anything in
 * src/ or supabase/ — it only mirrors the same OpenAI API shapes.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------------- API key: read from the same place the app does ---------------- */

function loadOpenAiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  const devVarsPath = path.resolve(__dirname, "../../.dev.vars");
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key === "OPENAI_API_KEY" && value) return value;
    }
  }
  return null;
}

const OPENAI_API_KEY = loadOpenAiKey();
if (!OPENAI_API_KEY) {
  console.error(
    "OPENAI_API_KEY not found. Add it to .dev.vars at the repo root, or run with OPENAI_API_KEY=sk-... node scripts/multi-subject-test/test-edit.mjs ..."
  );
  process.exit(1);
}

/* ---------------- CLI args ---------------- */

const imagePaths = process.argv.slice(2);
if (imagePaths.length < 2) {
  console.error("Usage: node scripts/multi-subject-test/test-edit.mjs <image1> <image2> [image3 ...]");
  console.error('Example: node scripts/multi-subject-test/test-edit.mjs "C:\\photos\\owner.jpg" "C:\\photos\\dog.jpg"');
  process.exit(1);
}
for (const p of imagePaths) {
  if (!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
}

/* ---------------- Same model as production (generations.functions.ts) ---------------- */

const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_EDIT_URL = "https://api.openai.com/v1/images/edits";

// Copied verbatim from src/services/prompts.ts's ART_STYLE_PREFIX["oil-painting"]
// (read-only reference, not imported — this script has no dependency on src/).
const OIL_PAINTING_STYLE =
  "oil painting portrait, rich impasto brushwork, deep saturated colours, dramatic chiaroscuro lighting, old masters technique, canvas texture visible, professional fine art quality, museum-quality portrait painting, warm golden tones, masterful composition";

function mimeFromExt(p) {
  const ext = path.extname(p).toLowerCase();
  return (
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".heic": "image/heic",
      ".heif": "image/heif",
    }[ext] ?? "image/jpeg"
  );
}

function buildEditPrompt() {
  return [
    `${OIL_PAINTING_STYLE}.`,
    `Combine the people and/or pets shown in the attached reference images into a single portrait, together in one cohesive scene.`,
    `Keep every subject clearly recognisable and faithful to their reference photo — preserve each person's face and each pet's breed, fur colour and markings.`,
    `High-quality digital illustration, premium gifting product art, square 1:1 composition, centred subjects, clean background.`,
    `No text, no watermarks, no logos.`,
  ].join(" ");
}

/* ---------------- images/edits call (multipart/form-data, NOT JSON) ---------------- */

async function generateImageEdit(prompt, imagePaths) {
  const form = new FormData();
  form.append("model", OPENAI_IMAGE_MODEL);
  form.append("prompt", prompt);
  form.append("n", "1");
  form.append("size", "1024x1024");
  form.append("quality", "medium");

  for (const imagePath of imagePaths) {
    const buf = fs.readFileSync(imagePath);
    const blob = new Blob([buf], { type: mimeFromExt(imagePath) });
    form.append("image[]", blob, path.basename(imagePath));
  }

  const res = await fetch(OPENAI_EDIT_URL, {
    method: "POST",
    // No Content-Type header set manually — fetch sets the correct
    // multipart boundary automatically for a FormData body.
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("OpenAI rate limit reached — try again in a minute.");
    if (res.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
    throw new Error(`OpenAI images/edits error (${res.status}): ${errText.slice(0, 500)}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  const imageB64 = data.data?.[0]?.b64_json;
  if (!imageUrl && !imageB64) throw new Error("gpt-image-2 (edits) did not return an image.");

  if (imageB64) return Buffer.from(imageB64, "base64");

  const dl = await fetch(imageUrl);
  if (!dl.ok) throw new Error(`Failed to download generated image: ${dl.statusText}`);
  return Buffer.from(await dl.arrayBuffer());
}

/* ---------------- Main ---------------- */

async function main() {
  const prompt = buildEditPrompt();

  console.log("=== Sending to images/edits ===");
  console.log(`Endpoint: ${OPENAI_EDIT_URL}`);
  console.log(`Model: ${OPENAI_IMAGE_MODEL}`);
  console.log(`Attached reference images (${imagePaths.length}):`);
  for (const p of imagePaths) console.log(`  - ${p}`);
  console.log(`Prompt:\n${prompt}\n`);

  console.log("Generating (this can take longer than a text-only generation)...");
  const bytes = await generateImageEdit(prompt, imagePaths);

  const timestamp = Date.now();
  const outPath = path.join(__dirname, `output-edit-${timestamp}.png`);
  fs.writeFileSync(outPath, bytes);
  console.log(`\nSaved: ${outPath}`);
}

main().catch((err) => {
  console.error("\nFailed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
