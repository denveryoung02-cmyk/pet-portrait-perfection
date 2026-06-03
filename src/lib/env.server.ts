/**
 * Cloudflare Workers environment bindings store.
 *
 * In Cloudflare Workers, environment variables and bindings are passed via the
 * `env` object in the fetch handler. This module provides a way to access them
 * from anywhere in the server code via AsyncLocalStorage.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

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
  GEMINI_API_KEY?: string;
  [key: string]: any;
};

const envStorage = new AsyncLocalStorage<CloudflareEnv>();

export function setEnv(env: CloudflareEnv): void {
  (globalThis as any).__CF_ENV__ = env;
}

export function getEnv(): CloudflareEnv {
  const stored = envStorage.getStore();
  if (stored) return stored;

  const global = (globalThis as any).__CF_ENV__;
  if (global) return global;

  // Fallback to import.meta.env for development
  return (import.meta as any).env || {};
}

export function runWithEnv<T>(env: CloudflareEnv, fn: () => T): T {
  return envStorage.run(env, fn);
}
