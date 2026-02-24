"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { 
    href: "/grounds", 
    label: "Grounds",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  { 
    href: "/reviews", 
    label: "Reviews",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  { 
    href: "/suggest", 
    label: "Vorschlagen",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )
  },
];

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

export function AppNav() {
  const path = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-2xl bg-muted/30 p-1 dark:bg-white/[0.02]">
      {navItems.map((item) => {
        const active = isActive(path, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${active 
                ? "bg-white text-blue-600 shadow-sm dark:bg-muted/50 dark:text-blue-400" 
                : "text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white"
              }
            `}
          >
            <span className={active ? "text-blue-600 dark:text-blue-400" : ""}>{item.icon}</span>
            {item.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-2" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav() {
  const path = usePathname();
  const allItems = [
    { href: "/", label: "Home", icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: "/grounds", label: "Grounds", icon: navItems[0].icon },
    { href: "/reviews", label: "Reviews", icon: navItems[1].icon },
    { href: "/me", label: "Konto", icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 glass border-t border-black/5 dark:border-white/5 md:hidden">
      <nav className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2">
        {allItems.map((item) => {
          const active = isActive(path, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all
                ${active 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-muted-foreground dark:text-white/50"
                }
              `}
            >
              <div className={`
                relative flex items-center justify-center transition-all
                ${active ? "scale-110" : ""}
              `}>
                {item.icon}
                {active && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
