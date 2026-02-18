-- When a review is hidden/unhidden by moderation, its photos should follow.

create or replace function public.photos_follow_review_hidden()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Keep photo visibility in sync with the parent review.
  update public.photos
    set hidden = new.hidden
  where review_id = new.id;

  return new;
end;
$$;

-- Recreate trigger idempotently
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'reviews_photos_follow_hidden'
  ) THEN
    EXECUTE 'drop trigger reviews_photos_follow_hidden on public.reviews';
  END IF;

  EXECUTE 'create trigger reviews_photos_follow_hidden
    after update of hidden on public.reviews
    for each row
    execute function public.photos_follow_review_hidden()';
END $$;

-- Optional one-time backfill (uncomment if needed):
-- update public.photos p
-- set hidden = r.hidden
-- from public.reviews r
-- where p.review_id = r.id;
