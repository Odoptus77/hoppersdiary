import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type LatestReview = {
  id: string;
  visit_date: string;
  match: string | null;
  rating: number;
  ground: { slug: string; name: string; city: string | null; country: string } | null;
};

type LatestPhoto = {
  id: string;
  storage_bucket: string;
  storage_path: string;
  created_at: string;
  ground: { slug: string; name: string } | null;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default async function Home() {
  const supabase = createSupabaseServerClient();

  let latestReviews: LatestReview[] = [];
  let latestPhotos: (LatestPhoto & { url: string })[] = [];
  let topGrounds: { id: string; name: string; slug: string; city: string | null; country: string; count: number }[] = [];
  let groundsCount: number | null = null;
  let reviewsCount: number | null = null;

  if (supabase) {
    const [gCount, rCount, rLatest, pLatest, rAll] = await Promise.all([
      supabase.from("grounds").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("hidden", false),
      supabase
        .from("reviews")
        .select(
          "id,visit_date,match,rating, ground:grounds(slug,name,city,country)"
        )
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("photos")
        .select(
          "id,storage_bucket,storage_path,created_at, ground:grounds(slug,name)"
        )
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("reviews")
        .select("ground_id,created_at, ground:grounds(id,slug,name,city,country)")
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    groundsCount = gCount.count ?? null;
    reviewsCount = rCount.count ?? null;

    latestReviews = (rLatest.data as any) ?? [];

    const rows = ((pLatest.data as any[]) ?? []) as LatestPhoto[];
    latestPhotos = rows.map((row) => {
      const { data } = supabase.storage.from(row.storage_bucket).getPublicUrl(row.storage_path);
      return { ...(row as any), url: data.publicUrl };
    });

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const all = ((rAll.data as any[]) ?? []).filter((x) => {
      const ts = new Date(x.created_at).getTime();
      return Number.isFinite(ts) && ts >= weekAgo;
    });

    const byGround = new Map<
      string,
      { id: string; name: string; slug: string; city: string | null; country: string; count: number }
    >();

    for (const row of all) {
      const g = row.ground;
      const gid = row.ground_id as string | undefined;
      if (!gid || !g) continue;

      const curr = byGround.get(gid);
      if (!curr) {
        byGround.set(gid, {
          id: g.id,
          name: g.name,
          slug: g.slug,
          city: g.city ?? null,
          country: g.country,
          count: 1,
        });
      } else {
        curr.count += 1;
      }
    }

    topGrounds = Array.from(byGround.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }

  return (
    <div className="space-y-12">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900 to-slate-900 p-8 text-white md:p-12">
        <div className="pointer-events-none absolute -top-24 right-[-120px] h-[420px] w-[420px] rounded-full bg-muted/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 left-[-140px] h-[520px] w-[520px] rounded-full bg-muted/50 blur-2xl" />
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="text-2xl font-semibold tracking-tight">
                  {groundsCount !== null ? groundsCount.toLocaleString("de-DE") : "—"}
                </div>
                <div className="mt-1 text-sm text-white/75">veröffentlichte Grounds</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="text-2xl font-semibold tracking-tight">
                  {reviewsCount !== null ? reviewsCount.toLocaleString("de-DE") : "—"}
                </div>
                <div className="mt-1 text-sm text-white/75">Reviews</div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <div className="text-xs font-medium uppercase tracking-[0.28em] text-white/70">
                Worum es geht
              </div>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                <li>• Schnell sehen, ob Anreise & Tickets easy sind</li>
                <li>• Preise & Zahlung auf einen Blick</li>
                <li>• Echte Erfahrungswerte – kein Marketingtext</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              So funktioniert's
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Schnell reinfinden.</h2>
          </div>
          <Link href="/grounds" className="text-sm font-semibold text-primary hover:underline">
            Direkt zu den Grounds
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              1
            </div>
            <div className="mt-3 text-xl font-semibold text-foreground">Ground auswählen</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Finde Stadien nach Land, Stadt, Liga oder Verein.
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              2
            </div>
            <div className="mt-3 text-xl font-semibold text-foreground">Praktische Infos lesen</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Anreise, Ticketkauf, Zahlung, Preise – gesammelt aus Reviews.
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              3
            </div>
            <div className="mt-3 text-xl font-semibold text-foreground">Beitrag leisten</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Pro Besuch ein Review + Fotos. Moderation hält's sauber.
            </p>
          </div>
        </div>
      </section>

      {/* GUIDELINES */}
      <section className="rounded-3xl border border-border/50 bg-muted/30 p-8 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Schnell mitmachen
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Ein Review dauert 2–3 Minuten.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Je praktischer, desto besser: Anreise, Ticketkauf, Zahlung, Preise. Fotos helfen enorm.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/grounds"
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Ground auswählen
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-border/50 bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Leitlinien
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Fokus auf Anreise/Tickets/Preise – was hätte dir geholfen?</li>
              <li>• Keine persönlichen Daten / keine Gewaltverherrlichung</li>
              <li>• Fotos: bitte eigene Aufnahmen, keine fremden Wasserzeichen</li>
              <li>• Melden statt streiten: Reports gehen in die Moderation</li>
            </ul>
            <div className="mt-6">
              <Link
                href="/suggest"
                className="inline-flex rounded-full border border-border/50 bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Ground vorschlagen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOP GROUNDS THIS WEEK */}
      <section className="space-y-4 rounded-3xl border border-border/50 bg-card p-8 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Community
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Top Grounds diese Woche</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Welche Stadien wurden zuletzt am meisten reviewed (letzte 7 Tage).
            </p>
          </div>
          <Link href="/grounds" className="text-sm font-semibold text-primary hover:underline">
            Alle Grounds
          </Link>
        </div>

        {topGrounds.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-sm text-muted-foreground">
            Noch nicht genug Daten für diese Woche.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {topGrounds.map((g) => (
              <Link
                key={g.id}
                href={`/grounds/${g.slug}`}
                className="rounded-2xl border border-border/50 bg-muted/30 p-6 transition hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-foreground">{g.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {[g.city, g.country].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                    {g.count}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Reviews in den letzten 7 Tagen</div>
              </Link>
            ))}
          </div>
        )}
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

      {/* LATEST PHOTOS */}
      <section className="space-y-4 rounded-3xl border border-border/50 bg-card p-8 md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Galerie
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Neueste Bilder</h2>
          </div>
          <Link href="/grounds" className="text-sm font-semibold text-primary hover:underline">
            Zu den Grounds
          </Link>
        </div>

        {latestPhotos.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-6 text-sm text-muted-foreground">
            Noch keine Bilder.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {latestPhotos.map((p) => (
              <Link
                key={p.id}
                href={p.ground ? `/grounds/${p.ground.slug}/photos` : "/grounds"}
                className="group overflow-hidden rounded-2xl border border-border/50 bg-muted/30"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={p.url}
                    alt={p.ground?.name ?? "Ground photo"}
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold truncate text-foreground">{p.ground?.name ?? "(Ground)"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("de-DE")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FINAL CTA */}
      <section className="rounded-3xl border border-border/50 bg-card p-8 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Neu hier?</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Login per Magic Link – keine Registrierung, kein Passwort.
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Login
            </Link>
            <Link
              href="/grounds"
              className="rounded-full border border-border/50 bg-muted/30 px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Grounds ansehen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
