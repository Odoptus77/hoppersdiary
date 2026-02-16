"use client";

import Link from "next/link";
import Image from "next/image";
import { Tabs } from "@/components/Tabs";
import { ReportPhotoButton } from "@/components/ReportPhotoButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Ground = { id: string; name: string; slug: string };

type Photo = {
  id: string;
  created_at: string;
  storage_bucket: string;
  storage_path: string;
  caption: string | null;
};

export default function GroundPhotosPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [ground, setGround] = useState<Ground | null>(null);
  const [photos, setPhotos] = useState<(Photo & { url: string })[]>([]);
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

      const { data: p, error: pe } = await supabase
        .from("photos")
        .select("id,created_at,storage_bucket,storage_path,caption")
        .eq("ground_id", (g as any).id)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(200);

      if (pe) {
        setError(pe.message);
        setPhotos([]);
        setLoading(false);
        return;
      }

      const rows = (p as Photo[]) ?? [];
      const withUrls = rows.map((row) => {
        const { data } = supabase.storage
          .from(row.storage_bucket)
          .getPublicUrl(row.storage_path);
        return { ...row, url: data.publicUrl };
      });

      setPhotos(withUrls);
      setLoading(false);
    }

    load();
  }, [supabase, slug]);

  const tabs = [
    { key: "overview", label: "Übersicht", href: `/grounds/${slug}`, active: false },
    { key: "reviews", label: "Reviews", href: `/grounds/${slug}/reviews`, active: false },
    { key: "tips", label: "Tipps", href: `/grounds/${slug}/tips`, active: false },
    { key: "arrival", label: "Anreise", href: `/grounds/${slug}/arrival`, active: false },
    { key: "tickets", label: "Tickets", href: `/grounds/${slug}/tickets`, active: false },
    { key: "prices", label: "Preise", href: `/grounds/${slug}/prices`, active: false },
    { key: "photos", label: "Bilder", href: `/grounds/${slug}/photos`, active: true },
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
              <span>Bilder</span>
            </div>
            <h1 className="text-3xl font-semibold">Bilder — {ground.name}</h1>
          </header>

          <Tabs items={tabs} />

          {photos.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
              Noch keine Bilder.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {photos.map((ph) => (
                <div
                  key={ph.id}
                  className="group overflow-hidden rounded-2xl border border-black/10 bg-white"
                >
                  <a href={ph.url} target="_blank" rel="noreferrer" className="block">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={ph.url}
                        alt={ph.caption ?? "Ground photo"}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  </a>

                  <div className="flex items-center justify-between gap-2 p-3">
                    <div className="text-xs text-black/70 truncate">
                      {ph.caption ?? ""}
                    </div>
                    <ReportPhotoButton photoId={ph.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-black/50">
            Hinweis: Upload folgt als nächster Schritt im Review-Formular + Moderation.
          </div>
        </>
      )}
    </div>
  );
}
