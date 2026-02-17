import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-black/10 bg-gradient-to-br from-blue-900 to-slate-900 p-8 text-white md:p-12">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/80">
            Von Hoppern für Hopper
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Plane deinen nächsten Ground.
          </h1>
          <p className="text-lg text-white/85">
            Hoppersdiary sammelt praktische Stadion-Tipps: Anreise, Tickets, Zahlung,
            Preise, Atmosphäre – als Reviews pro Besuch.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/grounds"
              className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-white/90"
            >
              Grounds entdecken
            </Link>
            <Link
              href="/reviews"
              className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
            >
              Reviews lesen
            </Link>
            <Link
              href="/suggest"
              className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
            >
              Ground vorschlagen
            </Link>
          </div>

          <div className="pt-2 text-xs text-white/70">
            MVP: D-A-CH zuerst. Maps sind in Arbeit.
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            1
          </div>
          <div className="mt-2 text-xl font-semibold">Ground auswählen</div>
          <p className="mt-2 text-sm text-black/70">
            Finde Stadien nach Land, Stadt, Liga oder Verein.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            2
          </div>
          <div className="mt-2 text-xl font-semibold">Tipps lesen</div>
          <p className="mt-2 text-sm text-black/70">
            Anreise, Tickets, Zahlung, Preise – direkt aus echten Besuchen.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            3
          </div>
          <div className="mt-2 text-xl font-semibold">Selbst beitragen</div>
          <p className="mt-2 text-sm text-black/70">
            Schreib ein Review pro Spiel/Besuch und lade Fotos hoch.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-black/[0.03] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Neu hier?</div>
            <div className="text-sm text-black/70">Login per Magic Link – keine Registrierung.</div>
          </div>
          <Link
            href="/login"
            className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </section>
    </div>
  );
}
