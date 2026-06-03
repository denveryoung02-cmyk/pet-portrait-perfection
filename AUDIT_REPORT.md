# Codebase Audit Report — Environment Variables & Lovable References

**Date**: 2026-06-03  
**Issue**: Persistent "Invalid API key" errors and Lovable references

---

## 🔴 CRITICAL ISSUES FOUND

### 1. GEMINI API KEY ISSUE

**Problem**: The app uses a **Lovable AI Gateway proxy key** (`AQ.Ab8RN6...REDACTED`), but this is **NOT a valid Google Gemini API key**.

**Location**: 
- `.dev.vars` line 18-19
- `.env.local` (assumed same value)
- Cloudflare Workers secret: `LOVABLE_API_KEY`

**Root Cause**: The project was exported from Lovable, which provides a proxy to Google Gemini API. The key `AQ.Ab8RN6...` is a Lovable proxy credential, NOT a direct Google Gemini API key.

**Expected Format**: A real Google Gemini API key looks like: `AIzaSy...` (starts with `AIzaSy`)

**Fix Required**:
1. Get a real Google Gemini API key from: https://aistudio.google.com/apikey
2. Update Cloudflare Workers secret:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
3. Update `.dev.vars` with the new key

---

### 2. LOVABLE REFERENCES — Complete Inventory

#### **A. Package Dependencies (CANNOT be removed without breaking build)**

| File | Reference | Can Remove? |
|------|-----------|-------------|
| `package.json:19` | `@lovable.dev/cloud-auth-js` | ❌ Used by `src/integrations/lovable/index.ts` |
| `package.json:75` | `@lovable.dev/vite-tanstack-config` | ❌ Used by `vite.config.ts` |
| `vite.config.ts:1` | `import { defineConfig } from "@lovable.dev/vite-tanstack-config"` | ❌ Core build config |

**Status**: These packages are **build-critical**. The `@lovable.dev/vite-tanstack-config` package wraps TanStack Start configuration. Removing it would require rewriting `vite.config.ts` from scratch.

**Recommendation**: Leave these dependencies as-is. They are stable and don't cause runtime issues.

#### **B. Source Code References (CAN be removed)**

| File | Lines | Reference | Fix |
|------|-------|-----------|-----|
| `src/integrations/lovable/index.ts` | 1-38 | Lovable auth wrapper | ✅ Replace with direct Supabase auth |
| `src/routes/auth.tsx` | 4 | `import { lovable } from "@/integrations/lovable"` | ✅ Use Supabase directly |
| `src/routes/auth.tsx` | 60 | `lovable.auth.signInWithOAuth("google", ...)` | ✅ Use `supabase.auth.signInWithOAuth()` |

**Action Required**: Replace Lovable auth wrapper with direct Supabase calls.

#### **C. Documentation References (SHOULD be updated)**

| File | Lines | Reference | Fix |
|------|-------|-----------|-----|
| `.env.example` | 1, 13, 15, 17, 24 | Lovable Cloud comments | ✅ Update to "Direct Google Gemini API" |
| `.dev.vars.example` | 19 | `LOVABLE_API_KEY=` | ✅ Rename to `GEMINI_API_KEY=` |
| `CLAUDE.md` | 149 | "LOVABLE_API_KEY — for Gemini API access via Lovable AI Gateway" | ✅ Update to direct Gemini |
| `CLAUDE.md` | 189 | "Lovable export" note | ✅ Keep (historical context) |
| `DEPLOYMENT.md` | 47 | `wrangler secret put LOVABLE_API_KEY` | ✅ Change to `GEMINI_API_KEY` |
| `CHANGELOG.md` | 4 | "Exported project from Lovable" | ✅ Keep (historical) |
| `PROJECT.md` | 10 | "Project exported from Lovable..." | ✅ Keep (historical) |

#### **D. Lock Files & Config (Do NOT modify manually)**

- `bun.lock` — auto-generated, ignore
- `package-lock.json` — auto-generated, ignore
- `bunfig.toml` — Bun config, leave as-is

---

## ✅ ENVIRONMENT VARIABLES AUDIT

### **All Required Environment Variables**

#### **Server-Side (Cloudflare Workers Secrets)**

| Variable | Purpose | Currently Set? | Access Pattern | Status |
|----------|---------|----------------|----------------|--------|
| `SUPABASE_URL` | Supabase project URL | ✅ Yes | `getEnv().SUPABASE_URL` | ✅ Correct |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | ✅ Yes | `getEnv().SUPABASE_PUBLISHABLE_KEY` | ✅ Correct |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (bypasses RLS) | ✅ Yes | `getEnv().SUPABASE_SERVICE_ROLE_KEY` | ✅ Correct |
| `STRIPE_SECRET_KEY` | Stripe API secret | ✅ Yes | `getEnv().STRIPE_SECRET_KEY` | ✅ Correct |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | ✅ Yes | `getEnv().STRIPE_WEBHOOK_SECRET` | ✅ Correct |
| `LOVABLE_API_KEY` | **INVALID** Lovable proxy key | ✅ Yes | `getEnv().LOVABLE_API_KEY` | 🔴 **WRONG KEY** |
| `GEMINI_API_KEY` | Google Gemini API key | ❌ **NOT SET** | `getEnv().GEMINI_API_KEY` | 🔴 **MISSING** |

#### **Client-Side (Public, embedded in build)**

| Variable | Purpose | Access Pattern | Status |
|----------|---------|----------------|--------|
| `VITE_SUPABASE_URL` | Supabase URL for browser | `import.meta.env.VITE_SUPABASE_URL` | ✅ Correct |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key for browser | `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Correct |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID | `import.meta.env.VITE_SUPABASE_PROJECT_ID` | ✅ Correct |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY` | ✅ Correct |

---

## 🔧 ENVIRONMENT VARIABLE ACCESS PATTERNS

### **✅ CORRECT PATTERNS (Cloudflare Workers Compatible)**

All server-side code correctly uses the `getEnv()` pattern:

```typescript
// ✅ CORRECT — Used everywhere in server code
import { getEnv } from '@/lib/env.server';
const env = getEnv();
const apiKey = env.STRIPE_SECRET_KEY;
```

**Files using this pattern correctly**:
- ✅ `src/server.ts:76` — Stripe webhook secret
- ✅ `src/lib/stripe.functions.ts:16-17` — Stripe secret key
- ✅ `src/lib/generations.functions.ts:89-90` — Gemini API key
- ✅ `src/lib/fulfillment.server.ts:26-27` — Stripe secret key
- ✅ `src/integrations/supabase/client.server.ts:10-11` — Supabase admin client
- ✅ `src/integrations/supabase/auth-middleware.ts:12-14` — Supabase auth

### **✅ CORRECT CLIENT-SIDE PATTERN**

```typescript
// ✅ CORRECT — Used in browser/client code only
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
```

**Files using this pattern correctly**:
- ✅ `src/integrations/supabase/client.ts:5-6` — Client-side Supabase init

---

## 📋 IMMEDIATE ACTION PLAN

### **Step 1: Get a Real Google Gemini API Key**
1. Go to: https://aistudio.google.com/apikey
2. Create a new API key
3. Copy the key (starts with `AIzaSy...`)

### **Step 2: Update Cloudflare Workers Secrets**
```bash
# Set the real Gemini API key
wrangler secret put GEMINI_API_KEY
# Paste the new key when prompted

# Optional: Remove the old Lovable key (but keep fallback in code for now)
# wrangler secret delete LOVABLE_API_KEY
```

### **Step 3: Update Local Development Files**
```bash
# Update .dev.vars
GEMINI_API_KEY=AIzaSy...YOUR_REAL_KEY_HERE

# Keep LOVABLE_API_KEY line commented or remove it
# LOVABLE_API_KEY=AQ.Ab8RN6... (OLD, DO NOT USE)
```

### **Step 4: Update Code to Prefer GEMINI_API_KEY**

**File**: `src/lib/generations.functions.ts`

Change line 90 from:
```typescript
const apiKey = env.LOVABLE_API_KEY ?? env.GEMINI_API_KEY;
```

To:
```typescript
const apiKey = env.GEMINI_API_KEY;
```

### **Step 5: Remove Lovable Auth Wrapper**

**File**: `src/routes/auth.tsx`

Change line 60 from:
```typescript
const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: ... });
```

To:
```typescript
const r = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: ... } });
```

Then remove:
- Line 4: `import { lovable } from "@/integrations/lovable";`
- Entire file: `src/integrations/lovable/index.ts`

### **Step 6: Update Documentation**

Update these files to remove Lovable references:
- `.env.example` — change "Lovable AI Gateway" to "Google Gemini API"
- `.dev.vars.example` — rename `LOVABLE_API_KEY` to `GEMINI_API_KEY`
- `CLAUDE.md` line 149 — update description
- `DEPLOYMENT.md` line 47 — change secret name

---

## 🎯 SUMMARY

### **Root Cause of "Invalid API key" Error**
The app is using a **Lovable proxy key** (`AQ.Ab8RN6...`) instead of a **real Google Gemini API key** (`AIzaSy...`).

### **Why Lovable References Keep Coming Back**
1. **Build dependencies cannot be removed** — `@lovable.dev/*` packages are baked into the build system
2. **Only runtime references need fixing** — auth wrapper and documentation

### **What Must Be Fixed**
1. 🔴 Get real Google Gemini API key
2. 🔴 Update Cloudflare secrets
3. 🟡 Remove Lovable auth wrapper (use Supabase directly)
4. 🟡 Update documentation

### **What Can Stay**
1. ✅ Build dependencies (`package.json`, `vite.config.ts`)
2. ✅ Historical notes in CHANGELOG/PROJECT.md
3. ✅ Lock files (auto-generated)

---

**End of Audit Report**
