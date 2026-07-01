/**
 * marketplace.ts — Client wrappers for the Supabase-backed ads bridge.
 *
 * Talks to /api/ads, /api/reveal, /api/deal. Ads come back WITHOUT contact
 * numbers; the phone is fetched separately via reveal() only when the user is
 * eligible (free limit / subscription / paid deal fee).
 *
 * Every read/write degrades gracefully: callers catch failures and fall back to
 * the local sample data, so the marketplace keeps working before the Supabase
 * tables (scripts/002_marketplace.sql) are created.
 */

import { getUser } from './auth';
import type { Ad, Category } from './bozorData';

export const DEAL_FEE_PCT = 0.015;
export const DEAL_FEE_MIN = 50_000;
export const DEAL_FEE_MAX = 5_000_000;

export interface AdRowPublic {
  id: string;
  owner_id: string | null;
  type: 'buy' | 'sell';
  category: string;
  product: string;
  quantity_value: number | null;
  quantity_unit: string | null;
  quantity_freq: string | null;
  region: string | null;
  district: string | null;
  location: string | null;
  price_value: number | null;
  price_unit: string | null;
  status: string;
  created_at: string;
}

export interface NewAdInput {
  type: 'buy' | 'sell';
  category: Category;
  product: string;
  quantityValue: number | null;
  quantityUnit: string;
  quantityFreq: string;
  region: string;
  district: string;
  location: string;
  priceValue: number | null;
  priceUnit: string;
  contact: string;
}

export interface Match { ad: Ad; score: number }

export type RevealResult =
  | { contact: string; freeLeft?: number }
  | { paywall: 'signup' | 'subscribe' | 'payfee'; fee?: number };

// ── Row → display Ad ───────────────────────────────────────────────────────────

export function rowToAd(r: AdRowPublic): Ad {
  const quantity = r.quantity_value
    ? `${r.quantity_value} ${r.quantity_unit ?? ''}${r.quantity_freq ?? ''}`.trim()
    : '';
  const location = r.district
    ? `${r.district}${r.region ? ', ' + r.region : ''}`
    : (r.region ?? r.location ?? '');
  const price = r.price_value
    ? `${r.price_value.toLocaleString('ru-RU')} so'm/${r.price_unit ?? 'dona'}`
    : '';
  return {
    id: r.id,
    type: r.type,
    category: r.category as Category,
    product: r.product,
    quantity,
    location,
    price,
    contact: '',                         // revealed separately
    date: fmtDate(r.created_at),
    sample: false,
  };
}

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('uz-UZ'); } catch { return ''; }
}

// ── Fee (client mirror of api/_match.dealFee) ─────────────────────────────────

export function computeFee(priceValue: number | null, quantityValue: number | null): number {
  const value = (priceValue ?? 0) * (quantityValue ?? 0);
  if (!value) return DEAL_FEE_MIN;
  return Math.round(Math.min(Math.max(value * DEAL_FEE_PCT, DEAL_FEE_MIN), DEAL_FEE_MAX));
}

// ── API calls ──────────────────────────────────────────────────────────────────

/** Load active ads from the shared backend. Throws on failure (caller falls back). */
export async function listAds(type: 'buy' | 'sell', category: Category): Promise<Ad[]> {
  const params = new URLSearchParams({ type });
  if (category !== 'all') params.set('category', category);
  const res = await fetch(`/api/ads?${params.toString()}`, { signal: AbortSignal.timeout(12_000) });
  if (!res.ok) throw new Error(`ads ${res.status}`);
  const data = await res.json() as { ads?: AdRowPublic[] };
  return (data.ads ?? []).map(rowToAd);
}

/** Post a new ad; returns the created ad and the poster's immediate matches. */
export async function createAd(input: NewAdInput): Promise<{ ad: Ad; matches: Match[] }> {
  const res = await fetch('/api/ads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ad: input, ownerId: getUser()?.id ?? null }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`createAd ${res.status}`);
  const data = await res.json() as { ad: AdRowPublic; matches: { ad: AdRowPublic; score: number }[] };
  return {
    ad: rowToAd(data.ad),
    matches: (data.matches ?? []).map(m => ({ ad: rowToAd(m.ad), score: m.score })),
  };
}

/** Ask the server whether the current user may see this ad's contact. */
export async function reveal(adId: string): Promise<RevealResult> {
  const res = await fetch('/api/reveal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUser()?.id ?? null, adId }),
    signal: AbortSignal.timeout(12_000),
  });
  return res.json() as Promise<RevealResult>;
}

/** Simulated payment: record the platform fee for this deal. */
export async function payDealFee(adId: string): Promise<{ ok: boolean; amount: number }> {
  const res = await fetch('/api/deal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: getUser()?.id ?? null, adId }),
    signal: AbortSignal.timeout(12_000),
  });
  return res.json() as Promise<{ ok: boolean; amount: number }>;
}
