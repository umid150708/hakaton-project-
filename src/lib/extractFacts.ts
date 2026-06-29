/**
 * extractFacts — parse raw Uzbek text answers into structured Facts.
 * Runs entirely client-side, no API needed.
 * Handles common patterns: "3 yil", "25 million so'm", "Ha, uy-joy bor", etc.
 */

import type { Facts } from './schema';

type RawAnswer = { question: string; answer: string };

// ─── Number helpers ───────────────────────────────────────────────────────────

function parseUzbekMoney(text: string): number {
  const t = text.toLowerCase().replace(/[\s,']/g, '');
  // Capture leading number (may include decimal with . or ,)
  const n = t.match(/(\d+(?:[.,]\d+)?)/);
  if (!n) return 0;
  const base = parseFloat(n[1].replace(',', '.'));
  if (t.includes('mlrd') || t.includes('milliard')) return base * 1_000_000_000;
  if (t.includes('mln') || t.includes('million')) return base * 1_000_000;
  // Raw number: if it looks huge already (>= 100000) treat as-is, otherwise assume millions
  if (base >= 100_000) return base;
  return base * 1_000_000;
}

function parseYears(text: string): number {
  const t = text.toLowerCase();
  if (/hozirgina|yangi\s+boshla|endigina|just\s+start/.test(t)) return 0;
  let total = 0;
  const yil = t.match(/(\d+(?:[.,]\d+)?)\s*yil/);
  const oy  = t.match(/(\d+)\s*oy/);
  if (yil) total += parseFloat(yil[1].replace(',', '.'));
  if (oy)  total += parseInt(oy[1]) / 12;
  // "bir yil" etc.
  if (!yil && !oy) {
    if (/bir/.test(t))    total = 1;
    if (/ikki/.test(t))   total = 2;
    if (/uch/.test(t))    total = 3;
    if (/to'rt|tort/.test(t)) total = 4;
    if (/besh/.test(t))   total = 5;
  }
  return Math.max(0, total);
}

function parseMonths(text: string): number {
  const t = text.toLowerCase();
  const oy  = t.match(/(\d+)\s*oy/i);
  const yil = t.match(/(\d+)\s*yil/i);
  if (oy)  return parseInt(oy[1]);
  if (yil) return parseInt(yil[1]) * 12;
  return 24; // safe default
}

function parseEmployees(text: string): number {
  const t = text.toLowerCase();
  if (/o'zim|faqat\s+men|yakka|yolg'iz|bir\s+o'zim|bir o'zim/.test(t)) return 1;
  const n = t.match(/(\d+)/);
  return n ? parseInt(n[1]) : 1;
}

// ─── Collateral detection ─────────────────────────────────────────────────────

function parseCollateral(text: string): { has_collateral: boolean; collateral_type: string } {
  const t = text.toLowerCase();

  // Clear "no"
  const isNo =
    /\byo'q\b|\byoq\b|mavjud\s+emas|garovsiz|garov\s+yo|yo'q\b/.test(t) &&
    !/\bha\b|\bbor\b/.test(t);

  if (isNo) return { has_collateral: false, collateral_type: '' };

  // Clear "yes" patterns
  const isYes = /\bha\b|\bbor\b|bera\s+ola|garo(v|w)\s+bor/.test(t);

  if (isYes || text.trim().length > 3) {
    return { has_collateral: true, collateral_type: text.trim() };
  }
  return { has_collateral: false, collateral_type: '' };
}

// ─── Main extractor ───────────────────────────────────────────────────────────

export function extractFacts(answers: RawAnswer[]): Facts {
  const a = (i: number) => answers[i]?.answer?.trim() ?? '';

  // Q1 — business type
  const business_type = a(0) || "Noma'lum biznes";

  // Q2 — region
  const region = a(1) || "Noma'lum viloyat";

  // Q3 — years operating
  const years_operating = parseYears(a(2));

  // Q4 — monthly revenue
  const monthly_revenue_uzs = parseUzbekMoney(a(3));

  // Q5 — loan purpose
  const loan_purpose = a(4) || "Ko'rsatilmagan";

  // Q6 — loan amount + term (e.g. "50 million so'm, 24 oyga")
  const loanRaw = a(5);
  const loan_amount_uzs  = parseUzbekMoney(loanRaw);
  const loan_term_months = parseMonths(loanRaw);

  // Q7 — collateral
  const { has_collateral, collateral_type } = parseCollateral(a(6));

  // Q8 — employees
  const employees = parseEmployees(a(7));

  // Q9 — competitors
  const main_competitors = a(8) || "Ko'rsatilmagan";

  // Q10 — two-year plan
  const two_year_plan = a(9) || "Ko'rsatilmagan";

  return {
    business_type,
    region,
    years_operating,
    monthly_revenue_uzs,
    loan_purpose,
    loan_amount_uzs,
    loan_term_months,
    has_collateral,
    collateral_type,
    employees,
    main_competitors,
    two_year_plan,
  };
}
