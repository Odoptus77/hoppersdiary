"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GroundsMap } from "@/components/maps/GroundsMap";
import { useEffect, useMemo, useState } from "react";

type Ground = {
  id: string;
  name: string;
  club: string | null;
  city: string | null;
  country: string;
  league: string | null;
  capacity: number | null;
  slug: string;
  lat: number | null;
  lng: number | null;
};

export default function GroundsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState<string>("DE");
  const [q, setQ] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError("Supabase ist nicht konfiguriert.");
        setLoading(false);
        return;
      }

      let query = supabase
        .from("grounds")
        .select("id,name,club,city,country,league,capacity,slug,lat,lng")
        .order("name", { ascending: true });

      // Only published grounds are visible to guests anyway (RLS).
      if (country) query = query.eq("country", country);
      if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);

      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setItems([]);
      } else {
        setItems((data as Ground[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [supabase, country, q]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Grounds</h1>
          <p className="text-sm text-black/65">
            Entdecke Stadien in D-A-CH. Filter nach Name und Land – und schau dir echte Tipps aus
            Besuchen an.
          </p>
        </div>
        <div className="text-sm text-black/55">{items.length} Grounds</div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_420px]">
        {/* Left: list */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 md:flex-row md:items-center">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45 md:mr-2">
              Filter
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suche nach Stadionname…"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
            </select>
            <Link
              href="/suggest"
              className="rounded-xl bg-blue-900 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              + Vorschlagen
            </Link>
          </div>

          {loading ? (
            <div className="text-sm text-black/70">Lade…</div>
          ) : error ? (
            <div className="text-sm text-red-700">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
              Noch keine veröffentlichten Grounds in dieser Auswahl.
            </div>
          ) : (
            <div className="grid gap-3">
              {items.map((g) => (
                <Link
                  key={g.id}
                  href={`/grounds/${g.slug}`}
                  className="rounded-2xl border border-black/10 bg-white p-5 transition hover:bg-black/[0.02]"
                >
                  <div className="text-lg font-semibold">{g.name}</div>
                  <div className="mt-1 text-sm text-black/70">
                    {[g.city, g.country].filter(Boolean).join(" · ")}
                    {g.club ? ` — ${g.club}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-black/50">
                    {g.league ? `Liga: ${g.league}` : ""}
                    {g.capacity ? ` · Kapazität: ${g.capacity.toLocaleString("de-DE")}` : ""}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right: map */}
        <aside className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            Karte
          </div>
          <GroundsMap
            pins={items
              .filter((g) => typeof g.lat === "number" && typeof g.lng === "number")
              .map((g) => ({
                id: g.id,
                name: g.name,
                slug: g.slug,
                lat: g.lat as number,
                lng: g.lng as number,
              }))}
          />
        </aside>
      </div>
    </div>
  );
}
