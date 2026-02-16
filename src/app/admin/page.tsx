"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
      setSessionUserId(data.session?.user.id ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
      setSessionUserId(session?.user.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const allowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const allowed =
    !!sessionEmail && (allowlist.length === 0 || allowlist.includes(sessionEmail.toLowerCase()));

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus(
        "Supabase ist nicht konfiguriert. Bitte setze NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel und redeploye."
      );
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
      setStatus("Magic Link gesendet. Bitte E-Mail öffnen und bestätigen.");
    } catch (err: any) {
      setStatus(err?.message ?? "Fehler beim Senden des Magic Links.");
    } finally {
      setSending(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-black/60">Admin</p>
        <h1 className="text-3xl font-semibold">Hoppersdiary Admin</h1>
        <p className="max-w-2xl text-black/70">
          Hier testen wir Supabase Auth (Magic Link). Inhalte/Moderation kommen als nächstes.
        </p>
      </header>

      {!supabase ? (
        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6 text-sm text-black/70">
          Supabase ist noch nicht konfiguriert. Setze in Vercel die Env Vars:
          <code> NEXT_PUBLIC_SUPABASE_URL</code> und <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </div>
      ) : !sessionEmail ? (
        <div className="max-w-xl rounded-2xl border border-black/10 bg-black/[0.03] p-6">
          <form onSubmit={sendMagicLink} className="grid gap-3">
            <label className="grid gap-2 text-sm text-black/70">
              E-Mail
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nick-thorben@gmx.de"
                className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
              />
            </label>
            <button
              disabled={sending}
              className="rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {sending ? "Sende…" : "Magic Link senden"}
            </button>
            {status && <p className="text-sm text-black/70">{status}</p>}
          </form>
        </div>
      ) : !allowed ? (
        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">
          <p className="text-sm text-black/70">
            Eingeloggt als <span className="font-semibold">{sessionEmail}</span>, aber nicht erlaubt.
          </p>
          <p className="mt-2 text-xs text-black/60">
            Setze <code>NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST</code> in Vercel.
          </p>
          <button
            onClick={signOut}
            className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
          >
            Abmelden
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-black/70">
              Eingeloggt als <span className="font-semibold">{sessionEmail}</span>
              {sessionUserId ? (
                <>
                  <span className="mx-2 text-black/40">•</span>
                  <span className="text-xs">User ID: <code>{sessionUserId}</code></span>
                </>
              ) : null}
            </div>
            <button
              onClick={signOut}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Abmelden
            </button>
          </div>
          <p className="mt-3 text-sm text-black/70">
            ✅ Supabase ist verbunden und Magic Link funktioniert.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="/admin/grounds"
              className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Grounds
            </a>
            <a
              href="/admin/suggestions"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Vorschläge
            </a>
            <a
              href="/admin/reports"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Review-Meldungen
            </a>
            <a
              href="/admin/photos"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Bild-Meldungen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
