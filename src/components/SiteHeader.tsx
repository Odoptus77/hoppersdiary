import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { AccountButtons } from "@/components/AccountButtons";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Hoppersdiary</span>
          <span className="text-xs font-medium text-black/45">DE</span>
        </Link>

        <AppNav />

        <AccountButtons />
      </div>
    </header>
  );
}
