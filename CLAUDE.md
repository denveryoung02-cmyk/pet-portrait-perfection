# CLAUDE.md

## CRITICAL — READ THIS FIRST
- Read this entire file before every task
- One fix at a time, targeted edits only
- No guessing — read relevant files first, state facts only
- Never use words like "probably" or "possibly"
- Deploy to staging only (`npm run deploy:staging`) unless explicitly told otherwise

## Project
Pawtoons — AI pet portrait service. Upload photo → select theme → pay £1.99 → instant digital download.

**[NOTE: source file said £2.99 here but £1.99 in the Rules section below — used £1.99 since that's the figure in Rules and the price I have on record. Confirm this is still correct.]**

Stack: React 19 + TanStack Start + Vite + TypeScript + Tailwind 4 + Supabase + Stripe + Cloudflare Workers.

## Commands
```bash
npm run dev                # Local dev (localhost:8082)
npm run deploy:staging     # Deploy to staging
npm run deploy             # Deploy to production (pawtoons.co)
```

## Environments
- Staging: `pawtoons-staging.denveryoung02.workers.dev` (worker: `pawtoons-staging`)
- Production: `pawtoons.co` (worker: `tanstack-start-app`) — routes `pawtoons.co/*` and `www.pawtoons.co/*`
- Always deploy staging first, test, then production
- NOTE: worker `pawtoons-pet-portrait-perfection` is an unused leftover — do not deploy here; safe to ignore or delete in future cleanup

## Key Files
- `src/server.ts` — Cloudflare Workers entry, env setup, webhook handler
- `src/lib/generations.functions.ts` — OpenAI generation (GPT-4 Vision + gpt-image-1)
- `src/lib/stripe.functions.ts` — Stripe checkout session
- `src/lib/fulfillment.functions.ts` — payment verification
- `src/lib/email.server.ts` — Resend transactional email (order confirmation)
- `src/lib/watermark.server.ts` — WASM watermarking (`@cf-wasm/photon`)
- `src/services/prompts.ts` — prompt builder (themes/personalities/traits)
- `src/routes/` — file-based routing

## Key Routes
- `/upload` — 5-step wizard
- `/checkout` — watermarked preview + Stripe
- `/success` — post-payment download
- `/auth` — sign in/up
- `/_authenticated/*` — dashboard, admin

## Environment Variables
- **Public** (`VITE_` prefix): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_STRIPE_PUBLISHABLE_KEY`
- **Server only**: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `AIML_API_KEY`
- Set via: `npx wrangler secret put <KEY> --name <worker-name>`

## SEO Infrastructure (added June 2026)

### Schemas
All structured data (JSON-LD) lives in `src/lib/seo-schemas.ts` and is imported via the `@/lib/seo-schemas` alias. Includes:
- `organizationSchema`, `websiteSchema` — global, used in homepage `head()`
- `homepageProductSchema` — Product schema for homepage (currently has NO aggregateRating/review fields — see "Reviews" note below)
- `homepageFAQSchema` — FAQ schema for homepage
- `breadcrumbSchema(items)` — helper, generates BreadcrumbList for any page
- `schemaToString(schema)` — JSON.stringify wrapper for script tags

### Routes & SEO pattern
Each page route exports a `head()` function returning `meta`, `links` (canonical), and `scripts` (JSON-LD via `schemaToString`). Follow the pattern in `src/routes/dog-portraits.tsx` for any new SEO landing page.

### Blog
Blog posts live at `src/routes/blog.[slug].tsx` (e.g. `blog.complete-guide-to-ai-pet-portraits.tsx`), rendered at `/blog/[slug]`. Each post includes Article schema + FAQPage schema. The `/blog` index page lists all posts. New posts must be added to:
1. `/blog` index listing
2. `public/sitemap.xml`

### Reviews — IMPORTANT
The homepage previously had fabricated review data (fake "12,400+ reviews / 4.9 stars" + 3 fictional testimonials in both the visible copy and the Product schema). This was **REMOVED** in June 2026 since we have zero real reviews. The homepage now shows a "Why people love Pawtoons" feature-bullet section instead.

**DO NOT** re-add review counts, star ratings, or testimonials (in copy or schema) unless they are based on real customer reviews (e.g. from Trustpilot). Fake review data risks Google penalties.

### Robots & Sitemap
- `public/robots.txt` explicitly allows AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot) alongside standard search bots
- `public/sitemap.xml` must be updated whenever a new page/blog post is added — currently 14 URLs

### Search Console
Site verified on both Google Search Console (URL prefix) and Bing Webmaster Tools (meta tag in homepage head). Sitemap submitted to both.

## Rules
- No guessing — read the relevant files first and state facts only before suggesting any fix. Never use words like "probably" or "possibly". If cause is unknown, read more files until it is known.
- One fix at a time, targeted edits only, never rewrite full files
- Digital download only — no physical products, no shipping
- Price: £1.99
- All previews watermarked until payment confirmed
- Mobile-first (320px+)
- Never commit API keys
- Conventional commits: `feat`/`fix`/`chore`/`refactor`
- Cloudflare Workers env vars accessed via `context.env` — never `process.env` or `import.meta.env`
