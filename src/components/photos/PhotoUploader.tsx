"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMemo, useState } from "react";

export function PhotoUploader({ groundId, reviewId }: { groundId: string; reviewId?: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStatus(null);
    setError(null);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      return;
    }

    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) {
      setError("Bitte einloggen, um Bilder hochzuladen.");
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${groundId}/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

        const { error: upErr } = await supabase.storage
          .from("review-photos")
          .upload(path, file, { upsert: false, contentType: file.type });

        if (upErr) throw upErr;

        const { error: insErr } = await supabase.from("photos").insert({
          // created_by is set server-side via trigger (auth.uid())
          ground_id: groundId,
          review_id: reviewId ?? null,
          storage_bucket: "review-photos",
          storage_path: path,
          hidden: false,
        });

        if (insErr) throw insErr;
      }

      setStatus("Upload erfolgreich!");
      (e.target as any).value = "";
    } catch (err: any) {
      setError(err?.message ?? "Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-black/70">
        Bilder hochladen
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={onChange}
        className="block w-full text-sm"
      />
      {uploading ? <div className="text-sm text-black/70">Lade hoch…</div> : null}
      {status ? <div className="text-sm text-green-800">{status}</div> : null}
      {error ? <div className="text-sm text-red-700">{error}</div> : null}
      <div className="text-xs text-black/50">
        Hinweis: Upload erfordert Login. Bilder sind öffentlich sichtbar und können gemeldet werden.
      </div>
    </div>
  );
}
