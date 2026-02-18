"use client";

import Link from "next/link";
import Image from "next/image";
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
  ticket_url: string | null;
  away_section: string | null;
  transit_notes: string | null;
  payment_options: string | null;
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
  condition: string | null;
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
  const [heroUrl, setHeroUrl] = useState<string | null>(null);

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
        .select("id,name,club,city,country,league,capacity,address,ticket_url,away_section,transit_notes,payment_options,slug")
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

      // Load newest visible photo for hero image
      try {
        const { data: p } = await supabase
          .from("photos")
          .select("storage_bucket,storage_path")
          .eq("ground_id", (g as any).id)
          .eq("hidden", false)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (p) {
          const { data: u } = supabase.storage
            .from((p as any).storage_bucket)
            .getPublicUrl((p as any).storage_path);
          setHeroUrl(u.publicUrl);
        } else {
          setHeroUrl(null);
        }
      } catch {
        setHeroUrl(null);
      }

      const { data: r, error: re } = await supabase
        .from("reviews")
        .select(
          "id,created_at,visit_date,match,competition,rating,tips,arrival,ticketing,payments,food_drink,prices,condition,atmosphere,safety"
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
          {heroUrl ? (
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/[0.03]">
              <div className="relative aspect-[16/7] w-full">
                <Image
                  src={heroUrl}
                  alt={ground.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="text-xs font-medium uppercase tracking-[0.28em] text-white/80">
                    Neuestes Foto
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-2xl font-semibold tracking-tight text-white drop-shadow md:text-3xl">
                      {ground.name}
                    </div>
                    <Link
                      href={`/grounds/${ground.slug}/photos`}
                      className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white/90"
                    >
                      Alle Bilder
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <header className="space-y-4">
            <div className="text-sm text-black/60">
              <Link className="hover:underline" href="/grounds">
                Grounds
              </Link>
              <span className="mx-2">/</span>
              <span>{ground.name}</span>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">{ground.name}</h1>
                <div className="mt-2 text-black/70">
                  {[ground.city, ground.country].filter(Boolean).join(" · ")}
                  {ground.club ? ` — ${ground.club}` : ""}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/grounds/${ground.slug}/review`}
                  className="rounded-full bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                >
                  + Review
                </Link>
                <Link
                  href={`/grounds/${ground.slug}/photos`}
                  className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-black/[0.03]"
                >
                  Bilder
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                  Bewertung
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {avgRating ? `Ø ${avgRating.toFixed(1)}` : "—"}
                  <span className="text-base font-medium text-black/50"> / 5</span>
                </div>
                <div className="mt-1 text-sm text-black/60">{agg.count} Reviews</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                  Quick Facts
                </div>
                <div className="mt-2 grid gap-x-6 gap-y-2 text-sm text-black/70 md:grid-cols-2">
                  <div>{ground.league ? `Liga: ${ground.league}` : "Liga: —"}</div>
                  <div>
                    {ground.capacity
                      ? `Kapazität: ${ground.capacity.toLocaleString("de-DE")}`
                      : "Kapazität: —"}
                  </div>
                  <div>{ground.away_section ? `Gästebereich: ${ground.away_section}` : "Gästebereich: —"}</div>
                  <div>{ground.payment_options ? `Zahlung: ${ground.payment_options}` : "Zahlung: —"}</div>
                  <div className="md:col-span-2">
                    {ground.ticket_url ? (
                      <span>
                        Tickets: {" "}
                        <a className="underline" href={ground.ticket_url} target="_blank" rel="noreferrer">
                          Link
                        </a>
                      </span>
                    ) : (
                      "Tickets: —"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <Tabs items={tabs} />

          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-black/70">
                    {avgRating ? (
                      <span className="font-semibold">Review-Score</span>
                    ) : (
                      <span className="font-semibold">Noch keine Reviews</span>
                    )}
                    <span className="ml-2 text-black/50">
                      {avgRating ? `Ø ${avgRating.toFixed(1)} / 5` : "—"} ({agg.count})
                    </span>
                  </div>
                  <Link
                    href={`/grounds/${ground.slug}/reviews`}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/[0.03]"
                  >
                    Alle Reviews
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                    Reviews
                  </div>
                  <Link
                    href={`/grounds/${ground.slug}/reviews`}
                    className="text-sm font-semibold underline"
                  >
                    Alle ansehen
                  </Link>
                </div>

                {reviews.length === 0 ? (
                  <p className="mt-3 text-sm text-black/70">Noch keine Reviews. Sei der/die Erste!</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reviews.slice(0, 3).map((r) => (
                      <article
                        key={r.id}
                        className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-white/60 px-4 py-3">
                          <div className="text-sm font-semibold">
                            {new Date(r.visit_date).toLocaleDateString("de-DE")}
                            {r.match ? ` — ${r.match}` : ""}
                          </div>
                          <div className="text-sm text-black/70">{r.rating} / 5</div>
                        </div>
                        <div className="space-y-3 px-4 py-4 text-sm text-black/75">
                          {r.arrival ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Anreise
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.arrival}</div>
                            </div>
                          ) : null}
                          {r.ticketing ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Ticketkauf
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.ticketing}</div>
                            </div>
                          ) : null}
                          {r.payments ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Zahlung
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.payments}</div>
                            </div>
                          ) : null}
                          {r.food_drink ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Bier & Essen
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.food_drink}</div>
                            </div>
                          ) : null}
                          {r.prices ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Preise
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.prices}</div>
                            </div>
                          ) : null}
                          {r.atmosphere ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Atmosphäre
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.atmosphere}</div>
                            </div>
                          ) : null}
                          {r.condition ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Stadionzustand
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.condition}</div>
                            </div>
                          ) : null}
                          {r.safety ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Sicherheit
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.safety}</div>
                            </div>
                          ) : null}
                          {r.tips ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Tipps
                              </div>
                              <div className="mt-1 whitespace-pre-line">{r.tips}</div>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Praktisch
                </div>

                <div className="mt-3 space-y-3 text-sm text-black/70">
                  {ground.address ? (
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                        Adresse
                      </div>
                      <div className="mt-1">{ground.address}</div>
                    </div>
                  ) : null}

                  {ground.transit_notes ? (
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                        Anreise-Notizen
                      </div>
                      <div className="mt-1">{ground.transit_notes}</div>
                      <Link
                        className="mt-2 inline-block text-sm underline"
                        href={`/grounds/${ground.slug}/arrival`}
                      >
                        Mehr zur Anreise
                      </Link>
                    </div>
                  ) : (
                    <div className="text-sm text-black/60">
                      Noch keine Anreise-Notizen. Schreib ein Review und hilf der Community.
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/grounds/${ground.slug}/review`}
                      className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      + Review schreiben
                    </Link>
                    <Link
                      href={`/grounds/${ground.slug}/photos`}
                      className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-black/[0.03]"
                    >
                      Bilder ansehen
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
