/**
 * pricingConfig.ts — All pricing constants and plan metadata
 *
 * SOURCES:
 *  Average deal ~34M sum:
 *    stat.uz / invexi.org — Jan–Feb 2025 wholesale data
 *    46,477 small wholesale firms · 46,819B sum / 2 months
 *    → ~508M sum/month per firm ÷ ~15 deals = ~34M sum/deal
 *
 *  Deal fee 1.5%:
 *    UzEx official exchange: 0.18% (uzex.uz/en/pages/online-exchange-trades-tariff)
 *    Informal brokers (dallol): 3–5% (widely documented in UZ)
 *    We sit between both: cheaper than broker, adds AI value over exchange
 *
 *  Subscription benchmarks: OLX Pro UZ ~150k/month; annual -17–26% (SaaS standard)
 */

import type { Plan } from './auth';

// ─── Deal fee constants ────────────────────────────────────────────────────────

export const DEAL_FEE_PCT = 1.5;           // % of deal value
export const DEAL_FEE_MIN = 50_000;        // minimum fee per deal (sum)
export const DEAL_FEE_MAX = 5_000_000;     // maximum fee per deal (sum)
export const AVG_DEAL_SUM = 34_000_000;    // stat.uz derived average (sum)
export const AVG_DEALS_PER_MONTH = 15;     // stat.uz derived average

// ─── Plan metadata ─────────────────────────────────────────────────────────────

export interface PlanMeta {
  id: Plan;
  name: string;
  icon: string;
  color: 'blue' | 'purple' | 'emerald';
  monthlyPrice: number;
  yearlyPrice: number;
  yearSave: number;          // % saved vs monthly × 12
  tagline: string;
  bestFor: string;
  features: string[];
  notIncluded?: string[];
  badge?: string;
}

export const PLANS: PlanMeta[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '🚀',
    color: 'blue',
    monthlyPrice: 149_000,
    yearlyPrice:  1_490_000,
    yearSave: 17,
    tagline: "Kichik biznes uchun ideal kirish nuqtasi",
    bestFor: "Oyiga 1–5 ta bitim yopuvchilar",
    features: [
      '30 ta aloqa / oy',
      "Barcha kategoriyalar bo'yicha e'lon",
      'AI maslahatchi (5 ta savol/kun)',
      'Asosiy bozor filtrlari',
    ],
    notIncluded: ["Yuqori joylashuv (priority)", 'Haftalik hisobot', "Ko'p foydalanuvchi"],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '⚡',
    color: 'purple',
    monthlyPrice: 399_000,
    yearlyPrice:  3_590_000,
    yearSave: 25,
    tagline: "O'sib borayotgan biznes uchun to'liq paket",
    bestFor: "Oyiga 5–20 ta bitim yopuvchilar",
    badge: "Eng mashhur",
    features: [
      'Cheksiz aloqalar',
      'Cheksiz AI maslahatchi',
      "Priority ko'rinish (yuqorida chiqish)",
      'AI bozor tahlili (har kuni)',
      'Haftalik narx hisoboti',
      "E'lonni \"Tanlangan\" belgilash",
    ],
    notIncluded: ["Ko'p foydalanuvchi (5 ta)", 'Shaxsiy menejer'],
  },
  {
    id: 'business',
    name: 'Biznes',
    icon: '🏢',
    color: 'emerald',
    monthlyPrice: 899_000,
    yearlyPrice:  7_990_000,
    yearSave: 26,
    tagline: "Katta kompaniyalar va agentliklar uchun",
    bestFor: "Oyiga 20+ ta bitim yopuvchilar",
    features: [
      "Hammasi Pro-da bor",
      "5 ta foydalanuvchi (bir akkaunt)",
      "Featured e'lonlar (doim yuqorida)",
      'Maxsus AI bozor hisoboti (haftalik)',
      'Raqobatchilar tahlili',
      'Shaxsiy menejer (ish kunlari)',
    ],
  },
];

// ─── Color helpers ─────────────────────────────────────────────────────────────

type ColorVariant = 'bg' | 'border' | 'text';

const COLOR_MAP: Record<string, Record<ColorVariant, string>> = {
  blue:    { bg: 'bg-blue-700 hover:bg-blue-600',    border: 'border-blue-700',    text: 'text-blue-400' },
  purple:  { bg: 'bg-purple-700 hover:bg-purple-600', border: 'border-purple-600',  text: 'text-purple-400' },
  emerald: { bg: 'bg-emerald-700 hover:bg-emerald-600',border:'border-emerald-700', text: 'text-emerald-400' },
};

export function planColor(color: string, variant: ColorVariant): string {
  return COLOR_MAP[color]?.[variant] ?? '';
}

export function fmtSum(n: number): string {
  return n.toLocaleString('uz-UZ');
}
