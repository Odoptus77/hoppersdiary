-- Photo moderation: reports for photos

create table if not exists public.photo_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  photo_id uuid not null references public.photos(id) on delete cascade,
  reason text not null,
  note text,

  status text not null default 'open' check (status in ('open','closed'))
);

create index if not exists photo_reports_status_idx on public.photo_reports(status);
create index if not exists photo_reports_photo_idx on public.photo_reports(photo_id);

alter table public.photo_reports enable row level security;

DO $$
BEGIN
  -- Authenticated users can create reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_reports' AND policyname='photo_reports_auth_insert'
  ) THEN
    EXECUTE 'create policy "photo_reports_auth_insert" on public.photo_reports for insert with check (auth.uid() = created_by)';
  END IF;

  -- Users can read their own reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_reports' AND policyname='photo_reports_own_read'
  ) THEN
    EXECUTE 'create policy "photo_reports_own_read" on public.photo_reports for select using (auth.uid() = created_by)';
  END IF;

  -- Admin can manage all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='photo_reports' AND policyname='photo_reports_admin_all'
  ) THEN
    EXECUTE 'create policy "photo_reports_admin_all" on public.photo_reports for all using (public.is_admin()) with check (public.is_admin())';
  END IF;
END $$;
