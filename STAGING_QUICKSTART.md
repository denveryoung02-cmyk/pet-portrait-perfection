# Staging Environment Quick Start

## ✅ What's Done

Staging environment is now live at: **https://pawtoons-staging.denveryoung02.workers.dev**

- ✅ Staging worker created: `pawtoons-staging`
- ✅ Deploy script added: `npm run deploy:staging`
- ✅ Separate configuration: `wrangler.staging.jsonc`
- ✅ Documentation updated in `CLAUDE.md`
- ✅ Setup script created: `scripts/setup-staging-secrets.ps1`

## ⏳ Next Steps

### 1. Configure Staging Secrets

The staging worker is deployed but **needs secrets configured** before it will work.

**Option A: Interactive Script (Recommended)**
```powershell
.\scripts\setup-staging-secrets.ps1
```

**Option B: Manual Setup**
```bash
# OpenAI
echo "your-openai-key" | npx wrangler secret put OPENAI_API_KEY --name pawtoons-staging

# Stripe (USE TEST KEYS)
echo "sk_test_..." | npx wrangler secret put STRIPE_SECRET_KEY --name pawtoons-staging
echo "whsec_..." | npx wrangler secret put STRIPE_WEBHOOK_SECRET --name pawtoons-staging
echo "pk_test_..." | npx wrangler secret put VITE_STRIPE_PUBLISHABLE_KEY --name pawtoons-staging

# Supabase
echo "https://yzknarcqqhmluckfvfux.supabase.co" | npx wrangler secret put SUPABASE_URL --name pawtoons-staging
echo "your-supabase-anon-key" | npx wrangler secret put SUPABASE_PUBLISHABLE_KEY --name pawtoons-staging
echo "your-supabase-service-key" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name pawtoons-staging
echo "https://yzknarcqqhmluckfvfux.supabase.co" | npx wrangler secret put VITE_SUPABASE_URL --name pawtoons-staging
echo "your-supabase-anon-key" | npx wrangler secret put VITE_SUPABASE_PUBLISHABLE_KEY --name pawtoons-staging
echo "yzknarcqqhmluckfvfux" | npx wrangler secret put VITE_SUPABASE_PROJECT_ID --name pawtoons-staging
```

### 2. Verify Secrets

```bash
npx wrangler secret list --name pawtoons-staging
```

You should see 10 secrets listed.

### 3. Test Staging

1. Visit: https://pawtoons-staging.denveryoung02.workers.dev
2. Upload a pet photo
3. Select theme + personality
4. Generate portrait (uses OpenAI)
5. Test checkout (uses Stripe TEST mode — no real charges)

## 📋 Deployment Workflow

```bash
# 1. Make changes to code
# 2. Test locally
npm run dev

# 3. Deploy to STAGING
npm run deploy:staging

# 4. Test on staging
# Visit: https://pawtoons-staging.denveryoung02.workers.dev

# 5. When ready, deploy to PRODUCTION
npm run deploy
```

## 🔐 Important Notes

### Stripe Keys
- **Staging**: Use TEST keys (`sk_test_...` and `pk_test_...`)
- **Production**: Uses LIVE keys (`sk_live_...` and `pk_live_...`)

### Workers
- **Staging**: `pawtoons-staging` (new)
- **Production**: `tanstack-start-app` (serves pawtoons.co)
- **Old**: `pawtoons-pet-portrait-perfection` (can be deleted)

### Safety
- Staging is **completely isolated** from production
- Changes to staging **do not affect** pawtoons.co
- Test thoroughly on staging before deploying to production

## 🛠️ Troubleshooting

### Staging site shows errors
- Check secrets are configured: `npx wrangler secret list --name pawtoons-staging`
- Check logs: `npx wrangler tail pawtoons-staging`

### Wrong worker deployed
- Staging: `npm run deploy:staging` → `pawtoons-staging`
- Production: `npm run deploy` → `tanstack-start-app`

### Need to copy production secrets to staging
```bash
# Get production secret values from Cloudflare dashboard
# Then set them for staging using the manual commands above
```

## 📚 More Info

- Full setup guide: `STAGING_SETUP.md`
- Project docs: `CLAUDE.md`
- Worker secrets comparison: `WORKER_SECRETS_COMPARISON.md`
