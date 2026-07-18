-- Hero Pack: post-purchase asset generation + hero profile reveal.
-- Additive only — no existing table is altered.
-- asset_type / status use plain-text check constraints (not enums) so adding
-- a fifth asset type later is a constraint edit, not an enum migration.

create table public.adventure_pack_assets (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.orders(id),
  primary_generation_id uuid not null references public.generations(id),
  asset_type            text not null check (asset_type in ('hd_portrait', 'phone_wallpaper', 'character_card', 'hero_certificate')),
  storage_path          text,
  public_url            text,
  status                text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
alter table public.adventure_pack_assets enable row level security;
create index adventure_pack_assets_order_id_idx on public.adventure_pack_assets (order_id);

-- Owner access mirrors order_items (no direct user_id column — scoped via orders.user_id).
create policy "adventure_pack_assets_owner_select" on public.adventure_pack_assets
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "adventure_pack_assets_admin_all" on public.adventure_pack_assets
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create table public.hero_profiles (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null unique references public.orders(id),
  primary_generation_id uuid not null references public.generations(id),
  pack_number           bigserial unique,
  pet_name              text,
  hero_name             text,
  adventure_class       text,
  special_ability       text,
  favourite_snack       text,
  adventure_rank        text,
  mission_statement     text,
  achievement_badge     text,
  origin_story          text,
  first_viewed_at       timestamptz,
  generated_at          timestamptz not null default now()
);
alter table public.hero_profiles enable row level security;
create index hero_profiles_order_id_idx on public.hero_profiles (order_id);

create policy "hero_profiles_owner_select" on public.hero_profiles
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "hero_profiles_admin_all" on public.hero_profiles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
