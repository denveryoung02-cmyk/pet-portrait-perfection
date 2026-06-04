# Staging Environment Setup

## Overview

The project now has two deployment targets:

1. **Production** (`tanstack-start-app`) — Live site at pawtoons.co
2. **Staging** (`pawtoons-staging`) — Test environment at pawtoons-staging.denveryoung02.workers.dev

## Deployment Commands

```bash
# Deploy to STAGING (safe for testing)
npm run deploy:staging

# Deploy to PRODUCTION (live site - use with caution)
npm run deploy
```

## Configuration Files

- **Production**: `wrangler.jsonc` → worker name: `tanstack-start-app`
- **Staging**: `wrangler.staging.jsonc` → worker name: `pawtoons-staging`

## Setting Up Staging Secrets

Staging needs its own copy of all secrets. Copy from production or use the same values:

### Required Secrets for Staging

```bash
# OpenAI API Key
echo "your-openai-key" | npx wrangler secret put OPENAI_API_KEY --name pawtoons-staging

# Stripe Keys (use TEST mode keys for staging)
echo "sk_test_..." | npx wrangler secret put STRIPE_SECRET_KEY --name pawtoons-staging
echo "whsec_..." | npx wrangler secret put STRIPE_WEBHOOK_SECRET --name pawtoons-staging
echo "pk_test_..." | npx wrangler secret put VITE_STRIPE_PUBLISHABLE_KEY --name pawtoons-staging

# Supabase Keys (same as production or separate staging project)
echo "https://yzknarcqqhmluckfvfux.supabase.co" | npx wrangler secret put SUPABASE_URL --name pawtoons-staging
echo "your-supabase-publishable-key" | npx wrangler secret put SUPABASE_PUBLISHABLE_KEY --name pawtoons-staging
echo "your-supabase-service-role-key" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name pawtoons-staging

# Supabase Public Keys (client-side)
echo "https://yzknarcqqhmluckfvfux.supabase.co" | npx wrangler secret put VITE_SUPABASE_URL --name pawtoons-staging
echo "your-supabase-publishable-key" | npx wrangler secret put VITE_SUPABASE_PUBLISHABLE_KEY --name pawtoons-staging
echo "yzknarcqqhmluckfvfux" | npx wrangler secret put VITE_SUPABASE_PROJECT_ID --name pawtoons-staging
```

### Verify Secrets

```bash
# Check staging secrets
npx wrangler secret list --name pawtoons-staging

# Check production secrets
npx wrangler secret list --name tanstack-start-app
```

## Workflow

1. **Make changes** to code
2. **Test locally** with `npm run dev`
3. **Deploy to staging** with `npm run deploy:staging`
4. **Test on staging** at pawtoons-staging.denveryoung02.workers.dev
5. **Deploy to production** with `npm run deploy` when ready

## Important Notes

- **Staging uses TEST Stripe keys** — no real charges will be made
- **Production uses LIVE Stripe keys** — real charges happen here
- **Never deploy untested code to production**
- **Staging secrets are isolated** — changing staging secrets doesn't affect production

## Current Status

- ✅ Staging worker created: `pawtoons-staging`
- ✅ Deploy script added: `npm run deploy:staging`
- ⏳ Secrets need to be configured (see "Setting Up Staging Secrets" above)
- ⏳ First deployment in progress

## Troubleshooting

### "Worker not found" error
Run `npm run deploy:staging` first to create the worker, then set secrets.

### Secrets not working
Use the `echo` method to avoid encoding issues:
```bash
echo "value" | npx wrangler secret put KEY_NAME --name pawtoons-staging
```

### Wrong worker deployed
- Check `wrangler.jsonc` → deploys to `tanstack-start-app` (production)
- Check `wrangler.staging.jsonc` → deploys to `pawtoons-staging` (staging)

## Migration from Single Environment

Previously, deployments went to `pawtoons-pet-portrait-perfection` worker. Now:

- **Production**: Deploy to `tanstack-start-app` (serves pawtoons.co)
- **Staging**: Deploy to `pawtoons-staging` (testing only)
- **Old worker**: `pawtoons-pet-portrait-perfection` can be deleted or kept as backup
