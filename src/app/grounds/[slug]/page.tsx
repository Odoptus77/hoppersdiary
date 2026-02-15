"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

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
        .order("visit_date", { ascending: false });

      if (re) setError(re.message);
      setReviews((r as Review[]) ?? []);

      setLoading(false);
    }

    load();
  }, [supabase, slug]);

  const avgRating = reviews.length
    ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
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

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm">
                {avgRating ? `Ø ${avgRating.toFixed(1)} / 5 (${reviews.length})` : "Noch keine Reviews"}
              </span>
              {ground.league ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm">
                  Liga: {ground.league}
                </span>
              ) : null}
              {ground.capacity ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm">
                  Kapazität: {ground.capacity.toLocaleString("de-DE")}
                </span>
              ) : null}
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              <div className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">Reviews</h2>
                  <Link
                    href={`/grounds/${ground.slug}/review`}
                    className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    + Review schreiben
                  </Link>
                </div>

                {reviews.length === 0 ? (
                  <p className="mt-3 text-sm text-black/70">
                    Noch keine Reviews. Sei der/die Erste!
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {reviews.map((r) => (
                      <article
                        key={r.id}
                        className="rounded-xl border border-black/10 bg-black/[0.02] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold">
                            {new Date(r.visit_date).toLocaleDateString("de-DE")}
                            {r.match ? ` — ${r.match}` : ""}
                          </div>
                          <div className="text-sm text-black/70">{r.rating} / 5</div>
                        </div>
                        {r.tips ? (
                          <p className="mt-2 text-sm text-black/70">💡 {r.tips}</p>
                        ) : null}
                      </article>
                    ))}
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
                  {ground.address ? <div>Adresse: {ground.address}</div> : <div>Adresse: —</div>}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Karte (Phase 2)
                </div>
                <div className="mt-2 text-sm text-black/70">
                  Map-Slot vorbereitet.
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
