# Environment Variable Context Fix

**Date**: 2026-06-04  
**Issue**: TanStack Start server functions couldn't access Cloudflare Workers env bindings  
**Status**: ✅ Fixed and deployed

---

## Problem

TanStack Start server functions run in **isolated execution contexts** where:
- `globalThis.__CF_ENV__` is not accessible
- Module-level `_moduleEnv` backup doesn't cross context boundaries
- Environment variables were undefined in server function handlers

This caused `STRIPE_SECRET_KEY` and other env vars to be unavailable in:
- `createCheckoutSession()` (stripe.functions.ts)
- `confirmCheckout()` (fulfillment.functions.ts)
- Helper functions in `fulfillment.server.ts`

---

## Root Cause

**TanStack Start Architecture**:
- Server functions created with `createServerFn()` run in V8 isolates
- Each function handler gets its own `context` object from middleware
- The `requireSupabaseAuth` middleware passes `env` in `context`
- But helper functions called `getEnv()` which tried globalThis/module storage

**What didn't work**:
```typescript
// ❌ BROKEN: getEnv() couldn't find env in isolated context
export async function retrieveStripeSession(sessionId: string) {
  const env = getEnv();  // Returns {} or import.meta.env fallback
  const key = env.STRIPE_SECRET_KEY;  // undefined!
}
```

---

## Solution

Pass `env` **explicitly** through the call chain instead of relying on global storage.

### 1. Middleware Already Provides Context

`requireSupabaseAuth` middleware (auth-middleware.ts:81):
```typescript
return next({
  context: {
    env,  // ✅ Cloudflare Workers env passed here
    supabase,
    userId,
    claims,
  },
});
```

### 2. Updated getEnv() to Check Request Context First

`src/lib/env.server.ts`:
```typescript
export function getEnv(): CloudflareEnv {
  try {
    const request = getRequest();
    const cfEnv =
      requestAny?.context?.env ||              // ✅ NEW: TanStack Start middleware path
      requestAny?.context?.cloudflare?.env ||  // Vinxi cloudflare adapter
      // ... other paths
    if (cfEnv) return cfEnv;
  } catch {
    // Falls back to _globalEnv for webhook handler
  }
  return _globalEnv || import.meta.env;
}
```

### 3. Helper Functions Accept env Parameter

`src/lib/fulfillment.server.ts`:
```typescript
// ✅ FIXED: Accept env as parameter
export async function retrieveStripeSession(
  sessionId: string,
  env: CloudflareEnv,  // Caller passes this explicitly
): Promise<StripeSessionResult> {
  const key = env.STRIPE_SECRET_KEY;  // Now defined!
  // ...
}
```

### 4. Server Functions Pass context.env

`src/lib/fulfillment.functions.ts`:
```typescript
export const confirmCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { env } = context;  // ✅ Get from middleware context
    
    const session = await retrieveStripeSession(sessionId, env);  // ✅ Pass it
    await recordPaidOrder({ sessionId, generationId });
    // ...
  });
```

### 5. Webhook Handler Passes env Directly

`src/server.ts`:
```typescript
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const cfEnv = env as CloudflareEnv;
    setEnv(cfEnv);  // Store for _globalEnv fallback
    
    if (request.method === "POST" && url.pathname === "/api/stripe/webhook") {
      return await handleStripeWebhook(request, cfEnv);  // ✅ Pass directly
    }
    // ...
  },
};

async function handleStripeWebhook(request: Request, env: CloudflareEnv) {
  const secret = env.STRIPE_WEBHOOK_SECRET;  // ✅ Direct access
  // ...
}
```

---

## Pattern Summary

Three access patterns, each appropriate for its context:

| Context | Access Method | Reason |
|---------|--------------|--------|
| **TanStack Start server functions** | `context.env` from middleware | Isolated execution, no globals |
| **Webhook handler (server.ts)** | Direct `env` parameter | Outside TanStack router, has raw env |
| **Lazy singletons (supabaseAdmin)** | `getEnv()` fallback chain | Works in both contexts via request/global |

---

## Files Changed

```
✅ src/lib/env.server.ts
   - Added request.context.env check (TanStack Start middleware path)
   - Falls back to _globalEnv (webhook handler) then import.meta.env

✅ src/lib/fulfillment.server.ts
   - retrieveStripeSession(sessionId, env) — now accepts env param
   - recordPaidOrder() — no changes (doesn't need env)
   - verifyStripeWebhook() — already accepts secret directly
   - Added documentation about explicit env passing

✅ src/lib/fulfillment.functions.ts
   - confirmCheckout handler — pass context.env to retrieveStripeSession()

✅ src/server.ts
   - handleStripeWebhook(request, env) — now accepts env param
   - fetch() handler — pass cfEnv directly to webhook handler
   - Removed getEnv() import (no longer needed)

✅ src/lib/stripe.functions.ts
   - Removed unused getEnv import (already using context.env correctly)

✅ src/lib/generations.functions.ts
   - Removed unused getEnv import (already using context.env correctly)

✅ src/integrations/supabase/client.server.ts
   - Added comments explaining getEnv() usage is intentional
   - Works via request.context.env path in getEnv() fallback chain
```

---

## Testing

### Build
```bash
npm run build
```
✅ No TypeScript errors

### Deploy
```bash
npm run deploy
```
✅ Deployed successfully to Cloudflare Workers  
✅ Version: 28c9915b-d276-45b1-970e-03c7ba19b136  
✅ URL: https://pawtoons-pet-portrait-perfection.denveryoung02.workers.dev

### Runtime Test (Recommended)

1. **Test Stripe checkout**:
   - Visit `/upload`
   - Upload pet photo, select theme
   - Generate portrait
   - Click "Checkout" → Should create Stripe session (uses `context.env`)

2. **Test fulfillment**:
   - Complete payment
   - Success page should verify session (uses `context.env`)
   - Webhook should record order (uses direct `env` param)

3. **Check logs**:
   ```bash
   npx wrangler tail --name pawtoons-pet-portrait-perfection
   ```
   Look for:
   - ✅ No "STRIPE_SECRET_KEY is undefined" errors
   - ✅ Successful Stripe API calls
   - ✅ No "getEnv() failed" messages in server function calls

---

## Why This Works

**TanStack Start + Cloudflare Workers Architecture**:

1. **Main entry** (`server.ts`):
   - Receives raw Cloudflare Workers `env` object
   - Stores in `_globalEnv` via `setEnv()` (webhook handler uses this)
   - Passes to TanStack Start router

2. **TanStack Start router**:
   - Runs server functions in isolated V8 contexts
   - Middleware (`requireSupabaseAuth`) extracts env from request context
   - Passes as `context.env` to handler

3. **getEnv() fallback chain**:
   ```
   request.context.env (TanStack Start)
   → _globalEnv (webhook handler)
   → import.meta.env (development)
   ```

4. **Helper functions**:
   - Accept `env` as parameter (no global dependency)
   - Callers pass `context.env` or direct `env` param

---

## Key Insight

**You cannot rely on module-level or global storage in TanStack Start server functions.**

Even if you set `globalThis.__ENV__` in `server.ts`, it won't be accessible inside:
- `createServerFn()` handlers
- Functions called by those handlers

**Always pass env through the context chain:**
```
Middleware → context.env → handler → helper(env)
```

---

## References

- TanStack Start docs: https://tanstack.com/start
- Cloudflare Workers env bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/
- TanStack Start middleware: https://tanstack.com/router/latest/docs/framework/react/guide/middleware
