
-- Roles enum
create type public.app_role as enum ('admin', 'user');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create policy "user_roles_select_own" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "user_roles_admin_all" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Uploaded pet photos
create table public.uploaded_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pet_name text,
  storage_path text not null,
  public_url text,
  created_at timestamptz not null default now()
);
alter table public.uploaded_images enable row level security;
create policy "uploaded_images_owner_all" on public.uploaded_images for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "uploaded_images_admin_select" on public.uploaded_images for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- Generations
create type public.generation_status as enum ('pending','processing','completed','failed','rejected');

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  uploaded_image_id uuid references public.uploaded_images(id) on delete set null,
  theme text not null,
  prompt text,
  status generation_status not null default 'pending',
  result_url text,
  storage_path text,
  error text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.generations enable row level security;
create policy "generations_owner_select" on public.generations for select to authenticated using (user_id = auth.uid());
create policy "generations_owner_insert" on public.generations for insert to authenticated with check (user_id = auth.uid());
create policy "generations_admin_all" on public.generations for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Products (catalog, public read)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "products_public_read" on public.products for select to anon, authenticated using (active = true);
create policy "products_admin_write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Themes / styles (admin-managed)
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  prompt_template text,
  preview_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.themes enable row level security;
create policy "themes_public_read" on public.themes for select to anon, authenticated using (active = true);
create policy "themes_admin_write" on public.themes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Orders
create type public.order_status as enum ('pending','paid','in_production','shipped','delivered','cancelled','refunded');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status order_status not null default 'pending',
  subtotal_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'usd',
  shipping_address jsonb,
  tracking_number text,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "orders_owner_select" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "orders_owner_insert" on public.orders for insert to authenticated with check (user_id = auth.uid());
create policy "orders_admin_all" on public.orders for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  generation_id uuid references public.generations(id),
  quantity integer not null default 1,
  unit_price_cents integer not null,
  options jsonb,
  created_at timestamptz not null default now()
);
alter table public.order_items enable row level security;
create policy "order_items_owner_select" on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_owner_insert" on public.order_items for insert to authenticated with check (exists(select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order_items_admin_all" on public.order_items for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Favorites
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references public.generations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, generation_id)
);
alter table public.favorites enable row level security;
create policy "favorites_owner_all" on public.favorites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- updated_at triggers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger trg_generations_touch before update on public.generations for each row execute function public.touch_updated_at();
create trigger trg_orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- Storage buckets
insert into storage.buckets (id, name, public) values ('pet-uploads','pet-uploads', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('caricatures','caricatures', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('product-previews','product-previews', true) on conflict (id) do nothing;

-- Storage policies: pet-uploads (private, owner-scoped via folder = user id)
create policy "pet-uploads owner read" on storage.objects for select to authenticated using (bucket_id = 'pet-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "pet-uploads owner write" on storage.objects for insert to authenticated with check (bucket_id = 'pet-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "pet-uploads owner delete" on storage.objects for delete to authenticated using (bucket_id = 'pet-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "pet-uploads admin read" on storage.objects for select to authenticated using (bucket_id = 'pet-uploads' and public.has_role(auth.uid(),'admin'));

-- Caricatures (public read, admin/system writes)
create policy "caricatures public read" on storage.objects for select to anon, authenticated using (bucket_id = 'caricatures');
create policy "caricatures admin write" on storage.objects for insert to authenticated with check (bucket_id = 'caricatures' and public.has_role(auth.uid(),'admin'));

-- Product previews (public read, admin write)
create policy "product-previews public read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-previews');
create policy "product-previews admin write" on storage.objects for insert to authenticated with check (bucket_id = 'product-previews' and public.has_role(auth.uid(),'admin'));
