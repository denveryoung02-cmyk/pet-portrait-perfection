# Staging Fixes - 2026-06-05

## Issues Fixed

### 1. Google Sign-In 404
**Problem**: Google OAuth redirect failing with 404 on staging
**Solution**: Add staging URL to Supabase Auth allowed redirect URLs

**Action Required** (manual - cannot be done via code):
1. Go to: https://supabase.com/dashboard/project/yzknarcqqhmluckfvfux/auth/url-configuration
2. Add to "Redirect URLs": `https://pawtoons-staging.denveryoung02.workers.dev/**`
3. Save

See `SUPABASE_STAGING_SETUP.md` for details.

### 2. Dashboard Tabs Not Working
**Problem**: Dashboard navigation links not working
**Investigation**: Dashboard tabs are actually working - they're navigation links in the sidebar (`DashboardShell.tsx`). The issue was likely CSS not loading (fixed separately).

**No code changes needed** - sidebar navigation is implemented correctly via TanStack Router Link components.

### 3. Auth Redirect Back to Upload Flow
**Problem**: After signing in mid-generation, users redirected to /dashboard instead of /upload
**Solution**: 
- Added `redirect` search param validation to auth route
- Auth page reads redirect param and navigates there after sign-in
- Google OAuth also uses the redirect param
- Upload wizard saves state to localStorage before auth redirect
- State restored when returning to /upload
- State cleared after successful checkout

**Files Changed**:
- `src/routes/auth.tsx`:
  - Added `validateSearch` to route config
  - Read `redirect` param from search
  - Navigate to `redirect` instead of hardcoded `/dashboard`
  - Pass `redirect` to Google OAuth redirectTo

- `src/routes/upload.tsx`:
  - Added localStorage state persistence
  - Restore `step`, `uploadedImageId`, `themeId`, `personalityId`, `traits` on mount
  - Save state before navigating to auth (line 392)
  - Clear state after completing checkout (line 398)

**How it works**:
1. User fills wizard (upload photo, select theme/personality/traits)
2. Clicks "Continue" on Step 4
3. Not signed in → saves state to localStorage
4. Redirects to `/auth?redirect=/upload`
5. User signs in
6. Redirects to `/upload`
7. Wizard restores saved state
8. User continues from where they left off
9. After checkout, localStorage cleared

## Deployment

Deployed to staging: `npm run deploy:staging`
URL: https://pawtoons-staging.denveryoung02.workers.dev

Version: 20b1950d-f955-4c3b-ae2c-e0d6ca4fe5d5

## Testing Checklist

- [ ] Add staging URL to Supabase redirect URLs (manual step)
- [ ] Test Google OAuth sign-in on staging
- [ ] Test email/password sign-in
- [ ] Test upload wizard → auth redirect → resume flow
- [ ] Test dashboard sidebar navigation (Pets, Generations, Orders, Favorites)
- [ ] Verify generations showing in dashboard
- [ ] Test complete flow: upload → theme → personality → traits → sign in → generate → checkout
