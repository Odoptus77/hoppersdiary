"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs } from "@/components/Tabs";
import { aggregateReviews } from "@/components/reviews/aggregate";

type Ground = {
  id: string;
  name: string;
  club: string | null;
  city: string | null;
  country: string;
  league: string | null;
  capacity: number | null;
  address: string | null;
  slug: string;
};

type Review = {
  id: string;
  created_at: string;
  visit_date: string;
  match: string | null;
  competition: string | null;
  rating: number;
  tips: string | null;
  arrival: string | null;
  ticketing: string | null;
  payments: string | null;
  food_drink: string | null;
  prices: string | null;
  atmosphere: string | null;
  safety: string | null;
};

export default function GroundDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ground, setGround] = useState<Ground | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      if (!supabase) {
        setError("Supabase ist nicht konfiguriert.");
        setLoading(false);
        return;
      }

      if (!slug) {
        setError("Ungültiger Link (slug fehlt)." );
        setLoading(false);
        return;
      }

      const { data: g, error: ge } = await supabase
        .from("grounds")
        .select("id,name,club,city,country,league,capacity,address,slug")
        .eq("slug", slug)
        .maybeSingle();

      if (ge) {
        setError(ge.message);
        setLoading(false);
        return;
      }

      if (!g) {
        setError("Ground nicht gefunden (oder nicht veröffentlicht)." );
        setLoading(false);
        return;
      }

      setGround(g as Ground);

      const { data: r, error: re } = await supabase
        .from("reviews")
        .select(
          "id,created_at,visit_date,match,competition,rating,tips,arrival,ticketing,payments,food_drink,prices,atmosphere,safety"
        )
        .eq("ground_id", (g as any).id)
        .eq("hidden", false)
        .order("visit_date", { ascending: false });

      if (re) setError(re.message);
      setReviews((r as Review[]) ?? []);

      setLoading(false);
    }

    load();
  }, [supabase, slug]);

  const agg = aggregateReviews(reviews);
  const avgRating = agg.avg;

  const tabs = [
    { key: "overview", label: "Übersicht", href: `/grounds/${slug}`, active: true },
    { key: "reviews", label: "Reviews", href: `/grounds/${slug}/reviews`, active: false },
    { key: "tips", label: "Tipps", href: `/grounds/${slug}/tips`, active: false },
    { key: "arrival", label: "Anreise", href: `/grounds/${slug}/arrival`, active: false },
    { key: "tickets", label: "Tickets", href: `/grounds/${slug}/tickets`, active: false },
    { key: "prices", label: "Preise", href: `/grounds/${slug}/prices`, active: false },
    { key: "photos", label: "Bilder", href: `/grounds/${slug}/photos`, active: false },
  ];

  const newest = reviews.length
    ? reviews
        .slice()
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0]
    : null;

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : !ground ? null : (
        <>
          <header className="space-y-2">
            <div className="text-sm text-black/60">
              <Link className="hover:underline" href="/grounds">
                Grounds
              </Link>
              <span className="mx-2">/</span>
              <span>{ground.name}</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">{ground.name}</h1>
            <div className="text-black/70">
              {[ground.city, ground.country].filter(Boolean).join(" · ")}
              {ground.club ? ` — ${ground.club}` : ""}
            </div>
          </header>

          <Tabs items={tabs} />

          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-black/70">
                    {avgRating ? (
                      <span className="font-semibold">Ø {avgRating.toFixed(1)} / 5</span>
                    ) : (
                      <span className="font-semibold">Noch keine Reviews</span>
                    )}
                    <span className="ml-2 text-black/50">({agg.count})</span>
                  </div>
                  <Link
                    href={`/grounds/${ground.slug}/review`}
                    className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    + Review schreiben
                  </Link>
                </div>

                {/* Distribution */}
                <div className="mt-4 space-y-2">
                  {[5, 4, 3, 2, 1].map((v) => {
                    const count = agg.dist[v as 1 | 2 | 3 | 4 | 5] ?? 0;
                    const pct = agg.count ? Math.round((count / agg.count) * 100) : 0;
                    return (
                      <div key={v} className="grid grid-cols-[32px_1fr_44px] items-center gap-3 text-sm">
                        <div className="text-black/70">{v}</div>
                        <div className="h-2 rounded-full bg-black/[0.06]">
                          <div className="h-2 rounded-full bg-blue-900" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-right text-black/60">{count}</div>
                      </div>
                    );
                  })}
                </div>

                {newest ? (
                  <div className="mt-4 text-xs text-black/50">
                    Letztes Update: {new Date(newest.created_at).toLocaleString("de-DE")}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Highlights (aus Reviews)
                </div>
                {agg.tips.length === 0 && agg.arrival.length === 0 && agg.ticketing.length === 0 ? (
                  <p className="mt-3 text-sm text-black/70">Noch keine Highlights vorhanden.</p>
                ) : (
                  <div className="mt-3 space-y-4">
                    {agg.tips.length ? (
                      <div>
                        <div className="text-sm font-semibold">Tipps</div>
                        <ul className="mt-2 space-y-1 text-sm text-black/70">
                          {agg.tips.slice(0, 3).map((t, i) => (
                            <li key={i}>• {t}</li>
                          ))}
                        </ul>
                        <Link className="mt-2 inline-block text-sm underline" href={`/grounds/${ground.slug}/tips`}>
                          Mehr Tipps
                        </Link>
                      </div>
                    ) : null}

                    {agg.arrival.length ? (
                      <div>
                        <div className="text-sm font-semibold">Anreise</div>
                        <ul className="mt-2 space-y-1 text-sm text-black/70">
                          {agg.arrival.slice(0, 2).map((t, i) => (
                            <li key={i}>• {t}</li>
                          ))}
                        </ul>
                        <Link className="mt-2 inline-block text-sm underline" href={`/grounds/${ground.slug}/arrival`}>
                          Anreise ansehen
                        </Link>
                      </div>
                    ) : null}

                    {agg.ticketing.length ? (
                      <div>
                        <div className="text-sm font-semibold">Tickets</div>
                        <ul className="mt-2 space-y-1 text-sm text-black/70">
                          {agg.ticketing.slice(0, 2).map((t, i) => (
                            <li key={i}>• {t}</li>
                          ))}
                        </ul>
                        <Link className="mt-2 inline-block text-sm underline" href={`/grounds/${ground.slug}/tickets`}>
                          Tickets ansehen
                        </Link>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Quick Facts
                </div>
                <div className="mt-3 space-y-2 text-sm text-black/70">
                  {ground.league ? <div>Liga: {ground.league}</div> : <div>Liga: —</div>}
                  {ground.capacity ? (
                    <div>Kapazität: {ground.capacity.toLocaleString("de-DE")}</div>
                  ) : (
                    <div>Kapazität: —</div>
                  )}
                  {ground.address ? <div>Adresse: {ground.address}</div> : <div>Adresse: —</div>}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Karte (Phase 2)
                </div>
                <div className="mt-2 text-sm text-black/70">Map-Slot vorbereitet.</div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
