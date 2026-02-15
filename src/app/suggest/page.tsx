"use client";

import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useMemo, useState } from "react";

export default function SuggestGroundPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("DE");
  const [league, setLeague] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [address, setAddress] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setError(null);

    if (!supabase) {
      setError("Supabase ist nicht konfiguriert.");
      return;
    }

    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;
    if (!userId) {
      setError("Bitte einloggen (Magic Link), um einen Ground vorzuschlagen.");
      return;
    }

    const cap = capacity.trim() ? Number(capacity) : null;

    const { error } = await supabase.from("ground_suggestions").insert({
      created_by: userId,
      name,
      club: club || null,
      city: city || null,
      country,
      league: league || null,
      capacity: cap,
      address: address || null,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setStatus("Danke! Vorschlag wurde eingereicht und wird vom Admin geprüft.");
    setName("");
    setClub("");
    setCity("");
    setCountry("DE");
    setLeague("");
    setCapacity("");
    setAddress("");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Ground vorschlagen</h1>
        <p className="text-black/70">
          Du kannst neue Stadien vorschlagen. Ein Admin prüft und schaltet sie frei.
        </p>
        <p className="text-sm text-black/70">
          Noch nicht eingeloggt? <Link className="underline" href="/login">Zum Login</Link>
        </p>
      </header>

      <div className="max-w-2xl rounded-2xl border border-black/10 bg-white p-6">
        <form onSubmit={submit} className="grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Stadionname *"
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="Verein"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
            />
            <input
              value={league}
              onChange={(e) => setLeague(e.target.value)}
              placeholder="Liga"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Stadt"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
            >
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
            </select>
            <input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Kapazität"
              inputMode="numeric"
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
            />
          </div>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Adresse (optional)"
            className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
          />

          <button className="mt-2 rounded-xl bg-blue-900 px-5 py-3 text-sm font-semibold text-white hover:brightness-110">
            Vorschlag senden
          </button>

          {status && <p className="text-sm text-green-800">{status}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      </div>
    </div>
  );
}
