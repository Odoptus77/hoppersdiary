"use client";

import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

interface UserProfile {
  avatarUrl: string | null;
  displayName: string | null;
}

export function AccountButtons() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      
      if (user?.user_metadata?.avatar_url) {
        setProfile({
          avatarUrl: user.user_metadata.avatar_url,
          displayName: user.user_metadata.full_name ?? user.email?.split("@")[0] ?? null,
        });
      } else {
        setProfile(null);
      }

      if (!user) {
        setIsAdmin(false);
        return;
      }

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

  const initials = email?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex items-center gap-2">
      {email ? (
        <div className="flex items-center gap-2">
          <Link
            href="/me"
            className="group flex items-center gap-2 rounded-xl border border-transparent bg-muted/30 px-2 py-1.5 transition hover:border-black/5 hover:bg-white hover:shadow-sm dark:bg-white/[0.02] dark:hover:border-white/10 dark:hover:bg-white/5"
          >
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white dark:ring-white/20">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.displayName ?? email}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
            <span className="hidden max-w-[100px] truncate text-sm font-medium sm:block">
              {profile?.displayName ?? email.split("@")[0]}
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="relative inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-amber-500/20 transition hover:shadow-md hover:shadow-amber-500/30"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
            </Link>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="group inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:shadow-blue-500/30 hover:brightness-110"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login
        </Link>
      )}
    </div>
  );
}
