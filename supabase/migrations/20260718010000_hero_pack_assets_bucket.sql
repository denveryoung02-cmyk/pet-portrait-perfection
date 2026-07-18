-- Storage bucket for derived Hero Pack assets (phone wallpaper, character
-- card, hero certificate PNGs). Public read, same as caricature-previews /
-- product-previews — writes happen server-side via the service role, which
-- bypasses these policies regardless.

insert into storage.buckets (id, name, public) values
  ('hero-pack-assets','hero-pack-assets', true)
on conflict (id) do nothing;

create policy "hero-pack-assets public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'hero-pack-assets');
