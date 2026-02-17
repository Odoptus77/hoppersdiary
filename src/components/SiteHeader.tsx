import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Hoppersdiary</span>
          <span className="text-xs font-medium text-black/45">DE</span>
        </Link>

        <AppNav />

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/[0.03]"
          >
            Login
          </Link>
          <Link
            href="/admin"
            className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
