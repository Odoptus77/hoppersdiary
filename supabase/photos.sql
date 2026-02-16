-- Photos (public gallery, auth upload, moderation)

-- 1) Table
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  ground_id uuid not null references public.grounds(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete set null,

  storage_bucket text not null default 'review-photos',
  storage_path text not null,

  caption text,
  hidden boolean not null default false
);

create index if not exists photos_ground_idx on public.photos(ground_id);
create index if not exists photos_review_idx on public.photos(review_id);
create index if not exists photos_created_at_idx on public.photos(created_at desc);

alter table public.photos enable row level security;

-- 2) Policies
DO $$
BEGIN
  -- Public can read photos for published grounds (and only visible)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photos' AND policyname='photos_public_read_visible'
  ) THEN
    EXECUTE 'create policy "photos_public_read_visible" on public.photos for select using (
      hidden = false
      and exists (select 1 from public.grounds g where g.id = photos.ground_id and g.published = true)
    )';
  END IF;

  -- Authenticated users can insert their own photos
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photos' AND policyname='photos_auth_insert'
  ) THEN
    EXECUTE 'create policy "photos_auth_insert" on public.photos for insert with check (auth.uid() = created_by)';
  END IF;

  -- Users can update/delete their own photo rows (caption only in UI, but RLS allows row)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photos' AND policyname='photos_own_update'
  ) THEN
    EXECUTE 'create policy "photos_own_update" on public.photos for update using (auth.uid() = created_by) with check (auth.uid() = created_by)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photos' AND policyname='photos_own_delete'
  ) THEN
    EXECUTE 'create policy "photos_own_delete" on public.photos for delete using (auth.uid() = created_by)';
  END IF;

  -- Admin can moderate
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photos' AND policyname='photos_admin_all'
  ) THEN
    EXECUTE 'create policy "photos_admin_all" on public.photos for all using (public.is_admin()) with check (public.is_admin())';
  END IF;
END $$;

-- NOTE:
-- Storage bucket policies are configured in Supabase Storage UI.
-- Create bucket: review-photos (public) and allow authenticated uploads.
