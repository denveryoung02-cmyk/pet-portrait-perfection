/**
 * Cloudflare Workers environment bindings store.
 *
 * In Cloudflare Workers, environment variables and bindings are passed via the
 * `env` object in the fetch handler. This module provides a way to access them
 * from anywhere in the server code using a simple global reference.
 */

export type CloudflareEnv = {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_PROJECT_ID?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  OPENAI_API_KEY?: string;
  [key: string]: any;
};

export function setEnv(env: CloudflareEnv): void {
  // Store in globalThis for synchronous access
  (globalThis as any).__CF_ENV__ = env;

  // ALSO store in a module-level variable as backup
  // (some execution contexts may not have access to globalThis)
  _moduleEnv = env;
}

// Module-level backup storage for env
let _moduleEnv: CloudflareEnv | null = null;

export function getEnv(): CloudflareEnv {
  // Try globalThis first (standard approach)
  const global = (globalThis as any).__CF_ENV__;
  if (global) {
    console.log('[getEnv] Using globalThis.__CF_ENV__ - STRIPE_SECRET_KEY exists:', !!global.STRIPE_SECRET_KEY);
    return global;
  }

  // Try module-level backup (for execution contexts without globalThis access)
  if (_moduleEnv) {
    console.log('[getEnv] Using _moduleEnv backup - STRIPE_SECRET_KEY exists:', !!_moduleEnv.STRIPE_SECRET_KEY);
    return _moduleEnv;
  }

  // Fallback to import.meta.env for local development
  const fallback = (import.meta as any).env || {};
  console.log('[getEnv] Fallback to import.meta.env - STRIPE_SECRET_KEY exists:', !!fallback.STRIPE_SECRET_KEY);
  return fallback;
}
