"use client";

import Link from "next/link";
import { Tabs } from "@/components/Tabs";
import { ReportReviewButton } from "@/components/ReportReviewButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Ground = {
  id: string;
  name: string;
  slug: string;
};

type Review = {
  id: string;
  created_at?: string;
  created_by?: string;
  visit_date: string;
  match: string | null;
  competition?: string | null;
  rating: number;
  arrival: string | null;
  ticketing: string | null;
  payments: string | null;
  food_drink: string | null;
  prices: string | null;
  condition: string | null;
  atmosphere: string | null;
  safety: string | null;
  tips: string | null;
};

export default function GroundReviewsPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ground, setGround] = useState<Ground | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
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
        setError("Ungültiger Link.");
        setLoading(false);
        return;
      }

      const { data: sess } = await supabase.auth.getSession();
      setMyUserId(sess.session?.user?.id ?? null);

      const { data: g, error: ge } = await supabase
        .from("grounds")
        .select("id,name,slug")
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
          "id,created_at,visit_date,match,competition,rating,arrival,ticketing,payments,food_drink,prices,condition,atmosphere,safety,tips,created_by"
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

  const tabs = [
    { key: "overview", label: "Übersicht", href: `/grounds/${slug}`, active: false },
    { key: "reviews", label: "Reviews", href: `/grounds/${slug}/reviews`, active: true },
    { key: "tips", label: "Tipps", href: `/grounds/${slug}/tips`, active: false },
    { key: "arrival", label: "Anreise", href: `/grounds/${slug}/arrival`, active: false },
    { key: "tickets", label: "Tickets", href: `/grounds/${slug}/tickets`, active: false },
    { key: "prices", label: "Preise", href: `/grounds/${slug}/prices`, active: false },
    { key: "photos", label: "Bilder", href: `/grounds/${slug}/photos`, active: false },
  ];

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
              <Link className="hover:underline" href="/grounds">Grounds</Link>
              <span className="mx-2">/</span>
              <Link className="hover:underline" href={`/grounds/${ground.slug}`}>{ground.name}</Link>
              <span className="mx-2">/</span>
              <span>Reviews</span>
            </div>
            <h1 className="text-3xl font-semibold">Reviews für {ground.name}</h1>
          </header>

          <Tabs items={tabs} />

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-black/70">{reviews.length} Reviews</div>
              <Link
                href={`/grounds/${ground.slug}/review`}
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
              >
                + Review schreiben
              </Link>
            </div>

            {reviews.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
                Noch keine Reviews. Sei der/die Erste!
                <div className="mt-3">
                  <Link
                    href={`/grounds/${ground.slug}/review`}
                    className="inline-flex rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    + Review schreiben
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <article key={r.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-black/[0.02] px-5 py-4">
                      <div className="flex items-center gap-2">
                        {myUserId && r.created_by === myUserId ? (
                          <span className="rounded-full border border-blue-900/20 bg-blue-900/10 px-2 py-0.5 text-xs font-semibold text-blue-900">
                            Dein Review
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">
                          {new Date(r.visit_date).toLocaleDateString("de-DE")}
                          {r.match ? ` — ${r.match}` : ""}
                        </div>
                        {r.competition ? (
                          <div className="mt-1 text-xs text-black/55">{r.competition}</div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {myUserId && r.created_by === myUserId ? (
                          <Link
                            href={`/grounds/${ground.slug}/review?edit=${r.id}`}
                            className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm font-semibold text-black hover:bg-black/[0.03]"
                          >
                            Bearbeiten
                          </Link>
                        ) : null}
                        <div className="rounded-full bg-blue-900 px-3 py-1 text-sm font-semibold text-white">
                          {r.rating} / 5
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 px-5 py-5">
                      {r.arrival ? (
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                            Anreise
                          </div>
                          <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.arrival}</div>
                        </div>
                      ) : null}

                      {r.ticketing || r.payments ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {r.ticketing ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Ticketkauf
                              </div>
                              <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.ticketing}</div>
                            </div>
                          ) : null}
                          {r.payments ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Zahlung
                              </div>
                              <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.payments}</div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {r.food_drink || r.prices ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {r.food_drink ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Bier & Essen
                              </div>
                              <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.food_drink}</div>
                            </div>
                          ) : null}
                          {r.prices ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Preise
                              </div>
                              <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.prices}</div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {r.condition || r.atmosphere ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {r.condition ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Stadionzustand
                              </div>
                              <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.condition}</div>
                            </div>
                          ) : null}
                          {r.atmosphere ? (
                            <div>
                              <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                                Atmosphäre
                              </div>
                              <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.atmosphere}</div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {r.safety ? (
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                            Sicherheit
                          </div>
                          <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.safety}</div>
                        </div>
                      ) : null}

                      {r.tips ? (
                        <div>
                          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/45">
                            Tipps
                          </div>
                          <div className="mt-1 text-sm text-black/75 whitespace-pre-line">{r.tips}</div>
                        </div>
                      ) : null}

                      <div className="flex justify-end pt-2">
                        <ReportReviewButton reviewId={r.id} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
