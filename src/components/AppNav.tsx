"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/grounds", label: "Grounds" },
  { href: "/reviews", label: "Reviews" },
  { href: "/suggest", label: "Vorschlagen" },
  { href: "/me", label: "Konto" },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

export function AppNav() {
  const path = usePathname();

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {links.map((l) => {
        const active = isActive(path, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-medium transition ${
              active ? "text-blue-900" : "text-black/65 hover:text-black"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav() {
  const path = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-4 px-2 py-2">
        {links.map((l) => {
          const active = isActive(path, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-2 py-2 text-center text-xs font-medium transition ${
                active ? "bg-blue-900 text-white" : "text-black/70"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
