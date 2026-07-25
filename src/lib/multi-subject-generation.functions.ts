/**
 * Multi-subject (owner+pet) generation — Step 4 of the owner+pet build plan.
 *
 * A sibling to generatePawtoon (src/lib/generations.functions.ts), not a
 * branch inside it — the live single-pet path is untouched. Unlike
 * generatePawtoon (GPT-4o Vision description -> text-only images/generations
 * call), this sends the real reference photos to OpenAI's images/edits
 * endpoint, per the feasibility testing in scripts/multi-subject-test/.
 *
 * The actual logic lives in multi-subject-generation.server.ts — kept out of
 * this file on purpose. This file is imported directly by create-group.tsx
 * (a client-rendered route), and TanStack Start's server-fn Vite plugin only
 * strips the literal .handler(fn) argument of a createServerFn(...) call for
 * the client bundle — it doesn't know about other exports in the file. Only
 * reference server-only imports (bakeWatermark, supabaseAdmin, etc.) from
 * inside .handler()/.inputValidator() here, never as a separate top-level
 * export, or they'll leak into the browser bundle. See the comment at the
 * top of multi-subject-generation.server.ts for the full explanation.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { InputSchema, runMultiSubjectGeneration } from "@/lib/multi-subject-generation.server";

export const generateMultiSubjectPawtoon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const apiKey = context.env?.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured. Get your key from https://platform.openai.com/api-keys");
    return runMultiSubjectGeneration(data, userId, { supabaseAdmin, openaiApiKey: apiKey });
  });
