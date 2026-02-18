"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

export function AccountButtons() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;
    const sb = supabase;

    async function refresh() {
      const { data: sess } = await sb.auth.getSession();
      const user = sess.session?.user;
      if (cancelled) return;

      setEmail(user?.email ?? null);

      if (!user) {
        setIsAdmin(false);
        return;
      }

      // RLS allows only selecting your own admin_users row.
      const { data } = await sb
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;
      setIsAdmin(!!data);
    }

    refresh();

    const { data: sub } = sb.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="hidden items-center gap-2 md:flex">
      {email ? (
        <Link
          href="/me"
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/[0.03]"
        >
          Konto
        </Link>
      ) : (
        <Link
          href="/login"
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/[0.03]"
        >
          Login
        </Link>
      )}

      {isAdmin ? (
        <Link
          href="/admin"
          className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Admin
        </Link>
      ) : null}
    </div>
  );
}
