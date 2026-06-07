# CLAUDE.md

## Project
Pawtoons — AI pet portrait service. Upload photo → select theme → pay £2.99 → instant digital download.
Stack: React 19 + TanStack Start + Vite + TypeScript + Tailwind 4 + Supabase + Stripe + Cloudflare Workers.

## Commands
npm run dev                # Local dev (localhost:3000)
npm run deploy:staging     # Deploy to staging
npm run deploy             # Deploy to production (pawtoons.co)

## Environments
- Staging: pawtoons-staging.denveryoung02.workers.dev (worker: pawtoons-staging)
- Production: pawtoons.co (worker: tanstack-start-app)
- Always deploy staging first, test, then production.

## Key Files
- src/server.ts — Cloudflare Workers entry, env setup, webhook handler
- src/lib/generations.functions.ts — OpenAI generation (GPT-4 Vision + gpt-image-1)
- src/lib/stripe.functions.ts — Stripe checkout session
- src/lib/fulfillment.functions.ts — payment verification
- src/lib/watermark.server.ts — WASM watermarking (@cf-wasm/photon)
- src/services/prompts.ts — prompt builder (themes/personalities/traits)
- src/routes/ — file-based routing

## Key Routes
- /upload — 5-step wizard
- /checkout — watermarked preview + Stripe
- /success — post-payment download
- /auth — sign in/up
- /_authenticated/* — dashboard, admin

## Environment Variables
Public (VITE_ prefix): VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID, VITE_STRIPE_PUBLISHABLE_KEY
Server only: SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
Set via: npx wrangler secret put <KEY> --name <worker-name>

## Rules
- No guessing — read the relevant files first and state facts only before suggesting any fix. Never use words like 'probably' or 'possibly'. If cause is unknown, read more files until it is known.
- One fix at a time, targeted edits only, never rewrite full files
- Digital download only — no physical products, no shipping
- Price always £2.99
- All previews watermarked until payment confirmed
- Mobile-first (320px+)
- Never commit API keys
- Conventional commits: feat/fix/chore/refactor
- Cloudflare Workers env vars accessed via context.env — never process.env or import.meta.env
