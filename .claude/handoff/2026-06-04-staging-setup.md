# Session Handoff: Staging Environment Setup
**Date**: 2026-06-04  
**Session**: Staging environment configuration

## What Was Done

### 1. Staging Environment Created
- **Worker name**: `pawtoons-staging`
- **URL**: https://pawtoons-staging.denveryoung02.workers.dev
- **Status**: ✅ Deployed (needs secrets configuration)

### 2. Files Created/Modified

**New Files**:
- `wrangler.staging.jsonc` — Staging worker config
- `STAGING_SETUP.md` — Complete staging setup guide
- `STAGING_QUICKSTART.md` — Quick reference for staging workflow
- `scripts/setup-staging-secrets.ps1` — Interactive secrets setup script

**Modified Files**:
- `package.json` — Added `deploy:staging` script
- `CLAUDE.md` — Updated with staging deployment workflow
- `src/lib/generations.functions.ts` — Fixed null check for `imgDownloadRes.statusText`

### 3. Deployment Commands

```bash
# Deploy to staging (safe for testing)
npm run deploy:staging

# Deploy to production (live site)
npm run deploy
```

## Current State

### Production (Untouched)
- Worker: `tanstack-start-app`
- URL: https://pawtoons.co
- Status: ✅ Live and working
- Secrets: Configured with LIVE Stripe keys

### Staging (Newly Created)
- Worker: `pawtoons-staging`
- URL: https://pawtoons-staging.denveryoung02.workers.dev
- Status: ⏳ Deployed but secrets NOT configured yet
- Secrets: **Need to be set** before testing

## Next Steps

### 1. Configure Staging Secrets

User needs to run:
```powershell
.\scripts\setup-staging-secrets.ps1
```

Or manually set these 10 secrets:
1. `OPENAI_API_KEY`
2. `STRIPE_SECRET_KEY` (TEST mode: sk_test_...)
3. `STRIPE_WEBHOOK_SECRET`
4. `VITE_STRIPE_PUBLISHABLE_KEY` (TEST mode: pk_test_...)
5. `SUPABASE_URL`
6. `SUPABASE_PUBLISHABLE_KEY`
7. `SUPABASE_SERVICE_ROLE_KEY`
8. `VITE_SUPABASE_URL`
9. `VITE_SUPABASE_PUBLISHABLE_KEY`
10. `VITE_SUPABASE_PROJECT_ID`

### 2. Test Staging

After secrets are configured:
1. Visit https://pawtoons-staging.denveryoung02.workers.dev
2. Upload pet photo
3. Generate portrait (uses OpenAI)
4. Test checkout (Stripe TEST mode — no real charges)

### 3. Workflow Going Forward

```
Code change → Test locally → Deploy to staging → Test on staging → Deploy to production
```

## Known Issues

### Fixed This Session
- ✅ imgDownloadRes null check (line 195 in generations.functions.ts)
- ✅ Quality parameter changed to "auto" (was "standard")

### Outstanding Issues
1. **Checkout Error**: "STRIPE_SECRET_KEY is not configured"
   - **Cause**: Production worker `tanstack-start-app` is missing `OPENAI_API_KEY`
   - **Impact**: Checkout fails in production
   - **Fix**: Add `OPENAI_API_KEY` to `tanstack-start-app` worker
   - **Note**: This affects production, not staging

2. **Two Workers Confusion**
   - `tanstack-start-app` — Production (pawtoons.co)
   - `pawtoons-pet-portrait-perfection` — Old worker (can be deleted)
   - `pawtoons-staging` — New staging environment

## Important Notes

### Stripe Keys
- **Staging MUST use TEST keys**: `sk_test_...` and `pk_test_...`
- **Production uses LIVE keys**: `sk_live_...` and `pk_live_...`
- Never mix TEST and LIVE keys

### Worker Names
- Staging: `pawtoons-staging` (new)
- Production: `tanstack-start-app` (serves pawtoons.co)
- Legacy: `pawtoons-pet-portrait-perfection` (deployments go here via `npm run deploy` until wrangler.jsonc is updated to point to `tanstack-start-app`)

### Safety
- Staging is completely isolated from production
- Changes to staging do not affect pawtoons.co
- Always test on staging before deploying to production

## Git Status

**Committed**:
```
feat: add staging environment for safe testing before production

- Created pawtoons-staging worker
- Added npm run deploy:staging command
- Setup scripts and documentation
- Fixed imgDownloadRes null check
```

**Not Committed** (investigation/documentation files):
- `DALLE_CONTENT_POLICY_ISSUE.md`
- `GENERATION_ERROR_INVESTIGATION.md`
- `STORAGE_BUCKET_INVESTIGATION.md`
- `STRIPE_LIVE_MODE_SETUP.md`
- `WORKER_SECRETS_COMPARISON.md`

These can be committed or deleted as needed.

## Quick Reference

### Deploy to Staging
```bash
npm run deploy:staging
```

### Deploy to Production
```bash
npm run deploy
```

### Check Staging Secrets
```bash
npx wrangler secret list --name pawtoons-staging
```

### Check Production Secrets
```bash
npx wrangler secret list --name tanstack-start-app
```

### View Staging Logs
```bash
npx wrangler tail pawtoons-staging
```

## Summary

Staging environment is fully set up and deployed. The only remaining step is to configure the secrets using the setup script. Once secrets are configured, staging will be ready for testing all changes before they go to production.

Production site (pawtoons.co) remains completely untouched and continues to work as before.
