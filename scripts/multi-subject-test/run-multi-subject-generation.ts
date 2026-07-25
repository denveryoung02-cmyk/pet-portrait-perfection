/**
 * DISPOSABLE STANDALONE TEST — NOT part of the app, safe to delete along
 * with the rest of scripts/multi-subject-test/ when done.
 *
 * Exercises the REAL production logic in
 * src/lib/multi-subject-generation.functions.ts (runMultiSubjectGeneration)
 * directly against the two real rows created during Step 2b's testing
 * (Den = person, Kobi = pet), without going through any UI, createServerFn
 * RPC, or auth session.
 *
 * Run from the repo root with:
 *   npx tsx scripts/multi-subject-test/run-multi-subject-generation.ts
 *
 * Constructs its own Supabase admin client directly from .dev.vars instead
 * of importing the app's ambient supabaseAdmin singleton, because that
 * singleton's getEnv() (src/lib/env.server.ts) needs a live Cloudflare
 * Workers / TanStack Start request context that doesn't exist when running
 * a plain script. This is exactly why runMultiSubjectGeneration takes its
 * dependencies (supabaseAdmin, openaiApiKey) as explicit parameters instead
 * of reaching for the ambient ones itself — the production createServerFn
 * wrapper (generateMultiSubjectPawtoon, in the same file) passes the real
 * ambient ones; this script passes its own, pointed at the same live DB.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { runMultiSubjectGeneration } from "@/lib/multi-subject-generation.server";
import type { Database } from "@/integrations/supabase/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDevVar(key: string): string | null {
  if (process.env[key]) return process.env[key]!;
  const devVarsPath = path.resolve(__dirname, "../../.dev.vars");
  if (fs.existsSync(devVarsPath)) {
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
  }
  return null;
}

const SUPABASE_URL = loadDevVar("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = loadDevVar("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = loadDevVar("OPENAI_API_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / OPENAI_API_KEY in .dev.vars.");
  process.exit(1);
}

const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Real rows confirmed live in uploaded_images (queried via Supabase MCP
// before writing this script — not guessed):
//   Kobi: id 1c694014-ca77-4f26-86dc-7895c0465ccf, subject_type 'pet'
//   Den:  id 9ad6f2ca-14d6-4c45-ae89-dcf8cd740398, subject_type 'person'
// both under user_id 4b434def-2067-4d81-be39-d38497d137c5.
const USER_ID = "4b434def-2067-4d81-be39-d38497d137c5";
const DEN_UPLOADED_IMAGE_ID = "9ad6f2ca-14d6-4c45-ae89-dcf8cd740398";
const KOBI_UPLOADED_IMAGE_ID = "1c694014-ca77-4f26-86dc-7895c0465ccf";

async function main() {
  console.log("Running runMultiSubjectGeneration against the real Den + Kobi rows...\n");

  const result = await runMultiSubjectGeneration(
    {
      subjects: [
        { uploadedImageId: DEN_UPLOADED_IMAGE_ID, subjectType: "person", name: "Den" },
        { uploadedImageId: KOBI_UPLOADED_IMAGE_ID, subjectType: "pet", name: "Kobi" },
      ],
      artStyleId: "oil-painting",
      tier: "solo",
    },
    USER_ID,
    { supabaseAdmin, openaiApiKey: OPENAI_API_KEY }
  );

  console.log("Result:", result);

  if (result.status !== "completed") {
    console.error("\nGeneration failed:", result.error);
    process.exit(1);
  }

  // Download the CLEAN (unwatermarked) image for a fair visual comparison
  // against scripts/multi-subject-test/output-edit-*.png, which also has no
  // watermark baked in.
  const { data: genRow, error: genErr } = await supabaseAdmin
    .from("generations")
    .select("clean_path")
    .eq("id", result.generationId)
    .single();
  if (genErr || !genRow?.clean_path) throw new Error(`Could not read back clean_path: ${genErr?.message}`);

  const { data: cleanBlob, error: dlErr } = await supabaseAdmin.storage
    .from("caricatures-clean")
    .download(genRow.clean_path);
  if (dlErr || !cleanBlob) throw new Error(`Could not download clean image: ${dlErr?.message}`);

  const bytes = new Uint8Array(await cleanBlob.arrayBuffer());
  const timestamp = Date.now();
  const outPath = path.join(__dirname, `output-multi-subject-${timestamp}.png`);
  fs.writeFileSync(outPath, bytes);

  console.log(`\nSaved clean (unwatermarked) output: ${outPath}`);
  console.log(`generations.id: ${result.generationId}`);
  console.log(`Preview URL (watermarked, public): ${result.previewUrl}`);
}

main().catch((err) => {
  console.error("\nFailed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
