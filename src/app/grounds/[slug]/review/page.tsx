"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Ground = { id: string; name: string; slug: string };

type ReviewRow = {
  id: string;
  visit_date: string;
  match: string | null;
  competition: string | null;
  arrival: string | null;
  ticketing: string | null;
  payments: string | null;
  food_drink: string | null;
  prices: string | null;
  condition: string | null;
  atmosphere: string | null;
  safety: string | null;
  tips: string | null;
  rating: number;
};

export default function CreateReviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const search = useSearchParams();
  const router = useRouter();
  const editId = search.get("edit");

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [ground, setGround] = useState<Ground | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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
    async function loadGround() {
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
    loadGround();
  }, [supabase, slug]);

  useEffect(() => {
    async function loadEdit() {
      if (!supabase) return;
      if (!editId) return;
      if (!ground) return; // wait until we know which ground we're on

      setLoadingEdit(true);
      setError(null);

      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) {
        setError("Bitte einloggen, um ein Review zu bearbeiten.");
        setLoadingEdit(false);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id,visit_date,match,competition,arrival,ticketing,payments,food_drink,prices,condition,atmosphere,safety,tips,rating,ground_id"
        )
        .eq("id", editId)
        .eq("created_by", userId)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setLoadingEdit(false);
        return;
      }

      if (!data) {
        setError("Review nicht gefunden (oder keine Berechtigung)." );
        setLoadingEdit(false);
        return;
      }

      const row = data as ReviewRow & { ground_id: string };

      if (row.ground_id !== ground.id) {
        setError("Dieses Review gehört zu einem anderen Ground.");
        setLoadingEdit(false);
        return;
      }

      setVisitDate(row.visit_date);
      setMatch(row.match ?? "");
      setCompetition(row.competition ?? "");
      setArrival(row.arrival ?? "");
      setTicketing(row.ticketing ?? "");
      setPayments(row.payments ?? "");
      setFoodDrink(row.food_drink ?? "");
      setPrices(row.prices ?? "");
      setCondition(row.condition ?? "");
      setAtmosphere(row.atmosphere ?? "");
      setSafety(row.safety ?? "");
      setTips(row.tips ?? "");
      setRating(row.rating ?? 5);

      setLoadingEdit(false);
    }

    loadEdit();
  }, [supabase, editId, ground]);

  async function uploadSelectedPhotos(reviewId: string) {
    if (!supabase) return;
    if (!ground) return;
    if (files.length === 0) return;

    setUploadingPhotos(true);

    try {
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `${ground.id}/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

        const { error: upErr } = await supabase.storage
          .from("review-photos")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;

        const { error: insErr } = await supabase.from("photos").insert({
          ground_id: ground.id,
          review_id: reviewId,
          storage_bucket: "review-photos",
          storage_path: path,
          hidden: false,
        });
        if (insErr) throw insErr;
      }

      setFiles([]);
    } finally {
      setUploadingPhotos(false);
    }
  }

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
      setError("Bitte einloggen, um ein Review zu speichern.");
      return;
    }

    if (!ground) {
      setError("Ground nicht gefunden.");
      return;
    }

    const payload = {
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
    };

    if (editId) {
      const { error } = await supabase
        .from("reviews")
        .update(payload)
        .eq("id", editId)
        .eq("created_by", userId);

      if (error) {
        setError(error.message);
        return;
      }

      // If user selected photos while editing, upload them now.
      try {
        await uploadSelectedPhotos(editId);
      } catch (err: any) {
        setError(err?.message ?? "Foto-Upload fehlgeschlagen.");
        return;
      }

      setStatus("Review aktualisiert!");
      return;
    }

    const { data: inserted, error } = await supabase
      .from("reviews")
      .insert({
        created_by: userId,
        ground_id: ground.id,
        ...payload,
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    const newId = (inserted as any)?.id as string | undefined;

    if (newId) {
      // Upload photos selected in the same form.
      try {
        await uploadSelectedPhotos(newId);
      } catch (err: any) {
        setError(err?.message ?? "Foto-Upload fehlgeschlagen.");
        return;
      }

      setStatus("Review gespeichert!");

      // Switch into edit mode so user can add more photos later.
      router.replace(`/grounds/${ground.slug}/review?edit=${newId}`);
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
        <h1 className="text-3xl font-semibold">
          {editId ? "Review bearbeiten" : "Review schreiben"}
        </h1>
        <p className="text-black/70">
          Pro Besuch/Spiel ein Review. Bitte so praktisch wie möglich.
        </p>
        {editId ? (
          <p className="text-sm text-black/70">
            Du bearbeitest ein bestehendes Review.
          </p>
        ) : null}
      </header>

      {loadingEdit ? (
        <div className="text-sm text-black/70">Lade Review…</div>
      ) : null}

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

          <div className="mt-6 border-t border-black/10 pt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black/70">Bilder (optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingPhotos}
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="block w-full text-sm"
              />
              <div className="text-xs text-black/50">
                Du kannst Bilder direkt mit dem Review hochladen. Upload erfolgt beim Speichern.
              </div>
              {files.length ? (
                <div className="text-xs text-black/60">Ausgewählt: {files.length} Datei(en)</div>
              ) : null}
              {uploadingPhotos ? (
                <div className="text-sm text-black/70">Bilder werden hochgeladen…</div>
              ) : null}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
