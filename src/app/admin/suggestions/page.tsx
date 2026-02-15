"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { useEffect, useMemo, useState } from "react";

type Suggestion = {
  id: string;
  created_at: string;
  name: string;
  club: string | null;
  city: string | null;
  country: string;
  league: string | null;
  capacity: number | null;
  address: string | null;
  status: "pending" | "approved" | "rejected";
};

export default function AdminSuggestionsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Suggestion[]>([]);
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
      .from("ground_suggestions")
      .select("id,created_at,name,club,city,country,league,capacity,address,status")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data as Suggestion[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function approve(s: Suggestion) {
    if (!supabase) return;

    const base = slugify(`${s.name}-${s.city ?? s.country}`);
    let slug = base || slugify(s.name);

    // Ensure uniqueness (simple loop)
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.from("grounds").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      slug = `${base}-${i + 2}`;
    }

    const { data: sess } = await supabase.auth.getSession();
    const adminId = sess.session?.user.id;

    const { error: ie } = await supabase.from("grounds").insert({
      created_by: adminId,
      name: s.name,
      club: s.club,
      city: s.city,
      country: s.country,
      league: s.league,
      capacity: s.capacity,
      address: s.address,
      slug,
      published: true,
    });

    if (ie) {
      setError(ie.message);
      return;
    }

    const { error: ue } = await supabase
      .from("ground_suggestions")
      .update({ status: "approved" })
      .eq("id", s.id);

    if (ue) {
      setError(ue.message);
      return;
    }

    await load();
  }

  async function reject(s: Suggestion) {
    if (!supabase) return;
    const note = prompt("Optional: Admin-Notiz für Ablehnung?") || null;
    const { error } = await supabase
      .from("ground_suggestions")
      .update({ status: "rejected", admin_note: note })
      .eq("id", s.id);
    if (error) setError(error.message);
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Admin</p>
        <h1 className="text-3xl font-semibold">Ground-Vorschläge</h1>
        <p className="text-black/70">Prüfen und als veröffentlichten Ground freischalten.</p>
      </header>

      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
              Keine Vorschläge.
            </div>
          ) : (
            items.map((s) => (
              <div key={s.id} className="rounded-2xl border border-black/10 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{s.name}</div>
                    <div className="mt-1 text-sm text-black/70">
                      {[s.city, s.country].filter(Boolean).join(" · ")}
                      {s.club ? ` — ${s.club}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-black/50">
                      Status: {s.status} · {new Date(s.created_at).toLocaleString("de-DE")}
                    </div>
                  </div>

                  {s.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(s)}
                        className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
                      >
                        Freischalten
                      </button>
                      <button
                        onClick={() => reject(s)}
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                      >
                        Ablehnen
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 grid gap-2 text-sm text-black/70 md:grid-cols-2">
                  <div>Liga: {s.league ?? "—"}</div>
                  <div>Kapazität: {s.capacity ? s.capacity.toLocaleString("de-DE") : "—"}</div>
                  <div className="md:col-span-2">Adresse: {s.address ?? "—"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
