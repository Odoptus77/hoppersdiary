"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

export default function MePage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">Mein Konto</p>
        <h1 className="text-3xl font-semibold">Übersicht</h1>
        <p className="text-black/70">Deine Reviews, Vorschläge und Login-Status.</p>
      </header>

      {!supabase ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
          Supabase ist nicht konfiguriert.
        </div>
      ) : !email ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-sm text-black/70">Du bist nicht eingeloggt.</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/login"
              className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Login
            </Link>
            <Link
              href="/grounds"
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
            >
              Grounds ansehen
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="text-sm text-black/70">
              Eingeloggt als <span className="font-semibold">{email}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/me/reviews"
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Meine Reviews
              </Link>
              <Link
                href="/me/suggestions"
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
              >
                Meine Vorschläge
              </Link>
              <button
                onClick={logout}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href="/suggest"
              className="rounded-2xl border border-black/10 bg-white p-6 transition hover:bg-black/[0.02]"
            >
              <div className="text-lg font-semibold">Ground vorschlagen</div>
              <div className="mt-1 text-sm text-black/70">Neuen Ground einreichen (Admin prüft).</div>
            </Link>
            <Link
              href="/reviews"
              className="rounded-2xl border border-black/10 bg-white p-6 transition hover:bg-black/[0.02]"
            >
              <div className="text-lg font-semibold">Review-Feed</div>
              <div className="mt-1 text-sm text-black/70">Neueste Reviews der Community.</div>
            </Link>
          </div>

          <div className="text-xs text-black/50">
            Admin-Tools sind nur für Admins sichtbar.
          </div>
        </>
      )}
    </div>
  );
}
