/**
 * revenueCheck — validates stated monthly revenue against market price data.
 *
 * Compares what an entrepreneur claims to earn against what a business of
 * that type/size realistically generates based on:
 *   1. Category benchmarks (empirical Uzbek SME data)
 *   2. Curated market price data (when available)
 *
 * Catches two common mistakes in loan applications:
 *   - Understated revenue (forgot zeros — "2 million" instead of 20 million)
 *   - Overstated revenue (trying to look better for the bank)
 */

import type { Facts } from './schema';
import type { CategoryInfo } from './categoryMap';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minimal price info needed — compatible with curated and fallback price entries. */
interface PriceEntry {
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
}

export interface RevenueCheckResult {
  /** Verdict: within range / too low (likely missing zeros) / too high / no data */
  status: 'ok' | 'too_low' | 'too_high' | 'ok_high' | 'unverifiable';
  /** What the user stated (UZS/month) */
  stated_uzs: number;
  /** Lower bound of estimated monthly revenue for this business size (UZS) */
  estimated_min_uzs: number;
  /** Upper bound of estimated monthly revenue for this business size (UZS) */
  estimated_max_uzs: number;
  /** stated ÷ estimated_mid; 1.0 = exactly at midpoint estimate */
  ratio: number;
  /** Uzbek-language verdict message shown to user */
  message: string;
  /** Uzbek-language improvement tip */
  tip: string;
  /** Which data source was used for the estimate */
  basis: 'price_data' | 'category_benchmark' | 'none';
  /** Name of price query used (if price_data basis) */
  price_used?: string;
}

// ─── Category benchmarks ──────────────────────────────────────────────────────
// Monthly revenue per employee (UZS). Empirical data for Uzbekistan 2026.
// Sole proprietors with 0 employees count as 1.

interface CategoryBenchmark {
  /** Monthly revenue per employee at low end (small operation, low-traffic) */
  min_per_emp: number;
  /** Monthly revenue per employee at high end (efficient, busy operation) */
  max_per_emp: number;
  /** Primary price query to use for price-anchored estimation, if any */
  price_query?: string;
  /** Average units sold per employee per working day (for price estimation) */
  units_per_day?: number;
}

const BENCHMARKS: Record<string, CategoryBenchmark> = {
  "Non va pishiriq mahsulotlari": {
    min_per_emp: 8_000_000,
    max_per_emp: 28_000_000,
    price_query: "non sotiladi",
    units_per_day: 80,        // loaves per employee
  },
  "Meva-sabzavot savdosi": {
    min_per_emp: 10_000_000,
    max_per_emp: 40_000_000,
    price_query: "sabzavot ulgurji",
    units_per_day: 120,       // kg per employee
  },
  "Go'sht va chorva mahsulotlari": {
    min_per_emp: 35_000_000,
    max_per_emp: 130_000_000,
    price_query: "mol go'shti sotiladi",
    units_per_day: 25,        // kg per employee
  },
  "Sut mahsulotlari": {
    min_per_emp: 12_000_000,
    max_per_emp: 48_000_000,
    price_query: "sut sotiladi",
    units_per_day: 80,        // liters per employee
  },
  "Go'zallik saloni va sartaroshxona": {
    min_per_emp: 5_000_000,
    max_per_emp: 18_000_000,
    // Service business — no product price, use fixed service fee estimate
  },
  "Oshxona va restoran": {
    min_per_emp: 12_000_000,
    max_per_emp: 55_000_000,
    // Average check ~45,000 UZS, ~20 covers/day/employee
    price_query: "go'sht sotiladi",
    units_per_day: 20,        // covers per employee
  },
  "Qishloq xo'jaligi": {
    min_per_emp: 8_000_000,
    max_per_emp: 100_000_000, // Very wide: depends on crop, season, hectares
    price_query: "bug'doy sotiladi",
    units_per_day: 500,       // kg produced/day across all workers (seasonal avg)
  },
  "Qurilish va ta'mirlash": {
    min_per_emp: 18_000_000,
    max_per_emp: 150_000_000, // Wide: project-based
  },
  "Kiyim-kechak va tikuvchilik": {
    min_per_emp: 8_000_000,
    max_per_emp: 35_000_000,
    price_query: "kiyim ulgurji",
    units_per_day: 6,         // garments per employee
  },
  "Avtomobil xizmatlari": {
    min_per_emp: 10_000_000,
    max_per_emp: 48_000_000,
    price_query: "motor yog'i sotiladi",
    units_per_day: 4,         // vehicles serviced per employee
  },
  "Mebel va yog'och ishlari": {
    min_per_emp: 15_000_000,
    max_per_emp: 80_000_000,
    price_query: "yog'och sotiladi",
    units_per_day: 0.1,       // cubic meters processed per employee
  },
  "Elektronika savdosi": {
    min_per_emp: 28_000_000,
    max_per_emp: 160_000_000,
    price_query: "elektronika ulgurji",
    units_per_day: 5,         // items per employee
  },
  "Chakana savdo do'koni": {
    min_per_emp: 10_000_000,
    max_per_emp: 55_000_000,
    price_query: "oziq ovqat ulgurji",
    units_per_day: 20,        // kg/items per employee
  },
  "Tibbiyot va dorixona": {
    min_per_emp: 8_000_000,
    max_per_emp: 42_000_000,
    price_query: "dori vositalar",
    units_per_day: 20,        // prescriptions/items
  },
  "Ta'lim va kurslar": {
    min_per_emp: 5_000_000,
    max_per_emp: 22_000_000,
    // ~10-20 students × 600,000 monthly fee per teacher
  },
  "IT va raqamli xizmatlar": {
    min_per_emp: 8_000_000,
    max_per_emp: 60_000_000,
  },
  "Kir yuvish xizmati": {
    min_per_emp: 5_000_000,
    max_per_emp: 22_000_000,
    price_query: "kir yuvish kukuni",
    units_per_day: 15,        // kg of laundry per employee
  },
  "Transport va logistika": {
    min_per_emp: 15_000_000,
    max_per_emp: 65_000_000,
  },
};

// ─── Scale factor ─────────────────────────────────────────────────────────────
// Diminishing returns: 2 employees ≠ 2× revenue. Use N^0.78.
// Special: sole proprietor (0 employees) = 1 effective worker.

function employeeScale(employees: number): number {
  const n = Math.max(1, employees);
  return Math.pow(n, 0.78);
}

// ─── Price-anchored estimate ──────────────────────────────────────────────────
// When price data is available and we have a units_per_day, compute a
// bottom-up estimate: units × price × working_days × employees.

function priceEstimate(
  benchmark: CategoryBenchmark,
  prices: Record<string, PriceEntry>,
  employees: number,
): { min: number; max: number; query: string } | null {
  const { price_query, units_per_day } = benchmark;
  if (!price_query || !units_per_day) return null;

  const priceData = prices[price_query];
  if (!priceData || priceData.avg <= 0) return null;

  const WORKING_DAYS = 26;
  const scale = employeeScale(employees);
  const dailyRevenue = units_per_day * priceData.avg;

  // Apply a conservative margin: not every unit sells at avg price, some days are slow
  const conservativeMin = dailyRevenue * 0.5 * WORKING_DAYS * scale;
  const optimisticMax  = dailyRevenue * 1.6 * WORKING_DAYS * scale;

  // For high-turnover businesses (grocery, meat), keep the markup smaller
  return {
    min: Math.round(conservativeMin),
    max: Math.round(optimisticMax),
    query: price_query,
  };
}

// ─── Core function ────────────────────────────────────────────────────────────

/**
 * Compare stated monthly revenue against what a business of this
 * category and size should realistically generate.
 */
export function checkRevenue(
  facts: Facts,
  prices: Record<string, PriceEntry>,
  category: CategoryInfo,
): RevenueCheckResult {
  const { monthly_revenue_uzs: stated, employees } = facts;

  // ── Find benchmark ──
  const benchmark = BENCHMARKS[category.category];

  if (!benchmark) {
    return {
      status: 'unverifiable',
      stated_uzs: stated,
      estimated_min_uzs: 0,
      estimated_max_uzs: 0,
      ratio: 1,
      basis: 'none',
      message: 'Bu turdagi biznes uchun daromad solishtirilmadi.',
      tip: "Oylik daromadni aniq hisob-kitob bilan ko'rsating.",
    };
  }

  const scale = employeeScale(employees);

  // ── Try price-anchored estimate first ──
  const priceEst = priceEstimate(benchmark, prices, employees);

  let estimatedMin: number;
  let estimatedMax: number;
  let basis: RevenueCheckResult['basis'];
  let priceUsed: string | undefined;

  if (priceEst && priceEst.max > 0) {
    // Use the wider of benchmark and price estimate (prices add precision)
    estimatedMin = Math.min(benchmark.min_per_emp * scale, priceEst.min);
    estimatedMax = Math.max(benchmark.max_per_emp * scale, priceEst.max);
    basis = 'price_data';
    priceUsed = priceEst.query;
  } else {
    // Fall back to pure category benchmark scaled by employees
    estimatedMin = benchmark.min_per_emp * scale;
    estimatedMax = benchmark.max_per_emp * scale;
    basis = 'category_benchmark';
  }

  const estimatedMid = (estimatedMin + estimatedMax) / 2;
  const ratio = estimatedMid > 0 ? stated / estimatedMid : 1;

  // ── Verdict thresholds ──
  // Too low: < 12% of min (likely missing a zero — e.g. "2M" instead of "20M")
  // OK low: 12%-100% of min (small operation, seasonal, just started)
  // OK: within estimated range
  // OK high: 100%-400% of max (booming, multiple shifts, prime location)
  // Too high: > 400% of max (mathematically impossible for this business type/size)

  const TOO_LOW_THRESHOLD  = estimatedMin * 0.12;
  const OK_HIGH_THRESHOLD  = estimatedMax * 4.0;

  let status: RevenueCheckResult['status'];
  let message: string;
  let tip: string;

  const fmtM = (n: number) => `${(n / 1_000_000).toFixed(1)} mln so'm`;

  if (stated < TOO_LOW_THRESHOLD) {
    status = 'too_low';
    message = `Ko'rsatilgan daromad (${fmtM(stated)}/oy) bu turdagi biznes uchun juda past ko'rinadi. Taxminiy ko'rsatkich: ${fmtM(estimatedMin)}–${fmtM(estimatedMax)}/oy.`;
    tip = "Raqamni tekshiring — so'm bilan yozganmisiz? Masalan, '2 million' o'rniga '20 million' bo'lishi mumkin.";
  } else if (stated > OK_HIGH_THRESHOLD) {
    status = 'too_high';
    message = `Ko'rsatilgan daromad (${fmtM(stated)}/oy) ${employees || 1} xodim uchun juda yuqori ko'rinadi. Taxminiy chegara: ${fmtM(estimatedMax)}/oy.`;
    tip = `Daromadni realistic hisoblang: narx × miqdor × ish kunlari. Bank ham xuddi shunday tekshiradi.`;
  } else if (stated > estimatedMax) {
    status = 'ok_high';
    message = `Daromad (${fmtM(stated)}/oy) kutilgan chegaradan biroz yuqori — bu iloji bor, lekin bank isbotini so'rashi mumkin.`;
    tip = "Kassoviy hisobot yoki bank ko'chirmasi tayyorlab qo'ying — bu raqamni tasdiqlashga yordam beradi.";
  } else {
    status = 'ok';
    message = `Daromad (${fmtM(stated)}/oy) bu turdagi biznes uchun realistik ko'rinadi. Taxminiy diapazon: ${fmtM(estimatedMin)}–${fmtM(estimatedMax)}/oy.`;
    tip = "Daromad realistik. Uni tasdiqlash uchun soliq hisobotlari va bank ko'chirmalarini yig'ib qo'ying.";
  }

  return {
    status,
    stated_uzs: stated,
    estimated_min_uzs: Math.round(estimatedMin),
    estimated_max_uzs: Math.round(estimatedMax),
    ratio: Math.round(ratio * 100) / 100,
    message,
    tip,
    basis,
    price_used: priceUsed,
  };
}

// ─── Convenience: check and summarise in one line ─────────────────────────────

/**
 * Returns a short badge label for the revenue check status.
 * Used in UI chips: "✓ Realistik" | "⚠ Past" | "⚠ Yuqori" | "—"
 */
export function revenueStatusLabel(status: RevenueCheckResult['status']): string {
  switch (status) {
    case 'ok':           return '✓ Realistik';
    case 'ok_high':      return '⚠ Biroz yuqori';
    case 'too_low':      return '⚠ Juda past';
    case 'too_high':     return '⚠ Juda yuqori';
    case 'unverifiable': return '—';
  }
}
