import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-black/10 bg-black/[0.03] p-8 md:p-12">
        <div className="max-w-2xl space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            Community-Plattform für Groundhopper
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Hoppersdiary
          </h1>
          <p className="text-lg text-black/70">
            Praktische Reisetipps, Bewertungen und Erfahrungsberichte für Stadionbesuche.
            Fokus im MVP: Deutschland / Österreich / Schweiz.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/grounds"
              className="rounded-full bg-blue-900 px-6 py-3 text-center text-sm font-semibold text-white hover:brightness-110"
            >
              Grounds entdecken
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-center text-sm font-semibold text-black hover:bg-black/[0.03]"
            >
              Admin / Login testen
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            Grounds
          </div>
          <div className="mt-2 text-xl font-semibold">Stadion-Datenbank</div>
          <p className="mt-2 text-sm text-black/70">
            Filtern nach Land, Liga, Stadt, Verein und Kapazität.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            Reviews
          </div>
          <div className="mt-2 text-xl font-semibold">Tipps pro Besuch</div>
          <p className="mt-2 text-sm text-black/70">
            Pro Spiel/Besuch ein Review — daraus entsteht eine Gesamt-Zusammenfassung pro Ground.
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-[0.28em] text-black/55">
            Karten
          </div>
          <div className="mt-2 text-xl font-semibold">Phase 2</div>
          <p className="mt-2 text-sm text-black/70">
            Layout ist vorbereitet, Kartenansicht kommt nach dem MVP.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/70">
        Nächster Schritt: Datenmodell (Supabase) + Grounds-Liste + Ground-Detailseite + Review-Formular
        + „Ground vorschlagen“.
      </section>
    </div>
  );
}
