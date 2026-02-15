-- Hoppersdiary (MVP) schema + RLS (idempotent)
-- Apply in Supabase SQL Editor.

-- Extensions
create extension if not exists pgcrypto;

-- Admins
create table if not exists public.admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select exists (select 1 from public.admin_users au where au.user_id = auth.uid());
$$;

-- Grounds (published-only visible to guests)
create table if not exists public.grounds (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  name text not null,
  club text,
  city text,
  country text not null,
  league text,
  capacity int,
  address text,

  slug text not null unique,
  published boolean not null default false
);

-- User suggestions (admin approves -> creates a published ground)
create table if not exists public.ground_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  name text not null,
  club text,
  city text,
  country text not null,
  league text,
  capacity int,
  address text,

  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text
);

-- Reviews: one per match/visit; aggregated later
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  ground_id uuid not null references public.grounds(id) on delete cascade,

  visit_date date not null,
  match text,
  competition text,

  arrival text,
  ticketing text,
  payments text,
  food_drink text,
  prices text,
  condition text,
  atmosphere text,
  safety text,
  tips text,

  rating int not null check (rating between 1 and 5)
);

-- Indexes
create index if not exists grounds_country_idx on public.grounds(country);
create index if not exists grounds_city_idx on public.grounds(city);
create index if not exists reviews_ground_idx on public.reviews(ground_id);
create index if not exists reviews_created_at_idx on public.reviews(created_at desc);

-- RLS enable
alter table public.admin_users enable row level security;
alter table public.grounds enable row level security;
alter table public.ground_suggestions enable row level security;
alter table public.reviews enable row level security;

-- Policies (Postgres has no CREATE POLICY IF NOT EXISTS, so we guard manually)
DO $$
BEGIN
  -- admin_users (avoid recursion: policies on admin_users must NOT call is_admin())
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_self_select'
  ) THEN
    EXECUTE 'create policy "admin_users_self_select" on public.admin_users for select using (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='admin_users' AND policyname='admin_users_self_insert'
  ) THEN
    EXECUTE 'create policy "admin_users_self_insert" on public.admin_users for insert with check (auth.uid() = user_id)';
  END IF;

  -- grounds: public read published
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grounds' AND policyname='grounds_public_read_published'
  ) THEN
    EXECUTE 'create policy "grounds_public_read_published" on public.grounds for select using (published = true)';
  END IF;

  -- grounds: admin all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='grounds' AND policyname='grounds_admin_all'
  ) THEN
    EXECUTE 'create policy "grounds_admin_all" on public.grounds for all using (public.is_admin()) with check (public.is_admin())';
  END IF;

  -- suggestions: auth insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ground_suggestions' AND policyname='suggestions_auth_insert'
  ) THEN
    EXECUTE 'create policy "suggestions_auth_insert" on public.ground_suggestions for insert with check (auth.uid() = created_by)';
  END IF;

  -- suggestions: own read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ground_suggestions' AND policyname='suggestions_own_read'
  ) THEN
    EXECUTE 'create policy "suggestions_own_read" on public.ground_suggestions for select using (auth.uid() = created_by)';
  END IF;

  -- suggestions: admin all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ground_suggestions' AND policyname='suggestions_admin_all'
  ) THEN
    EXECUTE 'create policy "suggestions_admin_all" on public.ground_suggestions for all using (public.is_admin()) with check (public.is_admin())';
  END IF;

  -- reviews: public read if ground published
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_public_read_if_ground_published'
  ) THEN
    EXECUTE 'create policy "reviews_public_read_if_ground_published" on public.reviews for select using (exists (select 1 from public.grounds g where g.id = reviews.ground_id and g.published = true))';
  END IF;

  -- reviews: auth insert (published grounds only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_auth_insert'
  ) THEN
    EXECUTE 'create policy "reviews_auth_insert" on public.reviews for insert with check (auth.uid() = created_by and exists (select 1 from public.grounds g where g.id = reviews.ground_id and g.published = true))';
  END IF;

  -- reviews: own update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_own_update'
  ) THEN
    EXECUTE 'create policy "reviews_own_update" on public.reviews for update using (auth.uid() = created_by) with check (auth.uid() = created_by)';
  END IF;

  -- reviews: own delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_own_delete'
  ) THEN
    EXECUTE 'create policy "reviews_own_delete" on public.reviews for delete using (auth.uid() = created_by)';
  END IF;

  -- reviews: admin all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_admin_all'
  ) THEN
    EXECUTE 'create policy "reviews_admin_all" on public.reviews for all using (public.is_admin()) with check (public.is_admin())';
  END IF;
END $$;

-- Next step:
-- 1) Log into /admin once and copy your User ID.
-- 2) Run:
--    insert into public.admin_users(user_id) values ('<YOUR_USER_ID>');
