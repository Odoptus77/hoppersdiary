"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  created_at: string;
  visit_date: string;
  match: string | null;
  competition: string | null;
  rating: number;
  tips: string | null;
  ground_id: string;
};

type Ground = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  country: string;
};

export default function ReviewsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<(Review & { ground: Ground | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState<string>("");
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError("Supabase ist nicht konfiguriert.");
        setLoading(false);
        return;
      }

      // Join: reviews -> grounds (name/slug), only published grounds visible by RLS.
      let query = supabase
        .from("reviews")
        .select(
          "id,created_at,visit_date,match,competition,rating,tips,ground_id, ground:grounds(id,name,slug,city,country)"
        )
        .order("created_at", { ascending: false })
        .limit(50);

      // Rating filter: client-side (simple MVP). If needed we add RPC for server filtering.
      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      let rows = (data as any[]) ?? [];
      if (country) rows = rows.filter((r) => r.ground?.country === country);
      if (minRating > 0) rows = rows.filter((r) => (r.rating ?? 0) >= minRating);

      setItems(rows);
      setLoading(false);
    }

    load();
  }, [supabase, country, minRating]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Neueste Reviews</h1>
        <p className="text-black/70">
          Feed der aktuellsten Stadion-Erfahrungen. (MVP: 50 letzte Einträge)
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 md:flex-row md:items-center">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        >
          <option value="">Alle Länder</option>
          <option value="DE">Deutschland</option>
          <option value="AT">Österreich</option>
          <option value="CH">Schweiz</option>
        </select>

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        >
          <option value={0}>Alle Bewertungen</option>
          <option value={5}>Nur 5/5</option>
          <option value={4}>4/5 und besser</option>
          <option value={3}>3/5 und besser</option>
          <option value={2}>2/5 und besser</option>
        </select>

        <Link
          href="/suggest"
          className="ml-auto rounded-xl bg-blue-900 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Ground vorschlagen
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Noch keine Reviews vorhanden.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((r) => (
            <article key={r.id} className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-black/60">
                    {new Date(r.visit_date).toLocaleDateString("de-DE")}
                    {r.competition ? ` · ${r.competition}` : ""}
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {r.ground ? (
                      <Link className="hover:underline" href={`/grounds/${r.ground.slug}`}>
                        {r.ground.name}
                      </Link>
                    ) : (
                      "(Ground)"
                    )}
                  </div>
                  <div className="mt-1 text-sm text-black/70">
                    {[r.ground?.city, r.ground?.country].filter(Boolean).join(" · ")}
                    {r.match ? ` — ${r.match}` : ""}
                  </div>
                </div>

                <div className="rounded-full border border-black/10 bg-black/[0.02] px-3 py-1 text-sm">
                  {r.rating} / 5
                </div>
              </div>

              {r.tips ? (
                <p className="mt-3 text-sm text-black/70">💡 {r.tips}</p>
              ) : null}

              <div className="mt-4 text-xs text-black/50">
                Erstellt: {new Date(r.created_at).toLocaleString("de-DE")}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
