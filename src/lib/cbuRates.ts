/**
 * cbuRates.ts — Central Bank of Uzbekistan live exchange rates
 * Free public API, no auth required, updated daily.
 * https://cbu.uz/uz/arkhiv-kursov-valyut/json/
 */

export interface CBURate {
  Ccy: string;       // "USD", "EUR", "RUB", "CNY"
  CcyNm_UZ: string;  // "AQSH dollari"
  Rate: string;      // "12060.84"
  Diff: string;      // "51.55" (change vs yesterday, positive = up)
  Date: string;      // "30.06.2026"
}

export interface RateSnapshot {
  usd: number;
  eur: number;
  rub: number;
  cny: number;
  usdDiff: number;
  rubDiff: number;
  cnyDiff: number;
  date: string;
  fetchedAt: number; // timestamp
}

// Cache in memory for the session
let cached: RateSnapshot | null = null;

export async function fetchRates(): Promise<RateSnapshot> {
  // Return cached if < 30 minutes old
  if (cached && Date.now() - cached.fetchedAt < 30 * 60 * 1000) {
    return cached;
  }

  const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', {
    signal: AbortSignal.timeout(6_000),
  });
  if (!res.ok) throw new Error('CBU API error');

  const data: CBURate[] = await res.json();
  const get = (ccy: string) => data.find(r => r.Ccy === ccy);

  const usd = get('USD');
  const eur = get('EUR');
  const rub = get('RUB');
  const cny = get('CNY');

  if (!usd) throw new Error('USD not found');

  cached = {
    usd:     parseFloat(usd.Rate),
    eur:     eur ? parseFloat(eur.Rate) : 0,
    rub:     rub ? parseFloat(rub.Rate) : 0,
    cny:     cny ? parseFloat(cny.Rate) : 0,
    usdDiff: parseFloat(usd.Diff),
    rubDiff: rub ? parseFloat(rub.Diff) : 0,
    cnyDiff: cny ? parseFloat(cny.Diff) : 0,
    date:    usd.Date,
    fetchedAt: Date.now(),
  };
  return cached;
}

/**
 * Which products are import-sensitive and to what currency?
 * Used to show "Dollar oshsa bu ham qimmatlaadi" warnings.
 */
export const IMPORT_SENSITIVITY: Record<string, {
  currency: 'USD' | 'RUB' | 'CNY';
  origin: string;
  impactPct: number; // how much price moves per 1% FX change
}> = {
  'qand_shakar':   { currency: 'USD', origin: 'Braziliya', impactPct: 0.7 },
  'oy_yog':        { currency: 'USD', origin: 'Import', impactPct: 0.5 },
  'armirovka':     { currency: 'RUB', origin: 'Rossiya / Xitoy', impactPct: 0.6 },
  'sement':        { currency: 'CNY', origin: 'Xitoy', impactPct: 0.4 },
  'paxta_ip':      { currency: 'USD', origin: 'Eksport + import', impactPct: 0.3 },
};
