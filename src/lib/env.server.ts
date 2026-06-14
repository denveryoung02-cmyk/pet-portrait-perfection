/**
 * Cloudflare Workers environment bindings access.
 *
 * In Cloudflare Workers with TanStack Start, environment variables are
 * accessed via the request context through the Vinxi/h3 event object.
 *
 * This module provides both context-aware access (getEnv) and legacy global
 * storage (setEnv) for the main server.ts fetch handler.
 */

import { getRequest } from '@tanstack/react-start/server';

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
  RESEND_API_KEY?: string;
  AIML_API_KEY?: string;
  [key: string]: any;
};

// Legacy global storage for main server.ts webhook handler
let _globalEnv: CloudflareEnv | null = null;

export function setEnv(env: CloudflareEnv): void {
  _globalEnv = env;
  console.log('[setEnv] Stored env globally - STRIPE_SECRET_KEY exists:', !!env.STRIPE_SECRET_KEY);
}

export function getEnv(): CloudflareEnv {
  try {
    // PRIMARY: Get env from request context (works in TanStack Start server functions)
    const request = getRequest();

    // Try multiple context paths where Cloudflare Workers env might be stored:
    // 1. Via TanStack Start h3/Vinxi event context
    // 2. Via direct Cloudflare Workers request object
    const requestAny = request as any;
    const cfEnv =
      requestAny?.context?.env ||              // TanStack Start middleware context.env
      requestAny?.context?.cloudflare?.env ||  // Vinxi cloudflare adapter
      requestAny?.__cloudflare__?.env ||       // Legacy Workers binding
      requestAny?.cloudflare?.env ||           // Direct Workers request
      requestAny?.cf?.env;                     // Alternative Workers path

    if (cfEnv) {
      console.log('[getEnv] Found env in request context - STRIPE_SECRET_KEY exists:', !!cfEnv.STRIPE_SECRET_KEY);
      return cfEnv;
    }

    console.log('[getEnv] Request context exists but no env found, checking global...');
  } catch (err) {
    // getRequest() throws if called outside request context (e.g., webhook handler)
    console.log('[getEnv] getRequest() failed, falling back to global:', (err as Error).message);
  }

  // FALLBACK: Use global storage (for webhook handler and edge cases)
  if (_globalEnv) {
    console.log('[getEnv] Using _globalEnv fallback - STRIPE_SECRET_KEY exists:', !!_globalEnv.STRIPE_SECRET_KEY);
    return _globalEnv;
  }

  // LAST RESORT: Development mode import.meta.env
  const fallback = (import.meta as any).env || {};
  console.log('[getEnv] Using import.meta.env fallback - STRIPE_SECRET_KEY exists:', !!fallback.STRIPE_SECRET_KEY);
  return fallback;
}
