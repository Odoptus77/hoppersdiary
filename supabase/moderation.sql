-- Moderation (Phase C): reports + hide reviews

alter table public.reviews add column if not exists hidden boolean not null default false;

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  review_id uuid not null references public.reviews(id) on delete cascade,
  reason text not null,
  note text,

  status text not null default 'open' check (status in ('open','closed'))
);

create index if not exists review_reports_status_idx on public.review_reports(status);
create index if not exists review_reports_review_idx on public.review_reports(review_id);

alter table public.review_reports enable row level security;

-- Public can not read reports.
-- Authenticated users can create reports.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='reports_auth_insert'
  ) THEN
    EXECUTE 'create policy "reports_auth_insert" on public.review_reports for insert with check (auth.uid() = created_by)';
  END IF;

  -- Users can read their own reports (optional but useful)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='reports_own_read'
  ) THEN
    EXECUTE 'create policy "reports_own_read" on public.review_reports for select using (auth.uid() = created_by)';
  END IF;

  -- Admin can manage all reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='review_reports' AND policyname='reports_admin_all'
  ) THEN
    EXECUTE 'create policy "reports_admin_all" on public.review_reports for all using (public.is_admin()) with check (public.is_admin())';
  END IF;
END $$;

-- Reviews visibility: hide reviews that are moderated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_public_read_visible_only'
  ) THEN
    EXECUTE 'create policy "reviews_public_read_visible_only" on public.reviews for select using (hidden = false and exists (select 1 from public.grounds g where g.id = reviews.ground_id and g.published = true))';
  END IF;
END $$;

-- NOTE:
-- You should remove/disable the older policy "reviews_public_read_if_ground_published" if it exists,
-- otherwise hidden reviews may still be visible.
