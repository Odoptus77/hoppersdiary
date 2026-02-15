"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

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
  published: boolean;
  created_at: string;
};

export default function AdminGroundsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<Ground | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("grounds")
      .select(
        "id,name,club,city,country,league,capacity,address,slug,published,created_at"
      )
      .order("name", { ascending: true })
      .limit(500);

    if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);

    const { data, error } = await query;
    if (error) {
      setError(error.message);
      setItems([]);
    } else {
      setItems((data as Ground[]) ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function togglePublished(g: Ground) {
    if (!supabase) return;

    const next = !g.published;
    const { error } = await supabase
      .from("grounds")
      .update({ published: next })
      .eq("id", g.id);

    if (error) {
      setError(error.message);
      return;
    }

    setItems((prev) => prev.map((x) => (x.id === g.id ? { ...x, published: next } : x)));
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !editing) return;

    setSaving(true);
    setError(null);

    const payload = {
      name: editing.name,
      club: editing.club,
      city: editing.city,
      country: editing.country,
      league: editing.league,
      capacity: editing.capacity,
      address: editing.address,
      published: editing.published,
    };

    const { error } = await supabase.from("grounds").update(payload).eq("id", editing.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setEditing(null);
    setSaving(false);
    await load();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Admin</p>
        <h1 className="text-3xl font-semibold">Grounds bearbeiten</h1>
        <p className="text-black/70">
          Daten pflegen (Kapazität, Adresse, Liga etc.) und publish/unpublish.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 md:flex-row md:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Suche…"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        />
        <button
          onClick={load}
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
        >
          Aktualisieren
        </button>
        <Link
          href="/admin/suggestions"
          className="ml-auto rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Vorschläge
        </Link>
      </div>

      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : (
        <div className="grid gap-3">
          {items.map((g) => (
            <div key={g.id} className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{g.name}</div>
                  <div className="mt-1 text-sm text-black/70">
                    {[g.city, g.country].filter(Boolean).join(" · ")}
                    {g.club ? ` — ${g.club}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-black/50">Slug: {g.slug}</div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => togglePublished(g)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      g.published
                        ? "bg-green-700 text-white"
                        : "border border-black/10 bg-white text-black"
                    }`}
                  >
                    {g.published ? "Published" : "Unpublished"}
                  </button>
                  <button
                    onClick={() => setEditing(g)}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                  >
                    Bearbeiten
                  </button>
                  <Link
                    href={`/grounds/${g.slug}`}
                    className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Edit
                </div>
                <div className="mt-1 text-2xl font-semibold">{editing.name}</div>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="rounded-xl border border-black/10 bg-white px-3 py-1 text-sm"
              >
                Schließen
              </button>
            </div>

            <form onSubmit={saveEdit} className="mt-4 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                  placeholder="Name"
                  required
                />
                <input
                  value={editing.club ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, club: e.target.value || null })
                  }
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                  placeholder="Club"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <input
                  value={editing.city ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, city: e.target.value || null })
                  }
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                  placeholder="Stadt"
                />
                <select
                  value={editing.country}
                  onChange={(e) => setEditing({ ...editing, country: e.target.value })}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                >
                  <option value="DE">DE</option>
                  <option value="AT">AT</option>
                  <option value="CH">CH</option>
                </select>
                <input
                  value={editing.league ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, league: e.target.value || null })
                  }
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                  placeholder="Liga"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={editing.capacity ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      capacity: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  inputMode="numeric"
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                  placeholder="Kapazität"
                />
                <label className="flex items-center gap-2 text-sm text-black/70">
                  <input
                    type="checkbox"
                    checked={editing.published}
                    onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  />
                  Published
                </label>
              </div>

              <input
                value={editing.address ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, address: e.target.value || null })
                }
                className="rounded-xl border border-black/10 bg-white px-4 py-2"
                placeholder="Adresse"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                >
                  Abbrechen
                </button>
                <button
                  disabled={saving}
                  className="rounded-xl bg-blue-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Speichere…" : "Speichern"}
                </button>
              </div>

              {error && <p className="text-sm text-red-700">{error}</p>}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
