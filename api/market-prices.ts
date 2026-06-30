/**
 * api/market-prices.ts — Public read endpoint for the latest market snapshot.
 *
 * Returns the most recent daily snapshot (prices + analysis) for the
 * top-of-site ticker and the chatbot's market-aware advice. Read-only,
 * safe to call from the browser.
 */

import { sbSelect } from './_supabase';
import type { PriceEntry } from './_market-products';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
};

interface Snapshot {
  date: string;
  data: PriceEntry[];
  analysis: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  try {
    const rows = await sbSelect<Snapshot>('market_snapshots', 'order=date.desc&limit=1');
    const snap = rows[0] ?? null;
    return new Response(JSON.stringify(snap ?? { date: null, data: [], analysis: '' }), {
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  } catch (e) {
    console.error('market-prices failed:', String(e));
    return new Response(JSON.stringify({ date: null, data: [], analysis: '', error: String(e) }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...cors },
    });
  }
}
