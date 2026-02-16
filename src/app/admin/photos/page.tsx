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
  photo_id: string;
};

type Photo = {
  id: string;
  ground_id: string;
  storage_bucket: string;
  storage_path: string;
  hidden: boolean;
  ground?: { id: string; name: string; slug: string } | null;
};

export default function AdminPhotosPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<(Report & { photo: (Photo & { url: string }) | null })[]>(
    []
  );
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
      .from("photo_reports")
      .select(
        "id,created_at,reason,note,status,photo_id, photo:photos(id,ground_id,storage_bucket,storage_path,hidden, ground:grounds(id,name,slug))"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setError(error.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const rows = ((data as any[]) ?? []) as any[];
    const withUrls = rows.map((r) => {
      const ph = r.photo;
      if (!ph) return { ...r, photo: null };
      const { data } = supabase.storage.from(ph.storage_bucket).getPublicUrl(ph.storage_path);
      return { ...r, photo: { ...ph, url: data.publicUrl } };
    });

    setItems(withUrls as any);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function closeReport(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("photo_reports").update({ status: "closed" }).eq("id", id);
    if (error) setError(error.message);
    await load();
  }

  async function hidePhoto(photoId: string) {
    if (!supabase) return;
    const { error } = await supabase.from("photos").update({ hidden: true }).eq("id", photoId);
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
        <h1 className="text-3xl font-semibold">Bild-Meldungen</h1>
        <p className="text-black/70">Offene Meldungen prüfen und Bilder ausblenden.</p>
      </header>

      {loading ? (
        <div className="text-sm text-black/70">Lade…</div>
      ) : error ? (
        <div className="text-sm text-red-700">{error}</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Keine Bild-Meldungen.
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

                  {r.photo?.ground ? (
                    <div className="mt-3 text-sm">
                      Ground: <Link className="underline" href={`/grounds/${r.photo.ground.slug}`}>{r.photo.ground.name}</Link>
                    </div>
                  ) : null}
                  {r.photo ? (
                    <div className="mt-1 text-xs text-black/50">Hidden: {String(r.photo.hidden)}</div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {r.photo ? (
                    <button
                      onClick={() => hidePhoto(r.photo!.id)}
                      className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Bild ausblenden
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

              {r.photo ? (
                <div className="mt-4">
                  <a href={r.photo.url} target="_blank" rel="noreferrer" className="underline text-sm">
                    Bild öffnen
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-black/50">
        Hinweis: Ausgeblendete Bilder verschwinden komplett (ohne Platzhalter).
      </div>
    </div>
  );
}
