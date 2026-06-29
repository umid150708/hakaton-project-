# Loan Readiness Scoring Rubric

Implemented in `src/lib/scoring.ts` as a pure TypeScript function.
Score = sum of components. Total max = 100.

## Components

### 1. Track Record (max 20 pts)
Measures business stability and experience.
- years_operating >= 5 → 20
- years_operating >= 3 → 16
- years_operating >= 1 → 10
- years_operating >= 0.5 → 5
- < 0.5 → 2

### 2. Repayment Capacity (max 25 pts)
Core question: can monthly revenue cover repayments?
Formula: `coverage = (monthly_revenue_uzs * loan_term_months) / loan_amount_uzs`
- coverage >= 3.0 → 25 (very strong)
- coverage >= 2.0 → 20
- coverage >= 1.5 → 14
- coverage >= 1.0 → 8 (break-even — risky)
- coverage < 1.0 → 2 (likely to be rejected)

### 3. Collateral (max 20 pts)
- has_collateral = true AND collateral_type includes "ko'chmas mulk" (real estate) → 20
- has_collateral = true, other type → 13
- has_collateral = false → 0

### 4. Business Scale (max 15 pts)
Proxy for formality and stability.
- employees >= 10 → 15
- employees >= 5 → 11
- employees >= 2 → 7
- employees = 1 (solo) → 3

### 5. Sector Outlook (max 10 pts)
Simple sector risk map based on business_type keywords.
- Food production, agriculture, manufacturing → 10
- Services, education, healthcare → 8
- Retail, trade → 6
- Construction → 5
- Unknown / other → 5

### 6. Digital Footprint (max 10 pts)
Proxy for how the entrepreneur will score in the Dec-2026 government AI scoring system,
which uses utility payments, turnover records, and tax activity.
- monthly_revenue > 0 AND years_operating > 0 AND employees > 0 → 10
  (has verifiable turnover, likely registered, likely paying taxes)
- partial data → 5
- minimal data → 2

---

## Score bands
- 0–39: **Past** (red) — "Kredit olish ehtimoli past. Quyidagi kamchiliklarni to'ldiring."
- 40–64: **O'rta** (amber) — "Yaxshi asos. Bir-ikki kamchilikni bartaraf eting."
- 65–100: **Yuqori** (green) — "Kredit olish uchun yaxshi tayyorgarlansiz."

---

## Output type
```typescript
interface ScoreResult {
  total: number;                // 0–100
  band: 'Past' | "O'rta" | 'Yuqori';
  color: 'red' | 'amber' | 'green';
  breakdown: {
    label: string;              // Uzbek label
    points: number;             // earned
    max: number;                // max possible
    note: string;               // Uzbek explanation
  }[];
}
```
