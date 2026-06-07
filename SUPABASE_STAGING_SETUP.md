# Supabase Configuration for Staging

## Google OAuth Redirect URL

Add staging URL to Supabase Auth allowed redirect URLs:

1. Go to: https://supabase.com/dashboard/project/yzknarcqqhmluckfvfux/auth/url-configuration
2. Add to "Redirect URLs" section:
   ```
   https://pawtoons-staging.denveryoung02.workers.dev/**
   ```
3. Save

This allows Google OAuth to redirect back to staging after authentication.

## Current Redirect URLs Should Include

- `http://localhost:3000/**` (local dev)
- `https://pawtoons.co/**` (production)
- `https://pawtoons-staging.denveryoung02.workers.dev/**` (staging)
