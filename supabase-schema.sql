-- Dexi Room pilot schema for Supabase.
-- Run this in Supabase Dashboard > SQL Editor before using live persistence.
-- NOTE: These policies are intentionally open for the first trusted pilot.
-- Before selling publicly, replace them with authenticated admin/user policies.

create table if not exists public.stores (
  id text primary key,
  name text not null,
  group_name text not null default 'Grupsuz',
  whatsapp_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  store_id text not null references public.stores(id) on delete cascade,
  name text not null,
  width numeric not null,
  depth numeric not null,
  icon text not null default 'U',
  price numeric not null default 0,
  category text not null default 'Mobilya',
  swatch text not null default 'amber',
  shape jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id text primary key,
  store_id text not null references public.stores(id) on delete cascade,
  name text not null,
  code text not null,
  connected boolean not null default true,
  last_seen text not null default 'Henuz baglanmadi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  store_id text not null references public.stores(id) on delete cascade,
  customer_name text,
  customer_phone text,
  room_width numeric,
  room_depth numeric,
  room_height numeric,
  items jsonb not null default '[]'::jsonb,
  total_price numeric not null default 0,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.devices enable row level security;
alter table public.quote_requests enable row level security;

drop policy if exists "pilot read stores" on public.stores;
drop policy if exists "pilot write stores" on public.stores;
drop policy if exists "pilot read products" on public.products;
drop policy if exists "pilot write products" on public.products;
drop policy if exists "pilot read devices" on public.devices;
drop policy if exists "pilot write devices" on public.devices;
drop policy if exists "pilot read quotes" on public.quote_requests;
drop policy if exists "pilot write quotes" on public.quote_requests;

create policy "pilot read stores" on public.stores for select using (true);
create policy "pilot write stores" on public.stores for all using (true) with check (true);

create policy "pilot read products" on public.products for select using (true);
create policy "pilot write products" on public.products for all using (true) with check (true);

create policy "pilot read devices" on public.devices for select using (true);
create policy "pilot write devices" on public.devices for all using (true) with check (true);

create policy "pilot read quotes" on public.quote_requests for select using (true);
create policy "pilot write quotes" on public.quote_requests for all using (true) with check (true);

insert into public.stores (id, name, group_name)
values
  ('store-velvet', 'Velvet', 'Velvet Demo Grubu')
on conflict (id) do update set
  name = excluded.name,
  group_name = excluded.group_name,
  updated_at = now();

insert into public.products
  (id, store_id, name, width, depth, icon, price, category, swatch, shape)
values
  (
    'velvet-kose-demo',
    'store-velvet',
    'Velvet Kose Takimi',
    2.75,
    1.85,
    'K',
    0,
    'Kose Takimi',
    'amber',
    '[{"x":0,"y":0,"width":2.75,"depth":0.9,"label":"Oturma"},{"x":0,"y":0.9,"width":1.05,"depth":0.95,"label":"Uzanma"}]'::jsonb
  ),
  (
    'velvet-berjer-demo',
    'store-velvet',
    'Velvet Berjer',
    0.82,
    0.88,
    'B',
    0,
    'Berjer',
    'green',
    '[]'::jsonb
  ),
  (
    'velvet-tv-demo',
    'store-velvet',
    'Velvet TV Unitesi',
    1.9,
    0.45,
    'T',
    0,
    'TV Unitesi',
    'stone',
    '[]'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  width = excluded.width,
  depth = excluded.depth,
  icon = excluded.icon,
  price = excluded.price,
  category = excluded.category,
  swatch = excluded.swatch,
  shape = excluded.shape,
  updated_at = now();

insert into public.devices (id, store_id, name, code, connected, last_seen)
values ('velvet-device-demo', 'store-velvet', 'Velvet Satis Tableti', 'DR-0001', true, 'Pilot cihaz')
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  connected = excluded.connected,
  last_seen = excluded.last_seen,
  updated_at = now();
