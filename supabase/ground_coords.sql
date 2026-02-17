-- Add coordinates + optional Google Maps URL

alter table public.grounds
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists gmaps_url text;

create index if not exists grounds_lat_lng_idx on public.grounds(lat, lng);
