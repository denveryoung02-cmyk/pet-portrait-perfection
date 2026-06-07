# Generation Error Investigation: "Invalid API key"

**Date**: 2026-06-04  
**Error**: "Uploaded image not found or not accessible: Invalid API key"  
**Location**: `generatePawtoon()` function, line 44-52

---

## Error Analysis

### Exact Error Location

**File**: `src/lib/generations.functions.ts`  
**Lines**: 44-52

```typescript
// 1. Load the uploaded image (owner-scoped via RLS)
console.log('[generatePawtoon] Looking for uploadedImageId:', data.uploadedImageId, 'userId:', userId);
const { data: img, error: imgErr } = await supabase
  .from("uploaded_images")
  .select("id, storage_path")
  .eq("id", data.uploadedImageId)
  .single();
console.log('[generatePawtoon] Query result - img:', !!img, 'error:', imgErr?.message);
if (imgErr || !img) {
  console.error('[generatePawtoon] Failed to fetch uploaded image:', imgErr);
  throw new Error(`Uploaded image not found or not accessible: ${imgErr?.message ?? 'no data'}`);
  //                                                             ^^^^^^^^^^^^^^^^
  //                                                   This is where "Invalid API key" appears
}
```

---

## Root Cause Analysis

### Issue 1: Which API Key is Invalid?

The error message "Invalid API key" is coming from **Supabase**, not OpenAI.

**Evidence**:
1. Error occurs at line 44-48: `await supabase.from("uploaded_images").select(...)`
2. This is a Supabase database query, NOT an OpenAI API call
3. OpenAI calls happen later (lines 100+ for GPT-4 Vision, 154+ for DALL-E 3)
4. The error is `imgErr?.message` which is the Supabase error message

**Conclusion**: The "Invalid API key" error is from **Supabase**, not OpenAI.

---

### Issue 2: Why is Supabase Returning "Invalid API key"?

The `supabase` client is created in the middleware (`requireSupabaseAuth`):

**File**: `src/integrations/supabase/auth-middleware.ts`  
**Lines**: 53-68

```typescript
const supabase = createClient<Database>(
  SUPABASE_URL!,
  SUPABASE_PUBLISHABLE_KEY!,  // ← Using publishable key
  {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,  // ← User's auth token from request
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
```

**Then validates the token**:

```typescript
const { data, error } = await supabase.auth.getClaims(token);
if (error || !data?.claims) {
  throw new Error('Unauthorized: Invalid token');  // ← This would have fired if token was bad
}
```

**Key observations**:
1. If the auth token was invalid, middleware would throw "Unauthorized: Invalid token" BEFORE reaching the generation handler
2. The fact that we reach line 44 means the token validated successfully in middleware
3. But then the `supabase.from("uploaded_images").select()` call fails with "Invalid API key"

---

### Issue 3: The Problem - RLS and Anon Key

**Hypothesis**: The middleware creates a Supabase client with:
- ✅ Correct `SUPABASE_URL`
- ✅ Correct `SUPABASE_PUBLISHABLE_KEY` (anon key)
- ✅ Valid user auth token

But when querying `uploaded_images` table with RLS (Row Level Security), the error might be:

**Possible causes**:

#### A. Wrong Supabase Key Type
The middleware uses `SUPABASE_PUBLISHABLE_KEY` (anon key), but:
- This is correct for auth validation (`getClaims`)
- But the database query might be rejecting it

**Check**: Are we using the right key?
```typescript
// auth-middleware.ts line 14
const SUPABASE_PUBLISHABLE_KEY = env.SUPABASE_PUBLISHABLE_KEY;
```

**Expected format**:
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6ImFub24i...`
- Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSI...`

#### B. Cloudflare Secrets Mismatch
The error might be that `SUPABASE_PUBLISHABLE_KEY` secret in Cloudflare Workers contains the wrong value.

**Check configured secrets**:
```bash
npx wrangler secret list --name pawtoons-pet-portrait-perfection
```

**Current secrets** (confirmed):
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_PUBLISHABLE_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`
- ✅ `VITE_SUPABASE_PROJECT_ID`

**Issue**: We have TWO publishable keys:
1. `SUPABASE_PUBLISHABLE_KEY` (server-side)
2. `VITE_SUPABASE_PUBLISHABLE_KEY` (client-side)

These should be the SAME value (anon key from Supabase).

#### C. BOM in Supabase Key
Similar to the auth token BOM issue we fixed earlier, the Supabase key might have a BOM.

**Current BOM fix** (line 47-51):
```typescript
// Strip BOM from auth token
if (token.charCodeAt(0) === 0xFEFF || token.startsWith('﻿')) {
  token = token.substring(1);
}
```

**Missing**: We don't strip BOM from `SUPABASE_PUBLISHABLE_KEY` when loading from env.

#### D. RLS Policy Blocking Query
The `uploaded_images` table has RLS enabled. The policy might be:
- ✅ Allowing `auth.uid() = user_id` reads
- ❌ But the auth context isn't being passed correctly

---

## Diagnostic Steps

### Step 1: Check Actual Secret Values

**In Cloudflare Workers dashboard**:
1. Go to: https://dash.cloudflare.com/[account-id]/workers/services/view/pawtoons-pet-portrait-perfection/production/settings
2. Scroll to "Variables and Secrets"
3. Check if `SUPABASE_PUBLISHABLE_KEY` is set

**Expected value** (from `.dev.vars` line 6):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODA1NDIsImV4cCI6MjA5NTQ1NjU0Mn0.Xlgp7R4XoOJjkFQmfw7op4aZbWTCON-zKmzR-UxUwBo
```

### Step 2: Verify Middleware Gets Env Correctly

**Add debug logging** in `auth-middleware.ts` line 12-14:

```typescript
const env = getEnv();
console.log('[requireSupabaseAuth] env keys:', Object.keys(env));
console.log('[requireSupabaseAuth] SUPABASE_URL:', !!env.SUPABASE_URL);
console.log('[requireSupabaseAuth] SUPABASE_PUBLISHABLE_KEY exists:', !!env.SUPABASE_PUBLISHABLE_KEY);
console.log('[requireSupabaseAuth] SUPABASE_PUBLISHABLE_KEY length:', env.SUPABASE_PUBLISHABLE_KEY?.length);
console.log('[requireSupabaseAuth] SUPABASE_PUBLISHABLE_KEY starts with:', env.SUPABASE_PUBLISHABLE_KEY?.substring(0, 20));
```

**Expected output in logs**:
```
[requireSupabaseAuth] env keys: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ...
[requireSupabaseAuth] SUPABASE_URL: true
[requireSupabaseAuth] SUPABASE_PUBLISHABLE_KEY exists: true
[requireSupabaseAuth] SUPABASE_PUBLISHABLE_KEY length: 221
[requireSupabaseAuth] SUPABASE_PUBLISHABLE_KEY starts with: eyJhbGciOiJIUzI1NiIsI
```

**If we see**:
- `SUPABASE_PUBLISHABLE_KEY exists: false` → Secret not set in Cloudflare
- `SUPABASE_PUBLISHABLE_KEY length: undefined` → Secret is empty
- `SUPABASE_PUBLISHABLE_KEY starts with: sk_` → Wrong key type (Stripe key)

### Step 3: Check What Error Supabase Actually Returns

**Add logging** in `generations.functions.ts` line 49-52:

```typescript
console.log('[generatePawtoon] Query result - img:', !!img, 'error:', imgErr?.message);
console.log('[generatePawtoon] Full error object:', JSON.stringify(imgErr, null, 2));  // NEW
if (imgErr || !img) {
  console.error('[generatePawtoon] Failed to fetch uploaded image:', imgErr);
  throw new Error(`Uploaded image not found or not accessible: ${imgErr?.message ?? 'no data'}`);
}
```

**Expected errors**:
- `"Invalid API key"` → Supabase key is wrong
- `"JWT expired"` → Auth token expired
- `"Row not found"` → RLS blocking the query or image doesn't exist
- `"permission denied"` → RLS policy not allowing read

### Step 4: Test with supabaseAdmin Client

The generation function uses TWO Supabase clients:

1. **User client** (`supabase` from middleware) — for querying `uploaded_images` (line 44)
2. **Admin client** (`supabaseAdmin`) — for downloading from storage (line 84)

**Try using admin client for the query**:

```typescript
// BEFORE (using user client with RLS):
const { data: img, error: imgErr } = await supabase
  .from("uploaded_images")
  .select("id, storage_path")
  .eq("id", data.uploadedImageId)
  .single();

// AFTER (using admin client, bypasses RLS):
const { data: img, error: imgErr } = await supabaseAdmin
  .from("uploaded_images")
  .select("id, storage_path")
  .eq("id", data.uploadedImageId)
  .eq("user_id", userId)  // Add user_id check for security
  .single();
```

**Why this might work**:
- `supabaseAdmin` uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS
- If this works, it confirms the issue is with the user client auth

---

## Most Likely Cause

**Primary hypothesis**: `SUPABASE_PUBLISHABLE_KEY` secret in Cloudflare Workers is not set or has the wrong value.

**Evidence**:
1. Middleware successfully validates the auth token (`getClaims` succeeds)
2. But database query fails with "Invalid API key"
3. This suggests the Supabase client is created with the wrong publishable key

**Why this could happen**:
- Secret was never set in Cloudflare Workers
- Secret was set with wrong value (e.g. Stripe key instead of Supabase key)
- Secret has a typo or BOM character

---

## Recommended Actions (In Order)

### 1. Verify Supabase Secret is Set

```bash
npx wrangler secret list --name pawtoons-pet-portrait-perfection
```

Look for: `SUPABASE_PUBLISHABLE_KEY`

### 2. Re-set Supabase Publishable Key

From `.dev.vars` line 6, the correct value is:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODA1NDIsImV4cCI6MjA5NTQ1NjU0Mn0.Xlgp7R4XoOJjkFQmfw7op4aZbWTCON-zKmzR-UxUwBo
```

```bash
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY --name pawtoons-pet-portrait-perfection
```

### 3. Add Debug Logging

Temporarily add logs to see what env values are being loaded:

**In `auth-middleware.ts`** after line 12:
```typescript
const env = getEnv();
console.log('[Auth] SUPABASE_PUBLISHABLE_KEY length:', env.SUPABASE_PUBLISHABLE_KEY?.length);
console.log('[Auth] SUPABASE_PUBLISHABLE_KEY prefix:', env.SUPABASE_PUBLISHABLE_KEY?.substring(0, 30));
```

**In `generations.functions.ts`** after line 49:
```typescript
console.log('[generatePawtoon] Supabase error details:', {
  message: imgErr?.message,
  code: imgErr?.code,
  details: imgErr?.details,
  hint: imgErr?.hint,
});
```

### 4. Test Generation Again

After re-setting the secret:
1. Visit production app
2. Upload pet photo
3. Generate portrait
4. Check logs: `npx wrangler tail pawtoons-pet-portrait-perfection`

---

## Summary

**Error**: "Uploaded image not found or not accessible: Invalid API key"

**Location**: `src/lib/generations.functions.ts:44-52`

**Which API Key**: **Supabase** publishable key (anon key), NOT OpenAI

**Root Cause**: Most likely `SUPABASE_PUBLISHABLE_KEY` secret in Cloudflare Workers is:
- Not set, OR
- Set to wrong value, OR
- Has BOM/encoding issue

**Next Step**: Verify and re-set `SUPABASE_PUBLISHABLE_KEY` secret in Cloudflare Workers
