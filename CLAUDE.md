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
- `wrangler.jsonc` name is `tanstack-start-app` — `vite build` generates `dist/server/wrangler.json` from this, which `npm run deploy` uses
- NOTE: worker `pawtoons-pet-portrait-perfection` is an unused leftover — do not deploy here. It was previously the name in `wrangler.jsonc`, causing all production deploys to go to the wrong worker. Fixed 2026-06-30.

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

## Token Efficiency Rules (read before every session)

These rules exist to reduce unnecessary token usage. Follow them strictly.

### Before reading ANY file
1. Check if the answer is already in this CLAUDE.md
2. Only read files directly relevant to the current task
3. Never read the full /src directory tree unless explicitly asked
4. Never audit the whole codebase for a single-file fix

### Key files map — read ONLY what the task needs
| Task area | File(s) to read |
|-----------|----------------|
| Image generation / variants | src/lib/generations.functions.ts |
| AI prompts / styles / themes | src/services/prompts.ts |
| Upload wizard UI | src/routes/upload.tsx |
| Homepage | src/routes/index.tsx |
| Checkout | src/routes/checkout.tsx |
| Post-payment / download | src/lib/fulfillment.server.ts + fulfillment.functions.ts |
| Stripe / payments | src/lib/stripe.functions.ts |
| Email | src/lib/email.server.ts |
| Watermark | src/lib/watermark.server.ts |
| SEO schemas | src/lib/seo-schemas.ts |
| Analytics / funnel tracking | src/lib/analytics.ts |
| Nav / Footer layout | src/components/Nav.tsx, src/components/Footer.tsx |
| SEO landing pages | src/routes/[page-name].tsx |
| Blog posts | src/routes/blog.[slug].tsx |
| Sitemap | public/sitemap.xml |
| Robots | public/robots.txt |
| Server entry / webhooks | src/server.ts |

### Architecture facts (don't re-read files to confirm these)
- Auth: Supabase via requireSupabaseAuth middleware — always required on server functions
- Styling: Tailwind CSS 4, CSS custom properties for design tokens — no inline styles
- Image generation: gpt-image-1 at 1024×1024, quality:"auto" (= medium)
- Three variants (v1/v2/v3) generated as separate sequential Worker invocations
- Variant data stored in generation_params JSONB column (variantPreviews + variantCleanPaths)
- Watermarks: applied server-side via @cf-wasm/photon, stored in caricature-previews bucket
- Clean images: stored in caricatures-clean bucket, signed URL delivered post-payment
- Funnel events: fire-and-forget inserts to funnel_events table in Supabase
- Worker CPU limit: 30,000ms CPU time (network I/O is free, doesn't count toward limit)
- Wall-clock limit: ~30s per Worker invocation — sequential OpenAI calls must each fit within this
- Pawtoons is digital-only — no physical products, no shipping, no merchandise

### Diff output rules
- Summarise changes in a table — don't reproduce unchanged code
- Only show full code blocks when the change is complex and context is essential
- State line numbers for targeted edits

### Known issues / debt (don't re-investigate these)
- worker pawtoons-pet-portrait-perfection is an unused leftover — ignore it
- £2.99 NOTE in line 13 is stale — correct price is £1.99, ignore the note
- Cloudflare Web Analytics is pageview-only — custom events use Supabase funnel_events table instead
- normalizeCatastrophicSsrResponse in server.ts only applies to GET requests (POST errors pass through as-is — this is intentional, fixed June 2026)
