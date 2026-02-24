"use client";

import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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

type PhotoRow = {
  ground_id: string;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
};

export default function GroundsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Ground[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
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

      if (country) query = query.eq("country", country);
      if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);

      const { data, error } = await query;
      if (error) {
        setError(error.message);
        setItems([]);
        setThumbs({});
        setLoading(false);
        return;
      }

      const grounds = (data as Ground[]) ?? [];
      setItems(grounds);

      // Load latest photo per ground (for cards)
      try {
        const ids = grounds.map((g) => g.id);
        if (ids.length) {
          const { data: p } = await supabase
            .from("photos")
            .select("ground_id,storage_bucket,storage_path,created_at")
            .in("ground_id", ids)
            .eq("hidden", false)
            .order("created_at", { ascending: false })
            .limit(400);

          const rows = ((p as PhotoRow[]) ?? []).slice();
          const map: Record<string, string> = {};
          for (const row of rows) {
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
  }, [supabase, country, q]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Grounds</h1>
          <p className="text-sm text-muted-foreground">
            Entdecke Stadien in D-A-CH. Filter nach Name und Land – und schau dir echte Tipps aus
            Besuchen an.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">{items.length} Grounds</div>
      </header>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 md:flex-row md:items-center">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground md:mr-2">
              Filter
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suche nach Stadionname…"
              className="w-full rounded-xl border border-border/50 bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl border border-border/50 bg-background px-4 py-2 text-sm text-foreground"
            >
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
            </select>
            <Link
              href="/suggest"
              className="rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              + Vorschlagen
            </Link>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Lade…</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
              Noch keine veröffentlichten Grounds in dieser Auswahl.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((g) => {
                const thumb = thumbs[g.id];
                const meta1 = [g.city, g.country].filter(Boolean).join(" · ");
                const meta2 = g.club ? g.club : null;

                return (
                  <Link
                    key={g.id}
                    href={`/grounds/${g.slug}`}
                    className="group overflow-hidden rounded-3xl border border-border/50 bg-card transition hover:bg-muted"
                  >
                    <div className="relative aspect-[16/10] bg-muted">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={g.name}
                          fill
                          className="object-cover transition group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="text-lg font-semibold text-white drop-shadow">
                          {g.name}
                        </div>
                        <div className="mt-1 text-sm text-white/85">
                          {meta1}
                          {meta2 ? ` — ${meta2}` : ""}
                        </div>
                      </div>

                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        {g.league ? (
                          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                            {g.league}
                          </span>
                        ) : null}
                        {g.capacity ? (
                          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground">
                            {g.capacity.toLocaleString("de-DE")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-5">
                      {!thumb ? (
                        <div className="text-sm text-muted-foreground">
                          Noch kein Bild – füge eins über ein Review hinzu.
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Öffnen</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
