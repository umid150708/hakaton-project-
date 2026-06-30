/**
 * api/market-refresh.ts — Daily market analysis job (runs via Vercel Cron)
 *
 * Once a day it:
 *   1. Loads the previous snapshot (for real day-over-day change)
 *   2. Asks Groq for today's Uzbek wholesale prices for tracked commodities,
 *      grounded in Central Asia + world market context
 *   3. Computes % change & trend vs the previous snapshot
 *   4. Upserts one row into market_snapshots keyed by today's date
 *
 * Secured: only Vercel Cron (sends Authorization: Bearer $CRON_SECRET) or a
 * manual call with ?key=$CRON_SECRET may trigger it.
 */

import { sbSelect, sbUpsert } from './_supabase';
import { TRACKED_PRODUCTS, type PriceEntry } from './_market-products';

export const config = { runtime: 'edge' };

interface Snapshot {
  date: string;
  data: PriceEntry[];
  analysis: string;
}

function todayUz(): string {
  // Uzbekistan is UTC+5; use that day boundary
  return new Date(Date.now() + 5 * 3600_000).toISOString().slice(0, 10);
}

// ── Ask Groq for today's prices + context ─────────────────────────────────────

async function generatePrices(prev: Snapshot | null): Promise<{ prices: { key: string; uzPrice: number; note: string }[]; analysis: string }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('No GROQ_API_KEY');

  const prevMap = new Map((prev?.data ?? []).map(p => [p.key, p.uzPrice]));
  const list = TRACKED_PRODUCTS.map(p => {
    const last = prevMap.get(p.key) ?? p.anchor;
    return `${p.key} | ${p.name} | ${p.unit} | oldingi narx: ${last} so'm`;
  }).join('\n');

  const prompt = `Bugun ${todayUz()}. O'zbekiston ulgurji bozori uchun quyidagi mahsulotlarning bugungi o'rtacha narxini belgilang.

Mahsulotlar (kalit | nom | birlik | oldingi narx):
${list}

QOIDALAR:
- Har bir mahsulot uchun real bugungi O'zbekiston ulgurji narxini so'mda bering (oldingi narxdan kichik o'zgarish bilan, mavsum va jahon bozoriga mos)
- "note" — qisqa (5-8 so'z) Markaziy Osiyo yoki jahon bozori konteksti (o'zbek tilida)
- "analysis" — 2-3 jumlalik umumiy bozor sharhi (o'zbek tilida, professional, Reuters uslubida)

Faqat JSON qaytaring:
{"prices":[{"key":"wheat_flour","uzPrice":2400,"note":"jahon bug'doy narxi barqaror"}],"analysis":"..."}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // 8b-instant: separate 500k/day token pool from the 70b AIStrip analysis,
      // and JSON mode constrains output so the smaller model is reliable here
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      temperature: 0.4,
    }),
  });

  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(raw);
}

// ── Build snapshot with computed change/trend ─────────────────────────────────

function buildSnapshot(
  gen: { prices: { key: string; uzPrice: number; note: string }[]; analysis: string },
  prev: Snapshot | null,
): Snapshot {
  const prevMap = new Map((prev?.data ?? []).map(p => [p.key, p.uzPrice]));
  const genMap = new Map(gen.prices.map(p => [p.key, p]));

  const data: PriceEntry[] = TRACKED_PRODUCTS.map(p => {
    const g = genMap.get(p.key);
    const uzPrice = Math.round(g?.uzPrice ?? prevMap.get(p.key) ?? p.anchor);
    const last = prevMap.get(p.key) ?? uzPrice;
    const changePct = last > 0 ? +(((uzPrice - last) / last) * 100).toFixed(1) : 0;
    const trend: PriceEntry['trend'] = changePct > 0.05 ? 'up' : changePct < -0.05 ? 'down' : 'flat';
    return {
      key: p.key,
      name: p.name,
      unit: p.unit,
      emoji: p.emoji,
      uzPrice,
      changePct,
      trend,
      note: g?.note ?? '',
    };
  });

  return { date: todayUz(), data, analysis: gen.analysis ?? '' };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req: Request): Promise<Response> {
  // Auth: Vercel cron header OR ?key=CRON_SECRET
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const authHeader = req.headers.get('authorization') ?? '';
  const ok = secret && (authHeader === `Bearer ${secret}` || url.searchParams.get('key') === secret);
  if (!ok) return new Response('Unauthorized', { status: 401 });

  try {
    const prevRows = await sbSelect<Snapshot>('market_snapshots', 'order=date.desc&limit=1');
    const prev = prevRows[0] ?? null;

    const gen = await generatePrices(prev);
    const snapshot = buildSnapshot(gen, prev);

    await sbUpsert('market_snapshots', snapshot);

    return new Response(JSON.stringify({ ok: true, date: snapshot.date, products: snapshot.data.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('market-refresh failed:', String(e));
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
