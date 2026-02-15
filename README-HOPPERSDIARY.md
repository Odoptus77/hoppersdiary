# Hoppersdiary

Community-Plattform für Groundhopper (DE-only MVP).

## Stack (MVP)
- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Auth Magic Link + Postgres + Storage)
- Hosting: Vercel

## Local dev
```bash
cd hoppersdiary
npm run dev
```

## MVP: Decisions
- DE-only
- D-A-CH seed
- Guests can read
- Write requires login
- Grounds: user suggestions → admin approval
- Reviews: per match/visit → aggregated ground summary

## Next steps
- Supabase project + env vars
- DB schema + RLS policies
- Pages: Grounds list + Ground detail + Review form + Suggest ground
