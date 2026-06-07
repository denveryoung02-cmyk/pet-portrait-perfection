/**
 * Client-side service for AI generations.
 *
 * Wraps the `generatePawtoon` server function and exposes simple
 * status helpers. The server function runs synchronously today but the API
 * here is built around a `status` field so we can swap in async polling
 * (e.g. background job + `getGeneration(id)`) without changing call sites.
 */
import { supabase } from "@/integrations/supabase/client";
import { generatePawtoon } from "@/lib/generations.functions";

export type GenerationStatus = "pending" | "processing" | "completed" | "failed" | "rejected";

export type GenerationRow = {
  id: string;
  status: GenerationStatus;
  theme: string;
  prompt: string | null;
  resultUrl: string | null;
  error: string | null;
  createdAt: string;
};

export type StartGenerationInput = {
  uploadedImageId: string;
  themeId: string;
  themeName?: string;
  personalityId: string;
  personalityName?: string;
  personalityDesc?: string;
  traits?: string[];
  petType?: string;
  petName?: string;
};

export async function startGeneration(input: StartGenerationInput) {
  console.log('[generations] Starting generation, checking session...');
  const { supabase } = await import('@/integrations/supabase/client');
  const { data: sessionData } = await supabase.auth.getSession();

  const clientSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const clientSupabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.log('[generations] Client Supabase config:', {
    url: clientSupabaseUrl,
    keyPreview: clientSupabaseKey?.substring(0, 20) + '...'
  });

  console.log('[generations] Session state before server call:', {
    hasSession: !!sessionData.session,
    hasToken: !!sessionData.session?.access_token,
    tokenPreview: sessionData.session?.access_token ? `${sessionData.session.access_token.substring(0, 20)}...` : 'NO TOKEN',
    expiresAt: sessionData.session?.expires_at,
    user: sessionData.session?.user?.email
  });

  // `data` is typed loosely here because generatePawtoon's input is validated by zod at runtime.
  return generatePawtoon({ data: input } as any);
}

export async function getGeneration(id: string): Promise<GenerationRow | null> {
  const { data, error } = await supabase
    .from("generations")
    .select("id, status, theme, prompt, preview_url, result_url, error, created_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    status: data.status as GenerationStatus,
    theme: data.theme,
    prompt: data.prompt,
    // Prefer the watermarked preview; legacy rows fall back to the old public URL.
    resultUrl: data.preview_url ?? data.result_url,
    error: data.error,
    createdAt: data.created_at,
  };
}

export async function listGenerations(limit = 24): Promise<GenerationRow[]> {
  const { data } = await supabase
    .from("generations")
    .select("id, status, theme, prompt, preview_url, result_url, error, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((d) => ({
    id: d.id,
    status: d.status as GenerationStatus,
    theme: d.theme,
    prompt: d.prompt,
    resultUrl: d.preview_url ?? d.result_url,
    error: d.error,
    createdAt: d.created_at,
  }));
}

/**
 * Poll a generation until it completes or fails.
 * Currently the server fn returns synchronously, but this helper lets the
 * UI treat all paths the same and is forward-compatible with an async queue.
 */
export async function pollGeneration(
  id: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<GenerationRow> {
  const interval = opts.intervalMs ?? 1500;
  const timeout = opts.timeoutMs ?? 90_000;
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const row = await getGeneration(id);
    if (row && (row.status === "completed" || row.status === "failed" || row.status === "rejected")) {
      return row;
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Generation timed out.");
}
