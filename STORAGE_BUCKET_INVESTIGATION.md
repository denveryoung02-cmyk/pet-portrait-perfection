# Storage Bucket Investigation: "Bucket not found"

**Date**: 2026-06-04  
**Error**: "Could not load source photo: Bucket not found"  
**Location**: `src/lib/generations.functions.ts` line 84-87

---

## Error Location

```typescript
// 3. Download the source pet photo via admin client (bypasses RLS)
const { data: blob, error: dlErr } = await supabaseAdmin.storage
  .from("pet-uploads")  // ← This bucket is not found
  .download(img.storage_path);
if (dlErr || !blob) throw new Error(`Could not load source photo: ${dlErr?.message}`);
```

---

## Bucket Names in Code

### Upload Service (`src/services/uploads.ts`)

**Line 64-66** (client-side upload):
```typescript
const { error: upErr } = await supabase.storage
  .from("pet-uploads")  // ← Upload to this bucket
  .upload(storagePath, file, { ... });
```

**Line 95** (signed URL preview):
```typescript
const { data, error } = await supabase.storage
  .from("pet-uploads")  // ← Get preview from this bucket
  .createSignedUrl(storagePath, expiresInSeconds);
```

### Generation Service (`src/lib/generations.functions.ts`)

**Line 84-86** (server-side download):
```typescript
const { data: blob, error: dlErr } = await supabaseAdmin.storage
  .from("pet-uploads")  // ← Download from this bucket (FAILS)
  .download(img.storage_path);
```

**All use the same bucket name: `"pet-uploads"`**

---

## Root Cause Analysis

### Issue 1: Bucket Doesn't Exist in Supabase

The `"pet-uploads"` bucket hasn't been created in the Supabase project.

**Evidence**:
- Upload works (user uploads photo successfully)
- Database row is created (we get past line 44-52)
- But download fails with "Bucket not found"

**Wait... if upload works, the bucket DOES exist!**

So the issue must be something else...

### Issue 2: supabaseAdmin Client Connection Issue

The `supabaseAdmin` client is created with:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Possible causes**:
1. `SUPABASE_SERVICE_ROLE_KEY` is not set in Cloudflare Workers
2. `SUPABASE_SERVICE_ROLE_KEY` is wrong/invalid
3. `SUPABASE_URL` is wrong (pointing to different project)

---

## Check Cloudflare Secrets

**Current secrets** (from earlier check):
```
✓ SUPABASE_URL
✓ SUPABASE_SERVICE_ROLE_KEY
```

Both exist, but we need to verify their VALUES are correct.

---

## Expected Values (from .dev.vars)

**Line 5**:
```
SUPABASE_URL=https://yzknarcqqhmluckfvfux.supabase.co
```

**Line 7**:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg4MDU0MiwiZXhwIjoyMDk1NDU2NTQyfQ.KBnaTgDmyaZ7Egygyp7VSPUndrig2x4Kulqz3VmnvyQ
```

---

## Diagnosis Steps

### Step 1: Verify Upload Actually Works

The fact that we get past the "Invalid API key" error means:
1. ✅ User uploads photo (client-side with anon key)
2. ✅ Database row is created in `uploaded_images`
3. ❌ Server-side download fails with "Bucket not found"

**This suggests**:
- Client-side Supabase connection works (anon key)
- Server-side admin connection doesn't work (service role key)

### Step 2: Check if Bucket Exists

**In Supabase Dashboard**:
1. Go to: https://supabase.com/dashboard/project/yzknarcqqhmluckfvfux/storage/buckets
2. Look for bucket named: `pet-uploads`

**Expected**:
- ✅ Bucket exists (private)
- ✅ Has files uploaded by users

**If bucket doesn't exist**:
- Create it manually
- Set as private
- Configure RLS policies

### Step 3: Test Service Role Key

The service role key might be:
- Not set in Cloudflare Workers
- Set with wrong value
- Has non-ASCII characters (like the publishable key issue)

**Check in Supabase Dashboard**:
1. Go to: https://supabase.com/dashboard/project/yzknarcqqhmluckfvfux/settings/api
2. Copy the **service_role** key (under "Project API keys")
3. Compare with value in `.dev.vars` line 7

### Step 4: Re-set Service Role Key

If the key is wrong or has encoding issues:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name pawtoons-pet-portrait-perfection
```

**Paste the service_role key from Supabase dashboard** (starts with `eyJ...`, contains `"role":"service_role"`).

**Or use echo to avoid encoding issues**:
```bash
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg4MDU0MiwiZXhwIjoyMDk1NDU2NTQyfQ.KBnaTgDmyaZ7Egygyp7VSPUndrig2x4Kulqz3VmnvyQ" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name pawtoons-pet-portrait-perfection
```

### Step 5: Verify SUPABASE_URL

The URL might be wrong:

```bash
npx wrangler secret put SUPABASE_URL --name pawtoons-pet-portrait-perfection
```

**Paste**:
```
https://yzknarcqqhmluckfvfux.supabase.co
```

**Or**:
```bash
echo "https://yzknarcqqhmluckfvfux.supabase.co" | npx wrangler secret put SUPABASE_URL --name pawtoons-pet-portrait-perfection
```

---

## Most Likely Cause

**Hypothesis**: `SUPABASE_SERVICE_ROLE_KEY` has non-ASCII characters (same issue as publishable key).

**Why**:
1. Upload works (client uses publishable key)
2. Database query works (middleware uses publishable key - we just fixed this)
3. Admin download fails (uses service role key)

**This pattern suggests the service role key has the same encoding issue.**

---

## Recommended Fix

Re-set both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` using the `echo` method to avoid encoding issues:

```bash
# 1. Set URL
echo "https://yzknarcqqhmluckfvfux.supabase.co" | npx wrangler secret put SUPABASE_URL --name pawtoons-pet-portrait-perfection

# 2. Set service role key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a25hcmNxcWhtbHVja2Z2ZnV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg4MDU0MiwiZXhwIjoyMDk1NDU2NTQyfQ.KBnaTgDmyaZ7Egygyp7VSPUndrig2x4Kulqz3VmnvyQ" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name pawtoons-pet-portrait-perfection
```

---

## Alternative: Check Bucket Exists

If the keys are correct but bucket doesn't exist:

**Create bucket in Supabase Dashboard**:
1. Go to: Storage → Create bucket
2. Name: `pet-uploads`
3. Public: **No** (private)
4. Allowed MIME types: `image/jpeg,image/png,image/webp,image/heic,image/heif`
5. Max file size: 12 MB

**Set RLS policies**:
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read from their own folder
CREATE POLICY "Users can read own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pet-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow service role to read all (for generation download)
CREATE POLICY "Service role can read all"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'pet-uploads');
```

---

## Summary

**Error**: "Bucket not found" when downloading from `pet-uploads`

**Most Likely Cause**: `SUPABASE_SERVICE_ROLE_KEY` has non-ASCII characters (same as publishable key issue)

**Fix**: Re-set service role key using `echo` method to avoid encoding issues

**Alternative**: Bucket doesn't exist (but unlikely since upload works)
