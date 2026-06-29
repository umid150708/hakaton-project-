/**
 * /api/prices — fetches real current market prices from OLX.uz
 *
 * POST body: { query: string, region?: string }
 * Response:  PriceResult (see type below)
 *
 * OLX.uz has a public, unauthenticated API — confirmed working 2026-06-30.
 * Applies IQR outlier filtering to remove noise (business sales, equipment, etc).
 */

export interface PriceListing {
  title: string;
  price: number;     // UZS
  city: string;
}

export interface PriceResult {
  query: string;
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
  listings: PriceListing[];
  source: 'olx' | 'fallback';
  fetchedAt: string;  // YYYY-MM-DD
}

// ─── OLX fetcher ─────────────────────────────────────────────────────────────

async function fetchFromOLX(query: string): Promise<PriceResult> {
  const url = `https://www.olx.uz/api/v1/offers?query=${encodeURIComponent(query)}&limit=25`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BiznesPlanAI/1.0)',
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) throw new Error(`OLX returned ${res.status}`);

  const data = await res.json();
  const items: Record<string, unknown>[] = data?.data ?? [];

  // Extract and validate prices
  const listings: PriceListing[] = [];

  for (const item of items) {
    const params = (item.params as Record<string, unknown>[]) ?? [];
    const priceParam = params.find((p) => (p as Record<string, unknown>).key === 'price') as Record<string, unknown> | undefined;

    if (!priceParam) continue;

    const priceValue = priceParam.value as Record<string, unknown>;
    const price = Number(priceValue?.value ?? 0);

    // Filter: must be a reasonable price for a product (not a business sale or free)
    if (price < 100 || price > 50_000_000) continue;

    const title = String(item.title ?? '').slice(0, 60);
    const loc = item.location as Record<string, Record<string, string>> | undefined;
    const city = loc?.city?.name ?? '';

    listings.push({ title, price, city });
  }

  if (listings.length === 0) {
    throw new Error('No valid prices found');
  }

  // ── IQR outlier removal ──
  const sorted = [...listings].sort((a, b) => a.price - b.price);
  const prices = sorted.map((l) => l.price);

  let filtered = prices;
  if (prices.length >= 4) {
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    const iqrFiltered = prices.filter((p) => p >= q1 && p <= q3);
    if (iqrFiltered.length >= 2) filtered = iqrFiltered;
  }

  const avg   = Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length);
  const min   = filtered[0];
  const max   = filtered[filtered.length - 1];
  const mid   = Math.floor(filtered.length / 2);
  const median = filtered.length % 2 === 0
    ? Math.round((filtered[mid - 1] + filtered[mid]) / 2)
    : filtered[mid];

  // Return top 5 representative listings (those closest to median)
  const top5 = [...listings]
    .sort((a, b) => Math.abs(a.price - median) - Math.abs(b.price - median))
    .slice(0, 5);

  return {
    query,
    avg,
    min,
    max,
    median,
    count: filtered.length,
    listings: top5,
    source: 'olx',
    fetchedAt: new Date().toISOString().split('T')[0],
  };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let queries: string[];
  try {
    const body = await req.json();
    // Accept either a single query or an array
    queries = Array.isArray(body.queries)
      ? body.queries.slice(0, 5)        // max 5 to avoid hammering OLX
      : [String(body.query ?? '')];
    queries = queries.map((q) => q.trim()).filter(Boolean);
    if (queries.length === 0) throw new Error('No queries');
  } catch {
    return new Response(
      JSON.stringify({ error: 'Provide { query: string } or { queries: string[] }' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Fetch all queries in parallel
  const results = await Promise.allSettled(
    queries.map((q) => fetchFromOLX(q))
  );

  const output: Record<string, PriceResult | { error: string }> = {};

  for (let i = 0; i < queries.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      output[queries[i]] = r.value;
    } else {
      output[queries[i]] = { error: String(r.reason?.message ?? 'Failed') };
    }
  }

  return new Response(JSON.stringify(output), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
