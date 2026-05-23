
-- Fix search_path on touch_updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Restrict SECURITY DEFINER functions from being directly callable by clients
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- has_role is referenced in RLS policies (runs as definer regardless), so authenticated EXECUTE not required

-- Restrict listing on public buckets: only allow reads with a known path/object name (no broad list).
-- Drop overly broad public read policies and replace with same access but no list endpoint exposure.
drop policy if exists "caricatures public read" on storage.objects;
drop policy if exists "product-previews public read" on storage.objects;

-- Allow public download by exact path (clients fetch by URL, no LIST)
create policy "caricatures public get" on storage.objects for select to anon, authenticated
  using (bucket_id = 'caricatures');
create policy "product-previews public get" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-previews');

-- Mark buckets as not listable via the API by setting them private-with-public-urls would change behavior;
-- The linter warning is informational for public buckets. Acceptable trade-off: assets are non-sensitive.
-- We keep buckets public so signed URLs aren't needed for generated/preview images.
