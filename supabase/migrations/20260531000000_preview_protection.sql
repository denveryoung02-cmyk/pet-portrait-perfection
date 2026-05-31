-- Preview protection: keep the clean generated image private, serve a
-- pixel-watermarked preview publicly. Releases the clean image only via a
-- signed URL after verified payment.
--
-- New, additive only — the existing public `caricatures` bucket is left as-is
-- so older generations keep working.

-- Buckets: private clean originals + public watermarked previews.
insert into storage.buckets (id, name, public) values
  ('caricatures-clean','caricatures-clean', false),
  ('caricature-previews','caricature-previews', true)
on conflict (id) do nothing;

-- caricatures-clean: owner-scoped (folder = user id), mirroring pet-uploads.
-- Generation writes use the service role (bypasses RLS); signed URLs (used to
-- deliver the clean image post-payment) also bypass these policies. These are
-- here for defense-in-depth / direct owner access.
create policy "caricatures-clean owner read" on storage.objects for select to authenticated
  using (bucket_id = 'caricatures-clean' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "caricatures-clean owner write" on storage.objects for insert to authenticated
  with check (bucket_id = 'caricatures-clean' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "caricatures-clean owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'caricatures-clean' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "caricatures-clean admin read" on storage.objects for select to authenticated
  using (bucket_id = 'caricatures-clean' and public.has_role(auth.uid(),'admin'));

-- caricature-previews: public read (watermarked, safe to expose).
create policy "caricature-previews public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'caricature-previews');

-- generations: track the watermarked public preview and the private clean path.
alter table public.generations
  add column if not exists preview_url text,
  add column if not exists clean_path text;
