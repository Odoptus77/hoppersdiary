"use client";

import { Tabs } from "@/components/Tabs";
import { aggregateReviews } from "@/components/reviews/aggregate";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Ground = { id: string; name: string; slug: string };

type Review = { id: string; rating: number; ticketing: string | null };

export default function GroundTicketsPage() {
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
        .select("id,rating,ticketing")
        .eq("ground_id", (g as any).id)
        .eq("hidden", false)
        .order("created_at", { ascending: false });

      if (re) setError(re.message);
      setReviews((r as Review[]) ?? []);
      setLoading(false);
    }

    load();
  }, [supabase, slug]);

  const tabs = [
    { key: "overview", label: "Übersicht", href: `/grounds/${slug}`, active: false },
    { key: "reviews", label: "Reviews", href: `/grounds/${slug}/reviews`, active: false },
    { key: "tips", label: "Tipps", href: `/grounds/${slug}/tips`, active: false },
    { key: "arrival", label: "Anreise", href: `/grounds/${slug}/arrival`, active: false },
    { key: "tickets", label: "Tickets", href: `/grounds/${slug}/tickets`, active: true },
    { key: "prices", label: "Preise", href: `/grounds/${slug}/prices`, active: false },
    { key: "photos", label: "Bilder", href: `/grounds/${slug}/photos`, active: false },
  ];

  const agg = aggregateReviews(reviews);

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
              <span>Tickets</span>
            </div>
            <h1 className="text-3xl font-semibold">Tickets — {ground.name}</h1>
          </header>

          <Tabs items={tabs} />

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Aus Reviews</div>
            {agg.ticketing.length === 0 ? (
              <p className="mt-3 text-sm text-black/70">Noch keine Ticketing-Infos.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                {agg.ticketing.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
