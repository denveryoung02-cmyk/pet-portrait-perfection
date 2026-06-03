# Deployment Guide — Cloudflare Workers

## Prerequisites

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

## Environment Variables

### Local Development

Create `.dev.vars` from `.dev.vars.example`:
```bash
cp .dev.vars.example .dev.vars
```

Fill in all values. This file is used by `npm run dev`.

### Production Deployment

**IMPORTANT**: Secrets must be set via Wrangler CLI for production deployment.

Run these commands **once** before your first deploy:

```bash
# Supabase
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_PUBLISHABLE_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put VITE_SUPABASE_URL
wrangler secret put VITE_SUPABASE_PUBLISHABLE_KEY
wrangler secret put VITE_SUPABASE_PROJECT_ID

# Stripe
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put VITE_STRIPE_PUBLISHABLE_KEY

# AI Gateway
wrangler secret put LOVABLE_API_KEY
```

You'll be prompted to enter each value. Paste from `.dev.vars` or `.env.local`.

**Verify secrets are set:**
```bash
wrangler secret list
```

## Deploy

```bash
npm run deploy
```

This will:
1. Build the app (`vite build`)
2. Deploy to Cloudflare Workers (`wrangler deploy`)

## Post-Deployment

1. **Update Stripe webhook URL** in Stripe Dashboard:
   - Production endpoint: `https://pawtoons-pet-portrait-perfection.YOUR-SUBDOMAIN.workers.dev/api/stripe/webhook`
   - Add to your Stripe Dashboard → Webhooks → Add endpoint
   - Copy the signing secret and update via:
     ```bash
     wrangler secret put STRIPE_WEBHOOK_SECRET
     ```

2. **Update Supabase redirect URLs**:
   - Add production URL to Supabase Dashboard → Authentication → URL Configuration
   - Redirect URLs: `https://pawtoons-pet-portrait-perfection.YOUR-SUBDOMAIN.workers.dev/**`

## Troubleshooting

### "STRIPE_SECRET_KEY is not configured" error

This means secrets weren't set. Run:
```bash
wrangler secret put STRIPE_SECRET_KEY
```

Check all secrets are present:
```bash
wrangler secret list
```

### Environment variable not available at runtime

Cloudflare Workers only exposes secrets set via `wrangler secret put`. Environment variables in `.dev.vars` are **local development only**.

For production, **always** use `wrangler secret put`.

## Monitoring

View logs in real-time:
```bash
wrangler tail
```

View deployment info:
```bash
wrangler deployments list
```
