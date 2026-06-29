import { z } from 'zod';

export const FactsSchema = z.object({
  business_type: z.string().min(1, 'business_type required'),
  region: z.string().min(1, 'region required'),
  years_operating: z.coerce.number().nonnegative('years_operating cannot be negative'),
  monthly_revenue_uzs: z.coerce.number().positive('monthly_revenue_uzs must be > 0'),
  loan_purpose: z.string().min(1, 'loan_purpose required'),
  loan_amount_uzs: z.coerce.number().positive('loan_amount_uzs must be > 0'),
  loan_term_months: z.coerce.number().positive('loan_term_months must be > 0'),
  has_collateral: z.coerce.boolean(),
  collateral_type: z.string().default(''),
  employees: z.coerce.number().nonnegative('employees cannot be negative'),
  main_competitors: z.string().min(1, 'main_competitors required'),
  two_year_plan: z.string().min(1, 'two_year_plan required'),
});

export const BusinessPlanSchema = z.object({
  executive_summary: z.string().min(10, 'executive_summary too short'),
  market_analysis: z.string().min(10, 'market_analysis too short'),
  marketing_production_plan: z.string().min(10, 'marketing_production_plan too short'),
  financial_forecast: z.string().min(10, 'financial_forecast too short'),
  risk_assessment: z.string().min(10, 'risk_assessment too short'),
});

export const BankRecommendationSchema = z.object({
  bank: z.string(),
  why_fit: z.string(),
  likely_requirements: z.string(),
});

export const AIResultSchema = z.object({
  facts: FactsSchema,
  business_plan: BusinessPlanSchema,
  bank_recommendations: z.array(BankRecommendationSchema).min(2, 'At least 2 bank recommendations required'),
  readiness_checklist: z.array(z.string().min(5)).min(3, 'At least 3 checklist items required'),
});

export type Facts = z.infer<typeof FactsSchema>;
export type BusinessPlan = z.infer<typeof BusinessPlanSchema>;
export type BankRecommendation = z.infer<typeof BankRecommendationSchema>;
export type AIResult = z.infer<typeof AIResultSchema>;
