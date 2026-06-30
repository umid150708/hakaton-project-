/**
 * _market-products.ts — Curated headline commodities tracked by the daily
 * market snapshot. These are the products shown in the top-of-site ticker
 * as *average market prices* (distinct from individual seller/buyer ads).
 *
 * `anchor` is a realistic mid-2026 Uzbek wholesale price in so'm, used to
 * ground the AI on day one and as a fallback if generation drifts.
 */

export interface TrackedProduct {
  key: string;       // stable id
  name: string;      // Uzbek display name
  unit: string;      // so'm per this unit
  anchor: number;    // baseline Uz wholesale price (so'm)
  emoji: string;
}

export const TRACKED_PRODUCTS: TrackedProduct[] = [
  { key: 'wheat_flour', name: "Bug'doy uni (oliy nav)", unit: 'kg',   anchor: 2400,   emoji: '🌾' },
  { key: 'rice',        name: 'Guruch (Devzira)',        unit: 'kg',   anchor: 7500,   emoji: '🍚' },
  { key: 'beef',        name: "Mol go'shti",             unit: 'kg',   anchor: 78000,  emoji: '🥩' },
  { key: 'chicken',     name: "Tovuq go'shti",           unit: 'kg',   anchor: 33000,  emoji: '🍗' },
  { key: 'potato',      name: 'Kartoshka',               unit: 'kg',   anchor: 2800,   emoji: '🥔' },
  { key: 'sugar',       name: 'Qand shakar',             unit: 'kg',   anchor: 5100,   emoji: '🧂' },
  { key: 'cotton_oil',  name: "Paxta yog'i (rafinir)",   unit: 'litr', anchor: 15500,  emoji: '🛢️' },
  { key: 'cement',      name: 'Sement (M400)',           unit: 'kg',   anchor: 950,    emoji: '🏗️' },
  { key: 'rebar',       name: 'Armatura (d12)',          unit: 'kg',   anchor: 9200,   emoji: '🔩' },
  { key: 'milk',        name: 'Sut (ferma)',             unit: 'litr', anchor: 5800,   emoji: '🥛' },
];

/** One snapshot price entry stored in market_snapshots.data */
export interface PriceEntry {
  key: string;
  name: string;
  unit: string;
  emoji: string;
  uzPrice: number;       // today's average Uz wholesale price (so'm)
  changePct: number;     // % change vs previous snapshot
  trend: 'up' | 'down' | 'flat';
  note: string;          // short world / Central Asia context (Uzbek)
}
