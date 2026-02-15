"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      setStatus("Supabase ist nicht konfiguriert.");
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="text-black/70">Einloggen per Magic Link (E‑Mail).</p>
      </header>

      {!supabase ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Supabase ist nicht konfiguriert.
        </div>
      ) : sessionEmail ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-sm text-black/70">
            Eingeloggt als <span className="font-semibold">{sessionEmail}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/grounds"
              className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Zu den Grounds
            </Link>
            <Link
              href="/me/reviews"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Meine Reviews
            </Link>
            <button
              onClick={signOut}
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Abmelden
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl rounded-2xl border border-black/10 bg-white p-6">
          <form onSubmit={sendMagicLink} className="grid gap-3">
            <label className="grid gap-2 text-sm text-black/70">
              E-Mail
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
            <p className="text-xs text-black/60">
              Hinweis: Falls du nach dem Klick nicht zurückgeleitet wirst, prüfe in Supabase die Redirect-URLs.
            </p>
          </form>
        </div>
      )}

      <div className="text-xs text-black/50">
        Admin-Login/Tools bleiben unter <Link className="underline" href="/admin">/admin</Link>.
      </div>
    </div>
  );
}
