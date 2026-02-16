-- Fix: make photo inserts robust by setting created_by via trigger

-- 1) Trigger function to stamp created_by from JWT
create or replace function public.set_created_by_from_auth_uid()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

-- 2) Trigger on photos
drop trigger if exists photos_set_created_by on public.photos;
create trigger photos_set_created_by
before insert on public.photos
for each row
execute function public.set_created_by_from_auth_uid();

-- 3) Safer insert policy (requires authenticated user)
drop policy if exists "photos_auth_insert" on public.photos;
create policy "photos_auth_insert"
on public.photos
for insert
with check (auth.uid() is not null and (created_by is null or created_by = auth.uid()));
