export type ReviewAggInput = {
  rating: number;
  arrival?: string | null;
  ticketing?: string | null;
  payments?: string | null;
  food_drink?: string | null;
  prices?: string | null;
  atmosphere?: string | null;
  safety?: string | null;
  tips?: string | null;
};

function topSnippets(values: (string | null | undefined)[], limit: number) {
  const out: string[] = [];
  for (const v of values) {
    const s = (v ?? "").trim();
    if (!s) continue;
    // take first sentence-ish chunk
    const first = s.split(/\n|\.|!|\?/)[0]?.trim();
    if (first && first.length >= 10) out.push(first);
    if (out.length >= limit) break;
  }
  return out;
}

export function aggregateReviews(reviews: ReviewAggInput[]) {
  const count = reviews.length;
  const avg = count ? reviews.reduce((a, r) => a + (r.rating ?? 0), 0) / count : null;

  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const r of reviews) {
    const v = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    dist[v] += 1;
  }

  return {
    count,
    avg,
    dist,
    tips: topSnippets(reviews.map((r) => r.tips), 6),
    arrival: topSnippets(reviews.map((r) => r.arrival), 5),
    ticketing: topSnippets(reviews.map((r) => r.ticketing), 5),
    prices: topSnippets(reviews.map((r) => r.prices), 5),
  };
}
