import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LatestReview = {
  id: string;
  visit_date: string;
  match: string | null;
  rating: number;
  ground: { slug: string; name: string; city: string | null; country: string } | null;
};

export default async function Home() {
  const supabase = createSupabaseServerClient();

  let latestReviews: LatestReview[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("reviews")
      .select(
        "id,visit_date,match,rating, ground:grounds(slug,name,city,country)"
      )
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(6);

    latestReviews = (data as any) ?? [];
  }

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900 to-slate-900 p-8 text-white md:p-12">
        <div className="pointer-events-none absolute -top-24 right-[-120px] h-[420px] w-[420px] rounded-full bg-muted/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 left-[-140px] h-[520px] w-[520px] rounded-full bg-muted/50 blur-2xl" />
        <div className="grid gap-10 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-full bg-muted/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/85">
                Community • D-A-CH zuerst
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Plane deinen nächsten Ground – mit echten Tipps.
            </h1>
            <p className="text-lg text-white/85">
              Reviews pro Besuch, Fotos & praktische Infos: Anreise, Tickets, Zahlung, Preise,
              Atmosphäre.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/grounds"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-card"
              >
                Grounds entdecken
              </Link>
              <Link
                href="/reviews"
                className="rounded-full border border-white/25 bg-muted/50 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
              >
                Reviews lesen
              </Link>
              <Link
                href="/suggest"
                className="rounded-full border border-white/25 bg-muted/50 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/15"
              >
                Ground vorschlagen
              </Link>
            </div>

            <div className="text-xs text-white/70">
              Gäste können lesen. Mit Login kannst du Reviews schreiben & Bilder hochladen.
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85">
                Anreise
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85">
                Tickets
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85">
                Zahlung
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85">
                Preise
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/85">
                Fotos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST REVIEWS */}
      <section className="space-y-4 rounded-3xl border border-border/50 bg-muted/20 p-8 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Aktivität
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Neueste Reviews</h2>
          </div>
          <Link href="/reviews" className="text-sm font-semibold text-primary hover:underline">
            Alle Reviews
          </Link>
        </div>

        {latestReviews.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            Noch keine Reviews.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {latestReviews.map((r) => (
              <Link
                key={r.id}
                href={r.ground ? `/grounds/${r.ground.slug}/reviews` : "/grounds"}
                className="rounded-2xl border border-border/50 bg-card p-6 transition hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(r.visit_date).toLocaleDateString("de-DE")}
                      {r.match ? ` · ${r.match}` : ""}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {r.ground?.name ?? "(Ground)"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {[r.ground?.city, r.ground?.country].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                    {r.rating} / 5
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
