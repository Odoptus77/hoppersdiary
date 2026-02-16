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
  visit_date: string;
  match: string | null;
  rating: number;
  tips: string | null;
};

export default function GroundReviewsPage() {
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
        setError("Ungültiger Link.");
        setLoading(false);
        return;
      }

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
        .select("id,visit_date,match,rating,tips")
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
              <p className="mt-3 text-sm text-black/70">Noch keine Reviews.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <article key={r.id} className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold">
                        {new Date(r.visit_date).toLocaleDateString("de-DE")}
                        {r.match ? ` — ${r.match}` : ""}
                      </div>
                      <div className="text-sm text-black/70">{r.rating} / 5</div>
                    </div>
                    {r.tips ? <p className="mt-2 text-sm text-black/70">💡 {r.tips}</p> : null}
                    <div className="mt-3 flex justify-end">
                      <ReportReviewButton reviewId={r.id} />
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
