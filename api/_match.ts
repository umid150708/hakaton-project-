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
  quantity_value: number | null;
  quantity_unit: string | null;
  quantity_freq: string | null;
  region: string | null;
  district: string | null;
  location: string | null;
  price_value: number | null;
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

  // Price: does the seller's price fit the buyer's target?
  const buyer  = a.type === 'buy'  ? a : b;
  const seller = a.type === 'sell' ? a : b;
  if (buyer.price_value && seller.price_value) {
    if (seller.price_value <= buyer.price_value)        score += 10;
    else if (seller.price_value <= buyer.price_value * 1.1) score += 5;
  } else {
    score += 4; // unknown price — small benefit of the doubt
  }

  return Math.round(Math.min(score, 100));
}

/** Platform fee for a deal, from the ad's price × quantity (clamped). */
export function dealFee(priceValue: number | null, quantityValue: number | null): number {
  const value = (priceValue ?? 0) * (quantityValue ?? 0);
  if (!value) return DEAL_FEE_MIN;
  const raw = value * DEAL_FEE_PCT;
  return Math.round(Math.min(Math.max(raw, DEAL_FEE_MIN), DEAL_FEE_MAX));
}
