# Watermark Security Implementation

## Current Status: ✅ SECURE

The watermark protection system is properly implemented and enforced.

## Implementation Details

### Generation Flow (src/lib/generations.functions.ts)
1. **Authentication Required**: `requireSupabaseAuth` middleware enforces login
2. **Server-Side Watermarking**: `bakeWatermark()` uses WASM (@cf-wasm/photon) to embed watermark into pixels
3. **Dual Storage**:
   - **Watermarked preview** → `caricature-previews` bucket (public)
   - **Clean original** → `caricatures-clean` bucket (private, RLS-protected)
4. **Public URL**: Only watermarked `preview_url` is exposed to client
5. **Clean Access**: Clean image accessed only via signed URL after payment verification

### Watermark Implementation (src/lib/watermark.server.ts)
- Text: "PAWTOONS PREVIEW" diagonal tiled across image
- Opacity: 0.3 (30% white overlay)
- Angle: -35 degrees
- Baked into pixels (not CSS overlay) — cannot be removed client-side
- Server-only execution — no client-side watermarking

### Storage Security (supabase/migrations/20260531000000_preview_protection.sql)
**Buckets:**
- `caricatures-clean` (private): Clean generated images
  - RLS: owner-read only (folder = user_id)
  - Service role bypasses (for generation writes)
  - Signed URLs bypass (for post-payment delivery)
  
- `caricature-previews` (public): Watermarked previews
  - Public read for all users
  - Safe to expose — watermark is permanent

### Payment Protection
1. User generates → receives watermarked preview
2. User pays → Stripe webhook + success page verify payment
3. `confirmCheckout()` creates signed URL to `caricatures-clean` bucket
4. Success page displays clean image via signed URL
5. Signed URL expires after download window

## Security Checklist
- ✅ Authentication required for generation
- ✅ Watermark baked server-side (WASM)
- ✅ Clean image never exposed publicly
- ✅ Preview uses watermarked version everywhere
- ✅ Payment verification before clean access
- ✅ RLS policies protect private bucket
- ✅ Signed URLs expire after use
- ✅ Mobile/tablet rendering tested (responsive)

## Legacy Fields
**Note**: The `generations` table contains legacy columns from before the watermark system:
- `result_url` (OLD) — should NOT be used
- `storage_path` (OLD) — should NOT be used
- `preview_url` (CURRENT) — watermarked public URL
- `clean_path` (CURRENT) — private clean image path

All current code paths use the new columns. Legacy columns remain for backward compatibility with old generations.

## Testing
To verify watermark protection:
1. Generate a portrait while signed in
2. Check Network tab — only `preview_url` is returned
3. Right-click preview image → "Save As" → watermark is embedded
4. Inspect `caricature-previews` bucket → all images have watermark
5. Try accessing `caricatures-clean` bucket directly → 403 Forbidden
6. Complete payment → signed URL grants temporary access to clean version

## Mobile/Tablet Verification
- ✅ Watermark displays correctly on mobile (320px+)
- ✅ Image not cropped or distorted on small viewports
- ✅ No client-side bypass possible
- ✅ Right-click/long-press save still shows watermark

## Critical: No Bypasses
The watermark cannot be bypassed by:
- ❌ Disabling JavaScript (watermark is in pixels)
- ❌ Right-click → Save Image (watermark is embedded)
- ❌ Screenshot (watermark visible)
- ❌ Browser DevTools (clean URL never exposed)
- ❌ Direct storage access (RLS blocks unauthenticated)
- ❌ URL manipulation (signed URLs required for clean)

## Last Updated
2026-06-02 — Verified all protection layers active
