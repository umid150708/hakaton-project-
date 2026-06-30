/**
 * taxCalc.ts — Uzbekistan SME tax calculation engine
 *
 * Two main regimes for micro/small businesses:
 *  1. Patent solig'i — fixed quarterly payment, no need to file revenue
 *  2. Soddalashtirilgan soliq tizimi (SST) — 4% of gross revenue (turnover tax)
 *
 * Employer obligations (if employees > 0):
 *  - INPS (ijtimoiy sug'urta) ~12% of payroll
 *  - Pension fund contribution ~0.1% of payroll (minimal)
 *  We use a blended ~25% payroll tax rate (conservative estimate for bankability)
 *
 * VAT only applies if annual turnover > 1 billion UZS (most SMEs exempt).
 *
 * Sources:
 *  - O'zbekiston Soliq kodeksi, 2023-2024 tahrirlari
 *  - Soliq.uz kalkulyator (SST 4%, patent jadval)
 */

import type { Facts } from './schema';

export interface TaxBreakdownItem {
  label: string;
  monthly_uzs: number;
  note: string;
}

export interface TaxResult {
  regime: 'patent' | 'sst';
  regime_label: string;
  monthly_tax_uzs: number;
  annual_tax_uzs: number;
  after_tax_monthly_uzs: number;   // monthly_revenue - monthly_tax
  effective_rate_pct: number;       // % of revenue
  breakdown: TaxBreakdownItem[];
  vat_applicable: boolean;
  recommendation: string;
  disclaimer: string;
}

// ── Patent solig'i quarterly amounts by sector (UZS, Toshkent shahar, 2024) ──
// For other regions typically 50–70% of Toshkent rates.
// We use conservative mid-range values.
const PATENT_QUARTERLY_BY_SECTOR: Record<string, number> = {
  bakery:        600_000,
  vegetables:    450_000,
  meat:          700_000,
  dairy:         500_000,
  beauty:        800_000,
  cafe:          900_000,
  agriculture:   400_000,
  construction: 1_200_000,
  clothing:      700_000,
  auto:        1_500_000,
  furniture:     900_000,
  electronics: 1_000_000,
  retail:        600_000,
  pharmacy:    1_000_000,
  education:     800_000,
  IT:          1_200_000,
  laundry:       600_000,
  transport:   1_000_000,
};

const DEFAULT_PATENT_QUARTERLY = 700_000; // fallback

// VAT threshold: 1 billion UZS annual revenue
const VAT_THRESHOLD_ANNUAL = 1_000_000_000;

// SST rate
const SST_RATE = 0.04;

// Payroll tax rate (INPS + pensiya)
const PAYROLL_TAX_RATE = 0.25;

// Minimum wage (2024): ~1,050,000 UZS/month — used for payroll estimate
const MIN_WAGE_UZS = 1_050_000;

export function calcTax(facts: Facts, categoryKey: string): TaxResult {
  const annual_revenue = facts.monthly_revenue_uzs * 12;
  const vat_applicable = annual_revenue > VAT_THRESHOLD_ANNUAL;

  // ── Patent eligibility ──
  // Patent applies to specific micro-business activities with revenue limits.
  // Conservative rule: eligible if annual revenue < 500M UZS and sector allows it.
  const patentSectors = [
    'bakery', 'vegetables', 'meat', 'dairy', 'beauty', 'cafe',
    'clothing', 'retail', 'laundry', 'agriculture',
  ];
  const patentEligible = patentSectors.includes(categoryKey)
    && annual_revenue < 500_000_000
    && facts.employees <= 5;

  // ── SST calculation ──
  const sst_monthly = facts.monthly_revenue_uzs * SST_RATE;
  const sst_annual = sst_monthly * 12;

  // ── Patent calculation ──
  const patent_quarterly = PATENT_QUARTERLY_BY_SECTOR[categoryKey] ?? DEFAULT_PATENT_QUARTERLY;
  const patent_monthly = patent_quarterly / 3;
  const patent_annual = patent_quarterly * 4;

  // ── Payroll taxes ──
  const estimated_avg_salary = Math.max(MIN_WAGE_UZS, facts.monthly_revenue_uzs * 0.15 / Math.max(facts.employees, 1));
  const payroll_base = estimated_avg_salary * facts.employees;
  const payroll_tax_monthly = facts.employees > 0 ? payroll_base * PAYROLL_TAX_RATE : 0;
  const payroll_tax_annual = payroll_tax_monthly * 12;

  // ── Choose regime ──
  // Patent wins when fixed cost is lower than 4% of revenue
  const usePatent = patentEligible && patent_annual < sst_annual;
  const regime: 'patent' | 'sst' = usePatent ? 'patent' : 'sst';

  const base_monthly = usePatent ? patent_monthly : sst_monthly;
  const base_annual  = usePatent ? patent_annual  : sst_annual;

  const total_monthly = base_monthly + payroll_tax_monthly;
  const total_annual  = base_annual  + payroll_tax_annual;

  const after_tax_monthly = Math.max(0, facts.monthly_revenue_uzs - total_monthly);
  const effective_rate = facts.monthly_revenue_uzs > 0
    ? (total_monthly / facts.monthly_revenue_uzs) * 100
    : 0;

  // ── Breakdown ──
  const breakdown: TaxBreakdownItem[] = [];

  if (usePatent) {
    breakdown.push({
      label: "Patent solig'i",
      monthly_uzs: patent_monthly,
      note: `${(patent_quarterly / 1_000).toFixed(0)} ming so'm/chorak — daromad miqdoridan qat'i nazar to'lanadi`,
    });
  } else {
    breakdown.push({
      label: "Soddalashtirilgan soliq (SST)",
      monthly_uzs: sst_monthly,
      note: `Oylik tushum × 4% = ${fmt(sst_monthly)} — har oy hisobot`,
    });
  }

  if (facts.employees > 0) {
    breakdown.push({
      label: `INPS va pensiya solig'i (${facts.employees} xodim)`,
      monthly_uzs: payroll_tax_monthly,
      note: `Taxminiy maosh × ${facts.employees} × 25% ≈ ${fmt(payroll_tax_monthly)}/oy`,
    });
  }

  if (vat_applicable) {
    breakdown.push({
      label: "QQS (VAT) — 12%",
      monthly_uzs: facts.monthly_revenue_uzs * 0.12,
      note: "Yillik daromad 1 mlrd so'mdan oshganligi sababli QQS to'lash majburiy",
    });
  }

  // ── Recommendation ──
  let recommendation: string;
  if (usePatent) {
    recommendation =
      `Patent solig'i foydali: yiliga faqat ${fmt(patent_annual)} — SST (${fmt(sst_annual)}) dan kamroq. ` +
      `Patentni chorakda bir marta mahalliy soliq organida yangilab turing.`;
  } else if (patentEligible) {
    recommendation =
      `Soddalashtirilgan soliq tizimi (4%) patent (${fmt(patent_annual)}/yil) dan arzonroq ` +
      `— daromad oshishi bilan bu ko'rsatkich qayta ko'rib chiqilishi mumkin.`;
  } else {
    const empNote = facts.employees > 2
      ? `${facts.employees} xodim uchun INPS to'lovini hisobga oling.`
      : `Xodimlar soni oshsa, ish haqi solig'i ham oshadi.`;
    recommendation =
      `Sohangizdagi tadbirkorlar uchun SST (4%) standart rejim. ${empNote}`;
  }

  return {
    regime,
    regime_label: usePatent ? "Patent solig'i" : "Soddalashtirilgan soliq (SST 4%)",
    monthly_tax_uzs: total_monthly,
    annual_tax_uzs: total_annual,
    after_tax_monthly_uzs: after_tax_monthly,
    effective_rate_pct: effective_rate,
    breakdown,
    vat_applicable,
    recommendation,
    disclaimer:
      "Bu hisob-kitob taxminiy. Aniq soliq majburiyatini tasdiqlash uchun mahalliy soliq organi yoki sertifikatlangan buxgalter bilan maslahatlashing.",
  };
}

function fmt(uzs: number): string {
  if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(1)} mln so'm`;
  return `${(uzs / 1_000).toFixed(0)} ming so'm`;
}
