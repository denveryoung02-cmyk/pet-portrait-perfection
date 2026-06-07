# Stripe Live Mode Setup Guide

**Date**: 2026-06-04  
**Purpose**: Switch from Stripe test mode to live mode for production payments

---

## Prerequisites

✅ Cloudflare Workers Paid plan active ($5/month)  
✅ Pawtoons app deployed and tested in test mode  
✅ Stripe account verified and ready for live payments

---

## Step 1: Get Live Stripe Keys

### 1a. Go to Stripe Dashboard
Visit: https://dashboard.stripe.com/apikeys

### 1b. Switch to Live Mode
- Look for toggle switch in **top-right corner**
- Click to switch from **Test mode** → **Live mode**
- Confirm you see "Viewing live data" indicator

### 1c. Copy API Keys

**Secret key** (for server-side):
- Click **"Reveal live key"** under "Secret key"
- Starts with: `sk_live_...`
- **Copy this key** (you'll need it in Step 2)

**Publishable key** (for client-side):
- Already visible under "Publishable key"
- Starts with: `pk_live_...`
- **Copy this key** (you'll need it in Step 2)

---

## Step 2: Set Cloudflare Workers Secrets

Run these commands **one at a time** from the project directory:

### Command 1: Set Secret Key
```bash
npx wrangler secret put STRIPE_SECRET_KEY --name pawtoons-pet-portrait-perfection
```

**When prompted**: Paste your `sk_live_...` key and press Enter

**Expected output**:
```
🌀 Creating the secret for the Worker "pawtoons-pet-portrait-perfection"
✨ Success! Uploaded secret STRIPE_SECRET_KEY
```

### Command 2: Set Publishable Key
```bash
npx wrangler secret put VITE_STRIPE_PUBLISHABLE_KEY --name pawtoons-pet-portrait-perfection
```

**When prompted**: Paste your `pk_live_...` key and press Enter

---

## Step 3: Configure Live Webhook

### 3a. Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. **Verify you're in Live mode** (top-right toggle)
3. Click **"Add endpoint"** button

### 3b. Configure Endpoint

**Endpoint URL**:
```
https://pawtoons-pet-portrait-perfection.denveryoung02.workers.dev/api/stripe/webhook
```

**Description** (optional):
```
Pawtoons production webhook - checkout session completed
```

**Events to send**:
- Click **"Select events"**
- Search for: `checkout.session.completed`
- Check the box next to it
- Click **"Add events"**

**API version**: Leave as default (latest)

### 3c. Get Signing Secret

1. Click **"Add endpoint"** to save
2. You'll see your new webhook in the list
3. Click on the webhook endpoint you just created
4. Scroll down to **"Signing secret"**
5. Click **"Reveal"** next to the signing secret
6. **Copy the secret** (starts with `whsec_...`)

### 3d. Set Webhook Secret
```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name pawtoons-pet-portrait-perfection
```

**When prompted**: Paste your `whsec_...` key and press Enter

---

## Step 4: Update Local Development (.dev.vars)

Open `.dev.vars` file and update lines 13-15:

```bash
# ─── Stripe ──────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_LIVE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

**⚠️ Important**: 
- Replace the `sk_test_...`, `whsec_...`, and `pk_test_...` values
- **DO NOT commit .dev.vars to git** (it's already in .gitignore)

---

## Step 5: Verify Secrets Are Set

Check all three secrets are configured:

```bash
npx wrangler secret list --name pawtoons-pet-portrait-perfection
```

**Expected output** (should see all three):
```json
[
  { "name": "STRIPE_SECRET_KEY", "type": "secret_text" },
  { "name": "STRIPE_WEBHOOK_SECRET", "type": "secret_text" },
  { "name": "VITE_STRIPE_PUBLISHABLE_KEY", "type": "secret_text" },
  ...
]
```

---

## Step 6: Deploy (Optional but Recommended)

Redeploy to ensure all changes are active:

```bash
npm run deploy
```

**Expected**: Build succeeds, deployment completes

---

## Step 7: Test Live Payment

### 7a. Visit Production App
```
https://pawtoons-pet-portrait-perfection.denveryoung02.workers.dev/upload
```

### 7b. Complete Full Flow

1. **Sign in** with Google
2. **Upload** a pet photo
3. **Select** theme + personality
4. **Generate** portrait (should complete in 15-40 seconds)
5. **Click "Checkout"**
6. **Verify**: Stripe checkout page loads
7. **Check**: URL should be `checkout.stripe.com` (live mode)

### 7c. Make Test Payment

**⚠️ This will charge a REAL credit card £2.99**

Use a real card (NOT test card `4242 4242 4242 4242`):
- Enter real card number
- Enter real email
- Click **"Pay £2.99"**

### 7d. Verify Success

1. **Success page** should load with unwatermarked download
2. **Stripe Dashboard** → Payments → Should see £2.99 payment
3. **Check webhook logs**:
   - Stripe Dashboard → Webhooks → Click your endpoint
   - Should see `checkout.session.completed` event with ✅ success

---

## Step 8: Monitor Logs

Watch for any errors:

```bash
npx wrangler tail pawtoons-pet-portrait-perfection --format pretty
```

**Look for**:
- ✅ `[createCheckoutSession]` calls succeeding
- ✅ Webhook events processed successfully
- ✅ No "Invalid API key" errors
- ❌ Any 401 errors from Stripe (means keys are wrong)

---

## Troubleshooting

### Error: "No such customer / Invalid API key"
**Cause**: Using test mode key in live mode (or vice versa)
**Fix**: 
1. Verify keys start with `sk_live_` and `pk_live_`
2. Re-run `wrangler secret put` commands with correct keys
3. Redeploy: `npm run deploy`

### Webhook Not Firing
**Cause**: Webhook endpoint not configured or wrong URL
**Fix**:
1. Check Stripe Dashboard → Webhooks → Endpoint URL is correct
2. Test webhook: Click "Send test webhook" in Stripe dashboard
3. Check logs: `npx wrangler tail`

### Payment Succeeds but Success Page Shows Watermark
**Cause**: Webhook didn't fire or failed to process
**Fix**:
1. Check Stripe Dashboard → Webhooks → Recent deliveries
2. Look for failed webhook attempts (will show red X)
3. Click failed event to see error details
4. Check server logs for webhook processing errors

### Test Cards Don't Work
**Cause**: You're in live mode - test cards are disabled
**Fix**: This is expected! Live mode requires real credit cards.

---

## Rollback to Test Mode (If Needed)

If you need to revert to test mode:

1. Get test keys from Stripe (toggle to Test mode)
2. Run same `wrangler secret put` commands with test keys:
   - `sk_test_...`
   - `pk_test_...`
   - `whsec_...` (from test mode webhook)
3. Update `.dev.vars` with test keys
4. Redeploy: `npm run deploy`

---

## Important Security Notes

### DO NOT:
- ❌ Commit live keys to git
- ❌ Share live keys in public forums
- ❌ Use live keys in client-side code (only `pk_live_` is safe)
- ❌ Hardcode keys in source files

### DO:
- ✅ Keep `.dev.vars` in `.gitignore` (already done)
- ✅ Use `wrangler secret put` for all sensitive keys
- ✅ Store backup of keys in secure password manager
- ✅ Rotate keys if compromised (Stripe Dashboard → Roll key)

---

## Post-Setup Checklist

- [ ] Live secret key set in Cloudflare Workers
- [ ] Live publishable key set in Cloudflare Workers
- [ ] Live webhook configured in Stripe Dashboard
- [ ] Webhook secret set in Cloudflare Workers
- [ ] `.dev.vars` updated with live keys (NOT committed)
- [ ] Deployed to production
- [ ] Test payment completed successfully (£2.99 charged)
- [ ] Webhook fired and processed successfully
- [ ] Success page shows unwatermarked download
- [ ] Stripe Dashboard shows payment

---

## Support

**Stripe Documentation**:
- API Keys: https://stripe.com/docs/keys
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

**Stripe Support**:
- Dashboard → Help → Contact support

**Project Issues**:
- Check `ENV_CONTEXT_FIX.md` for environment variable issues
- Check `CLOUDFLARE_WORKERS_LIMITS_INVESTIGATION.md` for execution issues

---

**You're now live!** 🎉

Real customers can make real £2.99 payments for AI pet portraits.
