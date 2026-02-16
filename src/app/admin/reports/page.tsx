"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Report = {
  id: string;
  created_at: string;
  reason: string;
  note: string | null;
  status: "open" | "closed";
  review_id: string;
};

type Review = {
  id: string;
  ground_id: string;
  visit_date: string;
  match: string | null;
  rating: number;
  hidden: boolean;
  ground?: { id: string; name: string; slug: string } | null;
};

export default function AdminReportsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<(Report & { review: Review | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("review_reports")
      .select(
        "id,created_at,reason,note,status,review_id, review:reviews(id,ground_id,visit_date,match,rating,hidden, ground:grounds(id,name,slug))"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems(((data as any[]) ?? []) as any);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function closeReport(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from("review_reports")
      .update({ status: "closed" })
      .eq("id", id);
    if (error) setError(error.message);
    await load();
  }

  async function hideReview(reviewId: string) {
    if (!supabase) return;
    const { error } = await supabase.from("reviews").update({ hidden: true }).eq("id", reviewId);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Admin</p>
        <h1 className="text-3xl font-semibold">Meldungen</h1>
        <p className="text-black/70">Offene Meldungen prüfen und Reviews ausblenden.</p>
      </header>

      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Keine Meldungen.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-black/60">
                    {new Date(r.created_at).toLocaleString("de-DE")} · Status: {r.status}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{r.reason}</div>
                  {r.note ? <div className="mt-2 text-sm text-black/70">{r.note}</div> : null}

                  <div className="mt-3 text-sm text-black/70">
                    Review: {r.review ? `${r.review.rating}/5` : "—"}
                    {r.review?.match ? ` · ${r.review.match}` : ""}
                    {r.review?.visit_date ? ` · ${new Date(r.review.visit_date).toLocaleDateString("de-DE")}` : ""}
                  </div>
                  {r.review?.ground ? (
                    <div className="mt-1 text-sm">
                      Ground: <Link className="underline" href={`/grounds/${r.review.ground.slug}`}>{r.review.ground.name}</Link>
                    </div>
                  ) : null}
                  {r.review ? (
                    <div className="mt-1 text-xs text-black/50">
                      Hidden: {String(r.review.hidden)}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {r.review ? (
                    <button
                      onClick={() => hideReview(r.review!.id)}
                      className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Review ausblenden
                    </button>
                  ) : null}
                  <button
                    onClick={() => closeReport(r.id)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-black/50">
        Hinweis: Ausgeblendete Reviews verschwinden komplett (ohne Platzhalter).
      </div>
    </div>
  );
}
