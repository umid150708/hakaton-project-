# API Response Schema

The serverless function returns this exact JSON. No prose, no markdown fences.
Validated by `src/lib/schema.ts` (Zod) before rendering.

```typescript
{
  facts: {
    business_type: string,           // e.g. "Novvoyxona"
    region: string,                  // e.g. "Jizzax viloyati"
    years_operating: number,         // 0 if <1 year
    monthly_revenue_uzs: number,     // in UZS
    loan_purpose: string,
    loan_amount_uzs: number,
    loan_term_months: number,
    has_collateral: boolean,
    collateral_type: string,         // "" if none
    employees: number,
    main_competitors: string,
    two_year_plan: string
  },
  business_plan: {
    executive_summary: string,       // Uzbek, 1 paragraph
    market_analysis: string,         // region + sector context, Uzbek
    marketing_production_plan: string,
    financial_forecast: string,      // 3-year view with stated assumptions, Uzbek
    risk_assessment: string          // risks + mitigations, Uzbek
  },
  bank_recommendations: [            // 2–3 items, best fit first
    {
      bank: string,                  // e.g. "Mikrokreditbank"
      why_fit: string,               // Uzbek, 1–2 sentences
      likely_requirements: string    // Uzbek, bullet-style list as a string
    }
  ],
  readiness_checklist: string[]      // Uzbek strings: "Pasport nusxasi — FUBT orqali"
}
```

## Rules Claude must follow
- Write ALL string values in Uzbek (Latin script)
- Do NOT include a credit score or probability anywhere
- Financial forecasts must state assumptions explicitly
- If data is missing, make conservative assumptions and state them
- Output only valid JSON — no preamble, no trailing text, no markdown
