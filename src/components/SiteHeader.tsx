import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { AccountButtons } from "@/components/AccountButtons";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-black/5 dark:border-white/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transition group-hover:shadow-xl group-hover:shadow-blue-500/30">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <div className="hidden items-baseline gap-1.5 sm:flex">
            <span className="text-lg font-bold tracking-tight">Hoppers</span>
            <span className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-400">diary</span>
          </div>
        </Link>

        {/* Center - Navigation */}
        <div className="hidden md:block">
          <AppNav />
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="h-6 w-px bg-black/10 dark:bg-white/10" />
          <AccountButtons />
        </div>
      </div>
    </header>
  );
}
