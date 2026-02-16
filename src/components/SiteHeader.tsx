import Link from "next/link";

const nav = [
  { href: "/", label: "Start" },
  { href: "/grounds", label: "Grounds" },
  { href: "/reviews", label: "Reviews" },
  { href: "/suggest", label: "Ground vorschlagen" },
  { href: "/me", label: "Mein Konto" },
  { href: "/login", label: "Login" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Hoppersdiary</span>
          <span className="text-xs font-medium text-black/50">DE</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-black/65 transition hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/[0.03]"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
