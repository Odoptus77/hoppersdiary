-- Extend grounds with useful fields (no coordinates yet)

alter table public.grounds
  add column if not exists ticket_url text,
  add column if not exists away_section text,
  add column if not exists transit_notes text,
  add column if not exists payment_options text;
