# Generation "Failed to Fetch" Debug Findings

**Date**: 2026-06-04  
**Issue**: Generation step shows "Failed to fetch" error  
**Status**: Investigating

---

## Investigation Findings

### 1. ✅ Server Function Is Using OpenAI Correctly

`src/lib/generations.functions.ts` (lines 94-96):
```typescript
const env = context.env;
const apiKey = env?.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is not configured...");
```

**Status**: ✅ Correctly using `context.env` pattern (same as Stripe fix)

### 2. ✅ OpenAI Migration Complete

- Uses GPT-4 Vision (`gpt-4o`) for pet analysis (line 100-128)
- Uses DALL-E 3 (`dall-e-3`) for image generation (line 154-168)
- Two-step process with enhanced prompts
- No references to Gemini API

**Status**: ✅ Full migration to OpenAI completed

### 3. ✅ OPENAI_API_KEY Is Configured

**Cloudflare Workers Secrets** (production):
```bash
$ npx wrangler secret list --name pawtoons-pet-portrait-perfection
[
  { "name": "OPENAI_API_KEY", "type": "secret_text" },  ✅
  { "name": "STRIPE_SECRET_KEY", "type": "secret_text" },
  ...
]
```

**Local Development** (.dev.vars line 19):
```
OPENAI_API_KEY=sk-proj-CR8t48usbB8rx7vOchNKFgO9hDlO8XRox-...
```

**Status**: ✅ API key configured in both environments

### 4. ✅ Environment Access Pattern Correct

The generation function follows the same pattern we just fixed for Stripe:

**Middleware passes env** (auth-middleware.ts):
```typescript
return next({
  context: {
    env,  // ✅ Cloudflare Workers env
    supabase,
    userId,
  },
});
```

**Handler accesses via context** (generations.functions.ts):
```typescript
.handler(async ({ data, context }) => {
  const env = context.env;  // ✅ Correct pattern
  const apiKey = env?.OPENAI_API_KEY;
  // ...
});
```

**Status**: ✅ Uses correct `context.env` pattern

### 5. ⚠️ Possible Issues to Check

#### A. Browser Network Error
"Failed to fetch" is typically a browser error, not a server error. Common causes:

1. **CORS issue**: TanStack Start server functions should auto-handle CORS
2. **Network timeout**: Generation takes time (GPT-4 Vision + DALL-E 3)
3. **Request size**: Large base64 image in request body
4. **Client-side auth header**: Missing or invalid Bearer token

#### B. Server Function URL Format
Check if the server function endpoint is being called correctly:
- Expected: `POST /_server` with function metadata
- TanStack Start auto-generates these endpoints

#### C. Client-Side Call
`src/services/generations.ts` (line 38):
```typescript
return generatePawtoon({ data: input } as any);
```

The `as any` cast might be masking a type error. Check if:
- The function is being imported correctly
- The call signature matches the server function

---

## Next Steps to Diagnose

### Step 1: Check Browser Console

Look for the exact error:
```
Failed to fetch
TypeError: Failed to fetch
CORS error
Network error
```

Also check:
- **Network tab**: What URL is being called?
- **Request payload**: Is it valid JSON?
- **Response**: What status code? (401, 403, 500, etc.)
- **Headers**: Is Authorization header present?

### Step 2: Check Server Logs

The worker logs will show:
- If the request reached the server
- If `context.env` has OPENAI_API_KEY
- Where exactly the error occurs

Command:
```bash
npx wrangler tail pawtoons-pet-portrait-perfection --format pretty
```

Look for:
- `[generatePawtoon]` log messages
- `OPENAI_API_KEY is not configured` error
- OpenAI API errors (401, 429, etc.)

### Step 3: Check Request Format

Verify the client is calling the server function correctly:

**Expected call** (TanStack Start pattern):
```typescript
import { generatePawtoon } from "@/lib/generations.functions";

const result = await generatePawtoon({
  data: {
    uploadedImageId: "...",
    themeId: "royal",
    // ...
  }
});
```

**Current call** (`src/services/generations.ts`):
```typescript
return generatePawtoon({ data: input } as any);
```

The `as any` suggests potential type mismatch.

---

## Hypotheses (Ordered by Likelihood)

### 1. Client-Side Auth Token Issue (Most Likely)
**Symptom**: "Failed to fetch" before server code runs  
**Cause**: Missing or invalid Bearer token in Authorization header  
**Check**: Browser Network tab → Request Headers → Authorization  
**Fix**: Verify `useAuth()` hook provides valid token

### 2. Server Function Not Found (Likely)
**Symptom**: 404 Not Found for server function endpoint  
**Cause**: Build/routing issue with TanStack Start  
**Check**: Network tab → Request URL (should be `/_server`)  
**Fix**: Rebuild and redeploy

### 3. OPENAI_API_KEY Not Accessible (Less Likely)
**Symptom**: Error "OPENAI_API_KEY is not configured"  
**Cause**: `context.env` doesn't have the key  
**Check**: Server logs for env debug messages  
**Fix**: Same as Stripe fix (but already applied)

### 4. OpenAI API Error (Less Likely)
**Symptom**: 401 or 429 from OpenAI  
**Cause**: Invalid key or rate limit  
**Check**: Server logs for OpenAI API response  
**Fix**: Rotate key or wait for rate limit reset

### 5. Request Timeout (Less Likely)
**Symptom**: Request times out after 30s-60s  
**Cause**: GPT-4 Vision + DALL-E 3 takes too long  
**Check**: Network tab → Request timing  
**Fix**: Increase timeout or make async

---

## Required Information from User

To continue debugging, need:

1. **Browser console error** (exact message)
2. **Network tab details**:
   - Request URL
   - Status code
   - Request headers (Authorization present?)
   - Response body
3. **When does error occur**:
   - Immediately on clicking "Generate"?
   - After uploading photo?
   - After selecting theme?
4. **Environment**:
   - Testing locally (`npm run dev`) or production?
   - Which browser?

---

## Summary

**What's Working**:
✅ Server function correctly migrated to OpenAI  
✅ Uses `context.env` pattern (same as Stripe fix)  
✅ OPENAI_API_KEY configured in both environments  
✅ Code follows correct TanStack Start patterns  

**What's Unknown**:
❓ Exact browser error message  
❓ Which URL is being called  
❓ Whether request reaches the server  
❓ Auth token validity  

**Next Action**:
Need browser console output and network tab details to identify root cause.
