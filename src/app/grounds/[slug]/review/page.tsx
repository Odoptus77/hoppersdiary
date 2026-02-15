"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type Ground = { id: string; name: string; slug: string };

export default function CreateReviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const search = useSearchParams();
  const editId = search.get("edit");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ground, setGround] = useState<Ground | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [visitDate, setVisitDate] = useState<string>("");
  const [match, setMatch] = useState<string>("");
  const [competition, setCompetition] = useState<string>("");
  const [arrival, setArrival] = useState<string>("");
  const [ticketing, setTicketing] = useState<string>("");
  const [payments, setPayments] = useState<string>("");
  const [foodDrink, setFoodDrink] = useState<string>("");
  const [prices, setPrices] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [atmosphere, setAtmosphere] = useState<string>("");
  const [safety, setSafety] = useState<string>("");
  const [tips, setTips] = useState<string>("");
  const [rating, setRating] = useState<number>(5);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      if (!slug) return;
      const { data: g, error } = await supabase
        .from("grounds")
        .select("id,name,slug")
        .eq("slug", slug)
        .maybeSingle();
      if (error) setError(error.message);
      setGround((g as any) ?? null);
    }
    load();
  }, [supabase, slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);

    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      return;
    }

    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) {
      setError("Bitte einloggen, um ein Review zu schreiben.");
      return;
    }

    if (!ground) {
      setError("Ground nicht gefunden.");
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      created_by: userId,
      ground_id: ground.id,
      visit_date: visitDate,
      match: match || null,
      competition: competition || null,
      arrival: arrival || null,
      ticketing: ticketing || null,
      payments: payments || null,
      food_drink: foodDrink || null,
      prices: prices || null,
      condition: condition || null,
      atmosphere: atmosphere || null,
      safety: safety || null,
      tips: tips || null,
      rating,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setStatus("Review gespeichert!");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-sm text-black/60">
          <Link className="hover:underline" href={`/grounds/${slug}`}>
            Zurück zum Ground
          </Link>
        </div>
        <h1 className="text-3xl font-semibold">Review schreiben</h1>
        <p className="text-black/70">
          Pro Besuch/Spiel ein Review. Bitte so praktisch wie möglich.
        </p>
      </header>

      <form onSubmit={submit} className="max-w-3xl space-y-4">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-black/70">
              Besuchsdatum *
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="rounded-xl border border-black/10 bg-white px-4 py-2"
              />
            </label>
            <label className="grid gap-2 text-sm text-black/70">
              Bewertung (1–5)
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="rounded-xl border border-black/10 bg-white px-4 py-2"
              >
                {[5, 4, 3, 2, 1].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={match}
              onChange={(e) => setMatch(e.target.value)}
              placeholder="Spiel (z.B. Hertha vs. HSV)"
              className="rounded-xl border border-black/10 bg-white px-4 py-2"
            />
            <input
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              placeholder="Liga/Wettbewerb"
              className="rounded-xl border border-black/10 bg-white px-4 py-2"
            />
          </div>

          <textarea value={arrival} onChange={(e)=>setArrival(e.target.value)} placeholder="Anreise" rows={3} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={ticketing} onChange={(e)=>setTicketing(e.target.value)} placeholder="Ticketkauf" rows={3} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={payments} onChange={(e)=>setPayments(e.target.value)} placeholder="Zahlungsmöglichkeiten" rows={2} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={foodDrink} onChange={(e)=>setFoodDrink(e.target.value)} placeholder="Bier & Essen" rows={3} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={prices} onChange={(e)=>setPrices(e.target.value)} placeholder="Preise" rows={2} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={condition} onChange={(e)=>setCondition(e.target.value)} placeholder="Stadionzustand" rows={2} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={atmosphere} onChange={(e)=>setAtmosphere(e.target.value)} placeholder="Atmosphäre" rows={2} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={safety} onChange={(e)=>setSafety(e.target.value)} placeholder="Sicherheit" rows={2} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />
          <textarea value={tips} onChange={(e)=>setTips(e.target.value)} placeholder="Tipps für zukünftige Besucher" rows={3} className="mt-3 w-full rounded-xl border border-black/10 bg-white px-4 py-2" />

          <button className="mt-4 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:brightness-110">
            Speichern
          </button>

          {status && <p className="mt-3 text-sm text-green-800">{status}</p>}
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        </div>
      </form>
    </div>
  );
}
