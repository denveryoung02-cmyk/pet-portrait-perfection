/**
 * TypeScript declarations for Cloudflare Workers environment context.
 *
 * Extends the TanStack Start server function context to include env bindings.
 */

import type { CloudflareEnv } from './env.server';

declare module '@tanstack/react-start' {
  interface Register {
    context: {
      env?: CloudflareEnv;
      supabase?: any;
      userId?: string;
      claims?: any;
    };
  }
}
