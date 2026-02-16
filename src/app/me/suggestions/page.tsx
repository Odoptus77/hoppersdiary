"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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
  admin_note: string | null;
};

export default function MySuggestionsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Suggestion[]>([]);
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

      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) {
        setError("Bitte einloggen, um deine Vorschläge zu sehen.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ground_suggestions")
        .select(
          "id,created_at,name,club,city,country,league,capacity,address,status,admin_note"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setItems([]);
      } else {
        setItems((data as Suggestion[]) ?? []);
      }

      setLoading(false);
    }

    load();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Mein Konto</p>
        <h1 className="text-3xl font-semibold">Meine Ground-Vorschläge</h1>
        <p className="text-black/70">
          Hier siehst du den Status deiner Vorschläge (pending/approved/rejected).
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/suggest"
          className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
        >
          + Neuen Ground vorschlagen
        </Link>
        <Link
          href="/grounds"
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        >
          Grounds ansehen
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
          Noch keine Vorschläge.
          <div className="mt-3">
            <Link
              href="/suggest"
              className="inline-flex rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
            >
              + Ground vorschlagen
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="rounded-2xl border border-black/10 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{s.name}</div>
                  <div className="mt-1 text-sm text-black/70">
                    {[s.city, s.country].filter(Boolean).join(" · ")}
                    {s.club ? ` — ${s.club}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-black/50">
                    Eingereicht: {new Date(s.created_at).toLocaleString("de-DE")}
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    s.status === "approved"
                      ? "bg-green-700 text-white"
                      : s.status === "rejected"
                        ? "bg-red-700 text-white"
                        : "border border-black/10 bg-white text-black"
                  }`}
                >
                  {s.status}
                </span>
              </div>

              {s.admin_note ? (
                <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/70">
                  <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                    Admin-Notiz
                  </div>
                  <div className="mt-2">{s.admin_note}</div>
                </div>
              ) : null}

              <div className="mt-3 grid gap-2 text-sm text-black/70 md:grid-cols-2">
                <div>Liga: {s.league ?? "—"}</div>
                <div>Kapazität: {s.capacity ? s.capacity.toLocaleString("de-DE") : "—"}</div>
                <div className="md:col-span-2">Adresse: {s.address ?? "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-black/50">
        Hinweis: Login läuft aktuell über <code>/admin</code> (Magic Link). Später trennen wir User-Login und Admin-UI.
      </div>
    </div>
  );
}
