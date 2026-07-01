/**
 * businessPlan.ts — Client access to the biznes-reja generator.
 */

import { getUser } from './auth';
import { profileSummary } from './profile';

export interface PlanSection { heading: string; body: string }
export interface BusinessPlan { title: string; sections: PlanSection[] }

export interface PlanAnswers {
  idea: string;
  investment: string;
  funding: string;
  market: string;
  goal: string;
  extra?: string;
}

export async function generatePlan(answers: PlanAnswers): Promise<BusinessPlan> {
  const res = await fetch('/api/business-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile: profileSummary(getUser()), answers }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new Error(`business-plan ${res.status}`);
  const data = await res.json() as { plan?: BusinessPlan; error?: string };
  if (!data.plan || !Array.isArray(data.plan.sections)) throw new Error(data.error ?? 'no plan');
  return data.plan;
}
