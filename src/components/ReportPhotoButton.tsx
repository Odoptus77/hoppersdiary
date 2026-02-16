"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMemo, useState } from "react";

const reasons = [
  "Spam / Werbung",
  "Beleidigend / Hate",
  "Urheberrecht",
  "Sonstiges",
];

export function ReportPhotoButton({ photoId }: { photoId: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit() {
    setError(null);
    setStatus(null);

    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      return;
    }

    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) {
      setError("Bitte einloggen, um zu melden.");
      return;
    }

    setSending(true);
    const { error } = await supabase.from("photo_reports").insert({
      created_by: userId,
      photo_id: photoId,
      reason,
      note: note.trim() ? note.trim() : null,
    });

    if (error) {
      setError(error.message);
      setSending(false);
      return;
    }

    setStatus("Danke! Meldung wurde gesendet.");
    setSending(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-black/60 hover:text-black"
      >
        Melden
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
                  Moderation
                </div>
                <div className="mt-1 text-xl font-semibold">Bild melden</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-black/10 bg-white px-3 py-1 text-sm"
              >
                Schließen
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm text-black/70">
                Grund
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-black/70">
                Kommentar (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2"
                  placeholder="Was genau ist das Problem?"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
                >
                  Abbrechen
                </button>
                <button
                  disabled={sending}
                  onClick={submit}
                  className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {sending ? "Sende…" : "Meldung senden"}
                </button>
              </div>

              {status ? <p className="text-sm text-green-800">{status}</p> : null}
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
