#!/usr/bin/env node
/**
 * DISPOSABLE FEASIBILITY TEST — NOT part of the Pawtoons app.
 * Safe to delete at any time (this whole scripts/multi-subject-test/ folder).
 *
 * Tests whether the existing "describe with GPT-4o Vision, then generate
 * with a text-only prompt via gpt-image-2" approach (as used in
 * src/lib/generations.functions.ts) still produces a usable result when
 * merging descriptions of MULTIPLE subjects (e.g. owner + pet) into one
 * combined prompt, instead of just one pet.
 *
 * This script does not import from, modify, or depend on anything in
 * src/ or supabase/ — it only mirrors the same OpenAI request shapes.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------------- API key: read from the same place the app does ---------------- */

function loadOpenAiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;

  // The app reads OPENAI_API_KEY from .dev.vars at the repo root (see .dev.vars.example).
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
    "OPENAI_API_KEY not found. Add it to .dev.vars at the repo root, or run with OPENAI_API_KEY=sk-... node scripts/multi-subject-test/test.mjs ..."
  );
  process.exit(1);
}

/* ---------------- CLI args ---------------- */

const imagePaths = process.argv.slice(2);
if (imagePaths.length < 2) {
  console.error("Usage: node scripts/multi-subject-test/test.mjs <image1> <image2> [image3 ...]");
  console.error('Example: node scripts/multi-subject-test/test.mjs "C:\\photos\\owner.jpg" "C:\\photos\\dog.jpg"');
  process.exit(1);
}
for (const p of imagePaths) {
  if (!fs.existsSync(p)) {
    console.error(`File not found: ${p}`);
    process.exit(1);
  }
}

/* ---------------- Same model/endpoint constants as generations.functions.ts ---------------- */

const OPENAI_VISION_MODEL = "gpt-4o";
const OPENAI_IMAGE_MODEL = "gpt-image-2";
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";

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

/* ---------------- Step 1: describe each subject (mirrors the Vision step) ---------------- */

async function describeSubject(imagePath) {
  const base64Image = fs.readFileSync(imagePath).toString("base64");
  const mimeType = mimeFromExt(imagePath);

  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              // Widened from the production pet-only prompt so it also works for a human owner photo.
              text: "Analyze this photo in detail. If it shows a person, describe: apparent age range, hair colour/style, notable clothing or features, build, and current pose/expression. If it shows a pet/animal, describe: species, breed or breed mix if identifiable, coat colour and pattern, distinctive physical features, apparent size, and current pose/expression. Be specific and concise (3-4 sentences max). Focus on visual details that would help an artist recreate this specific subject.",
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("OpenAI rate limit reached — try again in a minute.");
    if (res.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
    throw new Error(`OpenAI Vision API error (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const description = data.choices?.[0]?.message?.content;
  if (!description) throw new Error(`GPT-4o Vision returned no description for ${imagePath}`);
  return description.trim();
}

/* ---------------- Step 2: merge into one prompt ---------------- */

function buildMergedPrompt(descriptions) {
  const style =
    "museum-quality oil painting portrait, rich painterly brush strokes, dramatic lighting, gallery-grade composition";
  const listed = descriptions.map((d, i) => `${i + 1}) ${d}`).join(" ");

  return [
    `A ${style} featuring multiple subjects together in the same scene:`,
    listed,
    `All subjects must appear together in one cohesive composition, correctly scaled relative to each other, each one clearly recognisable and matching their individual description above.`,
    `High-quality digital illustration, premium gifting product art, square 1:1 composition, clean background.`,
    `No text, no watermarks, no logos.`,
  ].join(" ");
}

/* ---------------- Step 3: generate image (mirrors the images/generations call) ---------------- */

async function generateImage(prompt) {
  const res = await fetch(OPENAI_IMAGE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt: prompt.slice(0, 4000),
      n: 1,
      size: "1024x1024",
      quality: "medium",
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("OpenAI rate limit reached — try again in a minute.");
    if (res.status === 401) throw new Error("OpenAI API key invalid or not authorized.");
    throw new Error(`OpenAI image error (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  const imageB64 = data.data?.[0]?.b64_json;
  if (!imageUrl && !imageB64) throw new Error("gpt-image-2 did not return an image.");

  if (imageB64) return Buffer.from(imageB64, "base64");

  const dl = await fetch(imageUrl);
  if (!dl.ok) throw new Error(`Failed to download generated image: ${dl.statusText}`);
  return Buffer.from(await dl.arrayBuffer());
}

/* ---------------- Main ---------------- */

async function main() {
  console.log(`Analyzing ${imagePaths.length} subject photo(s) with ${OPENAI_VISION_MODEL}...\n`);

  const descriptions = [];
  for (let i = 0; i < imagePaths.length; i++) {
    console.log(`--- Subject ${i + 1}: ${imagePaths[i]} ---`);
    const desc = await describeSubject(imagePaths[i]);
    console.log(desc, "\n");
    descriptions.push(desc);
  }

  const mergedPrompt = buildMergedPrompt(descriptions);
  console.log("=== Merged prompt sent to gpt-image-2 ===");
  console.log(mergedPrompt, "\n");

  console.log(`Generating image with ${OPENAI_IMAGE_MODEL} (quality: medium, size: 1024x1024)...`);
  const bytes = await generateImage(mergedPrompt);

  const timestamp = Date.now();
  const outPath = path.join(__dirname, `output-${timestamp}.png`);
  fs.writeFileSync(outPath, bytes);
  console.log(`\nSaved: ${outPath}`);
}

main().catch((err) => {
  console.error("\nFailed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
