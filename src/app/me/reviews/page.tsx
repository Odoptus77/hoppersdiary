"use client";

import Link from "next/link";
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

export default function MyReviewsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<(Review & { ground: Ground | null })[]>([]);
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

    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) {
      setError("Bitte einloggen, um deine Reviews zu sehen.");
      setLoading(false);
      return;
    }

    // Note: RLS allows users to select reviews only if ground is published.
    // For MVP that's ok; later we can add an admin bypass or store slug snapshot.
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id,created_at,visit_date,match,competition,rating,tips,ground_id, ground:grounds(id,name,slug,city,country)"
      )
      .eq("created_by", userId)
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

  async function remove(id: string) {
    if (!supabase) return;
    if (!confirm("Review wirklich löschen?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Mein Konto</p>
        <h1 className="text-3xl font-semibold">Meine Reviews</h1>
        <p className="text-black/70">Übersicht deiner Stadionbesuche inkl. Bearbeiten/Löschen.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/grounds"
          className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Grounds ansehen
        </Link>
        <Link
          href="/reviews"
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        >
          Review-Feed
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-red-700">
          {error}
          {error.toLowerCase().includes("einloggen") ? (
            <div className="mt-3">
              <Link className="underline" href="/admin">
                Zum Login
              </Link>
            </div>
          ) : null}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Noch keine Reviews.
          <div className="mt-3">
            <Link
              href="/grounds"
              className="inline-flex rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Ersten Ground auswählen
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-black/60">
                    {new Date(r.visit_date).toLocaleDateString("de-DE")}
                    {r.competition ? ` · ${r.competition}` : ""}
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    {r.ground ? (
                      <Link className="hover:underline" href={`/grounds/${r.ground.slug}`}>
                        {r.ground.name}
                      </Link>
                    ) : (
                      "(Ground)"
                    )}
                  </div>
                  <div className="mt-1 text-sm text-black/70">
                    {[r.ground?.city, r.ground?.country].filter(Boolean).join(" · ")}
                    {r.match ? ` — ${r.match}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-full border border-black/10 bg-black/[0.02] px-3 py-1 text-sm">
                    {r.rating} / 5
                  </div>
                  {r.ground ? (
                    <Link
                      href={`/grounds/${r.ground.slug}/review?edit=${r.id}`}
                      className="rounded-xl border border-black/10 bg-white px-3 py-1 text-sm"
                    >
                      Bearbeiten
                    </Link>
                  ) : null}
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-xl border border-black/10 bg-white px-3 py-1 text-sm"
                  >
                    Löschen
                  </button>
                </div>
              </div>

              {r.tips ? (
                <p className="mt-3 text-sm text-black/70">💡 {r.tips}</p>
              ) : null}

              <div className="mt-4 text-xs text-black/50">
                Erstellt: {new Date(r.created_at).toLocaleString("de-DE")}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-black/50">
        Hinweis: Bearbeiten öffnet aktuell das Review-Formular (Edit-Modus kommt als nächstes).
      </div>
    </div>
  );
}
