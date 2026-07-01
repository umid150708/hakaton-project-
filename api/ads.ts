/**
 * api/ads.ts — Shared marketplace ads (server-side, service_role).
 *
 *   GET  /api/ads?type=buy&category=grain  → active ads WITHOUT contact numbers
 *   POST /api/ads  { ad, ownerId }         → insert ad, run matching, create
 *                                            notifications for matched owners,
 *                                            and return the poster's own matches
 *
 * Contact numbers are never returned here — the client gets them only through
 * /api/reveal after an eligibility/payment check.
 */

import { sbSelect, sbUpsert } from './_supabase';
import { matchScore, MATCH_THRESHOLD, type AdRow } from './_match';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });

/** Public view of an ad — everything except the phone number. */
function publicAd(a: AdRow) {
  const { contact, ...rest } = a;
  return rest;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const type = url.searchParams.get('type');
      const cat  = url.searchParams.get('category');
      let q = 'status=eq.active&order=created_at.desc&limit=300';
      if (type === 'buy' || type === 'sell') q += `&type=eq.${type}`;
      if (cat && cat !== 'all') q += `&category=eq.${cat}`;
      const rows = await sbSelect<AdRow>('ads', q);
      return json({ ads: rows.map(publicAd) });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const input = body.ad ?? {};
      const ownerId: string | null = body.ownerId ?? null;

      const row = {
        owner_id:       ownerId,
        type:           input.type === 'sell' ? 'sell' : 'buy',
        category:       String(input.category ?? 'other').slice(0, 40),
        product:        String(input.product ?? '').slice(0, 200),
        quantity_value: numOrNull(input.quantityValue),
        quantity_unit:  strOrNull(input.quantityUnit),
        quantity_freq:  strOrNull(input.quantityFreq),
        region:         strOrNull(input.region),
        district:       strOrNull(input.district),
        location:       strOrNull(input.location),
        price_value:    numOrNull(input.priceValue),
        price_unit:     strOrNull(input.priceUnit),
        contact:        strOrNull(input.contact),
        status:         'active',
      };
      if (!row.product) return json({ error: 'product required' }, 400);

      const saved = await sbUpsert<Record<string, unknown>>('ads', row) as unknown as AdRow;

      // Match against active ads of the OPPOSITE type in the same category.
      const opposite = saved.type === 'buy' ? 'sell' : 'buy';
      const candidates = await sbSelect<AdRow>('ads',
        `status=eq.active&type=eq.${opposite}&category=eq.${saved.category}&limit=300`);

      const matches = candidates
        .map(c => ({ ad: c, score: matchScore(saved, c) }))
        .filter(m => m.score >= MATCH_THRESHOLD)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      // Notify the OTHER party for each match (skip self-matches).
      for (const m of matches) {
        if (!m.ad.owner_id || m.ad.owner_id === ownerId) continue;
        await sbUpsert('notifications', {
          user_id:  m.ad.owner_id,
          kind:     'match',
          ad_id:    saved.id,        // the new ad they might want
          my_ad_id: m.ad.id,         // their existing ad it matched
          score:    m.score,
          title:    'Bu bitim sizni qiziqtiradimi?',
          body:     `${saved.product} · ${saved.region ?? saved.location ?? ''} (${m.score}% mos)`,
          read:     false,
        });
      }

      return json({
        ad: publicAd(saved),
        matches: matches.map(m => ({ ad: publicAd(m.ad), score: m.score })),
      });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    return json({ error: 'ads error', detail: String(err) }, 500);
  }
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n !== 0 ? n : null;
}
function strOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim();
  return s ? s.slice(0, 200) : null;
}
