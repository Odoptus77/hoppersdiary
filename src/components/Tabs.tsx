"use client";

import Link from "next/link";

export type TabItem = {
  key: string;
  label: string;
  href: string;
  active: boolean;
};

export function Tabs({ items }: { items: TabItem[] }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <div className="inline-flex min-w-full gap-2 border-b border-border/50 pb-2">
        {items.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              t.active
                ? "bg-blue-900 text-white"
                : "border border-border/50 bg-white text-foreground hover:bg-muted/40"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
