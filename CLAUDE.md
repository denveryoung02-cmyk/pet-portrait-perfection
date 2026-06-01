# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pawtoons (Pet Portrait Perfection)** — AI-powered pet portrait generation service where users upload a pet photo, select a theme + personality, pay £2.99 via Stripe, and receive a high-quality downloadable portrait.

**Stack**: React 19 + TanStack Start (SSR) + Vite + TypeScript + Tailwind CSS 4 + Supabase + Stripe + Cloudflare Workers deployment.

## Common Commands

```bash
# Development
npm run dev                  # Start dev server on localhost:3000

# Build & Deploy
npm run build                # Production build (outputs to dist/)
npm run build:dev            # Development mode build
npm run deploy               # Build + deploy to Cloudflare Workers
npm run preview              # Preview production build locally

# Code Quality
npm run lint                 # ESLint check
npm run format               # Prettier auto-format
```

### Testing Stripe Webhooks Locally

Stripe webhook handler runs at `/api/stripe/webhook`. To test locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The webhook is handled BEFORE the TanStack router (in `src/server.ts`) to capture raw request body for signature verification.

## Architecture

### Routing & Server

- **Framework**: TanStack Start (file-based routing + SSR)
- **Entry points**: 
  - `src/start.ts` — client entry
  - `src/server.ts` — Cloudflare Workers fetch handler
- **Routes**: `src/routes/` (file-based, auto-generated tree in `src/routeTree.gen.ts`)
- **Key routes**:
  - `/upload` — main wizard (upload photo → select theme/personality/traits → generate)
  - `/checkout` — Stripe checkout page with watermarked preview
  - `/success` — post-payment success page (unwatermarked download)
  - `/auth` — sign-in/sign-up
  - `/_authenticated/*` — protected routes (dashboard, admin)

### Server Functions

TanStack Start server functions (created with `createServerFn`) live in `src/lib/*.functions.ts`:

- `generations.functions.ts` — `generatePawtoon()` orchestrates AI generation via Google Gemini API
- `stripe.functions.ts` — `createCheckoutSession()` initiates Stripe checkout
- `fulfillment.functions.ts` — `confirmCheckout()` verifies payment, grants access
- `fulfillment.server.ts` — `verifyStripeWebhook()` and `recordPaidOrder()` handle webhook events

All authenticated server functions use `requireSupabaseAuth` middleware.

### AI Generation Flow

1. User uploads pet photo → `uploads.ts` service → Supabase storage (`pet-uploads` bucket)
2. User selects theme/personality/traits → calls `generatePawtoon()`
3. `generatePawtoon()` (in `generations.functions.ts`):
   - Builds prompt via `buildPrompt()` from `services/prompts.ts`
   - Downloads source photo from Supabase
   - Sends to Google Gemini API (`gemini-2.5-flash-image` model)
   - Bakes watermark on result via `watermark.server.ts` (WASM-based `@cf-wasm/photon`)
   - Uploads both watermarked + unwatermarked versions to `caricatures` bucket
   - Writes `generations` table row with paths
4. User proceeds to checkout → watermarked preview shown
5. Post-payment → success page serves unwatermarked version via signed URL

### Prompt Engineering System

`src/services/prompts.ts` — modular prompt builder combining:

- **Theme styles** (`THEME_STYLE` record): royal, mafia, viking, astronaut, superhero, pirate
- **Personality hints** (`PERSONALITY_HINTS` record): 24 personalities mapped to visual directives
- **Trait hints** (`TRAIT_HINTS` record): funny, grumpy, energetic, lazy, chaotic, elegant, dramatic, mischievous

`buildPrompt()` assembles a production-ready prompt string. `describePrompt()` generates short human-readable labels.

### Payment & Fulfillment

- **Price**: Fixed at £2.99 (299 pence) — digital download only, no merchandise
- **Stripe mode**: Test mode
- **Checkout flow**:
  1. `createCheckoutSession()` generates Stripe checkout session with `generationId` in metadata
  2. User completes payment
  3. Stripe webhook (`/api/stripe/webhook`) fires `checkout.session.completed` → `recordPaidOrder()`
  4. Success page also calls `confirmCheckout()` as backstop (idempotent via `session_id` uniqueness)
- **Order tracking**: `orders` table links `session_id` → `generation_id`, records `paid_at`

### Watermarking

`src/lib/watermark.server.ts` — server-only WASM watermarking:

- Uses `@cf-wasm/photon` library (Cloudflare Workers compatible)
- Text overlay: "PAWTOONS PREVIEW" diagonal across center
- Applied to ALL preview images before checkout
- Unwatermarked versions protected by Supabase RLS + signed URLs (payment-gated)

### Database (Supabase)

Tables managed via `supabase/migrations/*.sql`:

- `uploaded_images` — pet photos (RLS: owner-only read/write)
- `generations` — AI-generated portraits (RLS: owner-only read, links to `uploaded_images`)
- `orders` — payment records (RLS: owner-only read)

Storage buckets:

- `pet-uploads` — user-uploaded photos (private, RLS-protected)
- `caricatures` — generated portraits (private, signed-URL access only)

Auth: Supabase Auth with Google OAuth provider configured.

### Styling & Components

- **Tailwind CSS 4** (configured in `@tailwindcss/vite`)
- **Component library**: `src/components/ui/` — shadcn-style primitives (Radix UI + Tailwind)
- **Custom components**: `src/components/` (Nav, Footer, etc.)
- **Mobile-first responsive design**: Progressive padding/text scales (`px-4 sm:px-5 md:px-8`, etc.)
- **Safe area utilities**: `.safe-bottom`, `.safe-top`, etc. for iOS notched devices (defined in `src/styles.css`)

Recent mobile audit fixes documented in `MOBILE_AUDIT_FIXES.md`.

## Environment Variables

Required vars (see `.env.example`):

**Public** (prefixed with `VITE_`, safe for browser):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_STRIPE_PUBLISHABLE_KEY`

**Server-side only** (never expose):
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `LOVABLE_API_KEY` — for Gemini API access via Lovable AI Gateway
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Store in `.env.local` (gitignored). For Cloudflare Workers deployment, set via Wrangler secrets or `.dev.vars`.

## Development Workflow

Per `AI_RULES.md` (token reduction rules):

- **One task/component/bug at a time**
- **Return only required code changes** — never rewrite full files unless requested
- **Targeted edits only** — edit specific functions/sections, not entire pages
- **Reuse existing components** — do not create new ones unnecessarily
- **Preserve current styling** — match existing Tailwind patterns
- **Minimize dependencies** — use existing libraries where possible

## Key Constraints

1. **Digital downloads only** — no physical merchandise, no shipping, no sizes/colors
2. **Fixed price** — always £2.99, no variants
3. **Watermark enforcement** — all previews watermarked until payment confirmed
4. **No secrets in code** — never commit `.env.local` or hardcode API keys
5. **Mobile-first responsive** — all UI changes must work on mobile (320px+)
6. **Conventional commits** — use `feat:`, `fix:`, `chore:`, `refactor:` prefixes

## Deployment

Target: **Cloudflare Workers** (not Vercel)

```bash
npm run deploy
```

Builds via Vite, outputs to `dist/`, deploys via Wrangler using config in `wrangler.jsonc`.

Ensure all environment variables are set in Cloudflare dashboard or via `wrangler secret put`.

## Notes

- **Lovable export**: Project originally exported from Lovable, now maintained locally
- **Bun lock exists** (`bun.lock`) but project uses npm
- **Route tree is generated** — `src/routeTree.gen.ts` auto-generated by `@tanstack/router-plugin`, do not edit manually
- **Step count is 5** — upload wizard has 5 steps (was incorrectly 7 in old UI, now fixed)
