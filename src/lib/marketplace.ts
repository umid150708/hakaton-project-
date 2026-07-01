/**
 * marketplace.ts — Client for the ads backend (/api/ads, /api/reveal, /api/deal).
 * Ads return without contact numbers; the phone is fetched via reveal() only
 * when the user is eligible. Callers catch failures and fall back to local sample data.
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
  quantity_max: number | null;
  quantity_unit: string | null;
  quantity_freq: string | null;
  region: string | null;
  district: string | null;
  location: string | null;
  price_value: number | null;
  price_max: number | null;
  price_unit: string | null;
  status: string;
  created_at: string;
}

export interface NewAdInput {
  type: 'buy' | 'sell';
  category: Category;
  product: string;
  quantityValue: number | null;
  quantityMax: number | null;
  quantityUnit: string;
  quantityFreq: string;
  region: string;
  district: string;
  location: string;
  priceValue: number | null;
  priceMax: number | null;
  priceUnit: string;
  contact: string;
}

export interface Match { ad: Ad; score: number }

export type RevealResult =
  | { contact: string; freeLeft?: number }
  | { paywall: 'signup' | 'subscribe' | 'payfee'; fee?: number };

/** "20" or "20–22" (localized), with an optional suffix. */
function range(low: number | null, high: number | null, suffix = ''): string {
  if (!low && !high) return '';
  const f = (n: number) => n.toLocaleString('ru-RU');
  const lo = low ?? high!;
  const body = (high && high !== low) ? `${f(lo)}–${f(high)}` : f(lo);
  return `${body}${suffix}`;
}

export function rowToAd(r: AdRowPublic): Ad {
  const unitSuffix = ` ${r.quantity_unit ?? ''}${r.quantity_freq ?? ''}`.replace(/\s+$/, '');
  const quantity = range(r.quantity_value, r.quantity_max, unitSuffix);
  const location = r.district
    ? `${r.district}${r.region ? ', ' + r.region : ''}`
    : (r.region ?? r.location ?? '');
  const priceRange = range(r.price_value, r.price_max);
  const price = priceRange ? `${priceRange} so'm/${r.price_unit ?? 'dona'}` : '';
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

// Fee: client mirror of api/_match.dealFee.
function mid(low: number | null, high: number | null): number {
  if (low && high) return (low + high) / 2;
  return low ?? high ?? 0;
}

export function computeFee(
  priceValue: number | null, quantityValue: number | null,
  priceMax: number | null = null, quantityMax: number | null = null,
): number {
  const value = mid(priceValue, priceMax) * mid(quantityValue, quantityMax);
  if (!value) return DEAL_FEE_MIN;
  return Math.round(Math.min(Math.max(value * DEAL_FEE_PCT, DEAL_FEE_MIN), DEAL_FEE_MAX));
}

interface RequestOpts { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; timeoutMs?: number; throwOnError?: boolean }

export type AdPatch = Partial<NewAdInput> & { status?: 'active' | 'inactive' | 'sold' };

/** MarketplaceClient — owns all calls to the ads backend via one request() helper. */
class MarketplaceClient {
  private async request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
    const { method = 'GET', body, timeoutMs = 12_000, throwOnError = true } = opts;
    const res = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (throwOnError && !res.ok) throw new Error(`${path} ${res.status}`);
    return res.json() as Promise<T>;
  }

  private get userId(): string | null { return getUser()?.id ?? null; }

  /** Load active ads. Throws on failure so callers can fall back to local data. */
  async listAds(type: 'buy' | 'sell', category: Category): Promise<Ad[]> {
    const params = new URLSearchParams({ type });
    if (category !== 'all') params.set('category', category);
    const data = await this.request<{ ads?: AdRowPublic[] }>(`/api/ads?${params.toString()}`);
    return (data.ads ?? []).map(rowToAd);
  }

  /** Post a new ad; returns the created ad and the poster's immediate matches. */
  async createAd(input: NewAdInput): Promise<{ ad: Ad; matches: Match[] }> {
    const data = await this.request<{ ad: AdRowPublic; matches: { ad: AdRowPublic; score: number }[] }>(
      '/api/ads', { method: 'POST', body: { ad: input, ownerId: this.userId }, timeoutMs: 15_000 },
    );
    return {
      ad: rowToAd(data.ad),
      matches: (data.matches ?? []).map(m => ({ ad: rowToAd(m.ad), score: m.score })),
    };
  }

  /** Update an ad you own (price, quantity, status, etc.) — partial patch. */
  async updateAd(adId: string, patch: AdPatch): Promise<Ad> {
    const data = await this.request<{ ad: AdRowPublic }>(
      '/api/ads', { method: 'PUT', body: { id: adId, ownerId: this.userId, patch } },
    );
    return rowToAd(data.ad);
  }

  /** Ask the server whether the current user may see this ad's contact. */
  reveal(adId: string): Promise<RevealResult> {
    return this.request<RevealResult>('/api/reveal', { method: 'POST', body: { userId: this.userId, adId } });
  }

  /** Simulated payment: record the platform fee for this deal. */
  payDealFee(adId: string): Promise<{ ok: boolean; amount: number }> {
    return this.request('/api/deal', { method: 'POST', body: { userId: this.userId, adId } });
  }
}

/** Shared singleton — the app's one handle to the marketplace backend. */
export const marketplace = new MarketplaceClient();
