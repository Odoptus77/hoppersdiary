"use client";

import Link from "next/link";
import Image from "next/image";
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

type PhotoRow = {
  ground_id: string;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
};

export default function ReviewsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<(Review & { ground: Ground | null })[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
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
        .eq("hidden", false)
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

      // Thumbnails: newest visible photo per ground
      try {
        const ids = Array.from(new Set(rows.map((r) => r.ground_id).filter(Boolean)));
        if (ids.length) {
          const { data: p } = await supabase
            .from("photos")
            .select("ground_id,storage_bucket,storage_path,created_at")
            .in("ground_id", ids)
            .eq("hidden", false)
            .order("created_at", { ascending: false })
            .limit(400);

          const map: Record<string, string> = {};
          for (const row of ((p as PhotoRow[]) ?? []) as PhotoRow[]) {
            if (map[row.ground_id]) continue;
            const { data: u } = supabase.storage
              .from(row.storage_bucket)
              .getPublicUrl(row.storage_path);
            map[row.ground_id] = u.publicUrl;
          }
          setThumbs(map);
        } else {
          setThumbs({});
        }
      } catch {
        setThumbs({});
      }

      setLoading(false);
    }

    load();
  }, [supabase, country, minRating]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Review-Feed</h1>
          <p className="text-sm text-black/65">
            Die neuesten Stadion-Erfahrungen aus der Community (MVP: letzte 50).
          </p>
        </div>
        <div className="text-sm text-black/55">{items.length} Reviews</div>
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
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/grounds"
              className="inline-flex rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Grounds ansehen
            </Link>
            <Link
              href="/suggest"
              className="inline-flex rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Ground vorschlagen
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((r) => {
            const g = r.ground;
            const href = g ? `/grounds/${g.slug}/reviews` : "/grounds";
            const thumb = thumbs[r.ground_id];

            return (
              <Link
                key={r.id}
                href={href}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:bg-black/[0.02]"
              >
                {thumb ? (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={thumb}
                      alt={g?.name ?? "Ground"}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="text-lg font-semibold text-white drop-shadow">
                        {g?.name ?? "(Ground)"}
                      </div>
                      <div className="mt-1 text-sm text-white/85">
                        {[g?.city, g?.country].filter(Boolean).join(" · ")}
                        {r.match ? ` — ${r.match}` : ""}
                      </div>
                    </div>
                    <div className="absolute right-4 top-4 rounded-full bg-blue-900 px-3 py-1 text-sm font-semibold text-white">
                      {r.rating} / 5
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3 p-6">
                  {!thumb ? (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold">{g?.name ?? "(Ground)"}</div>
                        <div className="mt-1 text-sm text-black/70">
                          {[g?.city, g?.country].filter(Boolean).join(" · ")}
                          {r.match ? ` — ${r.match}` : ""}
                        </div>
                      </div>
                      <div className="rounded-full bg-blue-900 px-3 py-1 text-sm font-semibold text-white">
                        {r.rating} / 5
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-black/60">
                    <div>
                      {new Date(r.visit_date).toLocaleDateString("de-DE")}
                      {r.competition ? ` · ${r.competition}` : ""}
                    </div>
                    <div className="text-xs text-black/45">
                      {new Date(r.created_at).toLocaleDateString("de-DE")}
                    </div>
                  </div>

                  {r.tips ? (
                    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/75">
                      <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                        Quick Tipp
                      </div>
                      <div className="mt-1 whitespace-pre-line">{r.tips}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-black/55">
                      Öffnen, um alle Kategorien (Anreise, Tickets, Preise…) zu lesen.
                    </div>
                  )}

                  <div className="text-xs text-black/45">
                    Öffnet: Reviews für diesen Ground
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
