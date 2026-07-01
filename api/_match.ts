/**
 * _match.ts — Server-side deal matching + fee math (shared by the ad endpoints).
 *
 * A buy ad and a sell ad "match" when they're the same category and their
 * product, location and price line up. Score is 0–100; ≥ MATCH_THRESHOLD is a
 * notify-worthy match ("Bu bitim sizni qiziqtiradimi?").
 */

export interface AdRow {
  id: string;
  owner_id: string | null;
  type: 'buy' | 'sell';
  category: string;
  product: string;
  quantity_value: number | null;   // low end of the quantity range
  quantity_max: number | null;     // high end (null = single value)
  quantity_unit: string | null;
  quantity_freq: string | null;
  region: string | null;
  district: string | null;
  location: string | null;
  price_value: number | null;      // low end of the price range
  price_max: number | null;        // high end (null = single value)
  price_unit: string | null;
  contact: string | null;
  status: string;
  created_at: string;
}

export const MATCH_THRESHOLD = 85;

// Deal-fee constants (mirror src/lib/pricingConfig.ts).
export const DEAL_FEE_PCT = 0.015;       // 1.5%
export const DEAL_FEE_MIN = 50_000;
export const DEAL_FEE_MAX = 5_000_000;

function norm(s: string | null | undefined): string {
  return (s ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function tokens(s: string): Set<string> {
  return new Set(norm(s).split(/[^0-9a-zа-яўқғҳё']+/i).filter(w => w.length > 1));
}

/** 0..1 similarity between two product names (exact → contains → token Jaccard). */
function productSim(a: string, b: string): number {
  const na = norm(a), nb = norm(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const ta = tokens(a), tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  ta.forEach(t => { if (tb.has(t)) inter++; });
  const union = new Set([...ta, ...tb]).size;
  return union ? inter / union : 0;
}

/**
 * Score a candidate ad against a reference ad of the OPPOSITE type.
 * Category is a hard gate. Weights: category 40, product 30, location 20, price 10.
 */
export function matchScore(a: AdRow, b: AdRow): number {
  if (a.type === b.type) return 0;
  if (a.category !== b.category) return 0;

  let score = 40; // same category

  score += 30 * productSim(a.product, b.product);

  // Location: same district is "near me"; same region is decent.
  const ad = norm(a.district), bd = norm(b.district);
  const ar = norm(a.region) || norm(a.location);
  const br = norm(b.region) || norm(b.location);
  if (ad && bd && ad === bd) score += 20;
  else if (ar && br && (ar === br || ar.includes(br) || br.includes(ar))) score += 12;

  // Price: can the buyer's top budget cover the seller's cheapest offer?
  const buyer  = a.type === 'buy'  ? a : b;
  const seller = a.type === 'sell' ? a : b;
  const buyerTop  = buyer.price_max ?? buyer.price_value;   // most the buyer will pay
  const sellerLow = seller.price_value ?? seller.price_max; // least the seller accepts
  if (buyerTop && sellerLow) {
    if (sellerLow <= buyerTop)          score += 10;   // ranges can meet
    else if (sellerLow <= buyerTop * 1.1) score += 5;  // close
  } else {
    score += 4; // unknown price — small benefit of the doubt
  }

  return Math.round(Math.min(score, 100));
}

/** Midpoint of a [low, high] range (or the single value). */
function mid(low: number | null, high: number | null): number {
  if (low && high) return (low + high) / 2;
  return low ?? high ?? 0;
}

/** Platform fee for a deal, from mid(price) × mid(quantity), clamped. */
export function dealFee(ad: Pick<AdRow, 'price_value' | 'price_max' | 'quantity_value' | 'quantity_max'>): number {
  const value = mid(ad.price_value, ad.price_max) * mid(ad.quantity_value, ad.quantity_max);
  if (!value) return DEAL_FEE_MIN;
  return Math.round(Math.min(Math.max(value * DEAL_FEE_PCT, DEAL_FEE_MIN), DEAL_FEE_MAX));
}
