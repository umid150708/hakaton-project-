/**
 * auth.ts — Simple localStorage-based auth & plan management
 *
 * Plans:
 *   free      → 3 free deal contacts, then paywall
 *   starter   → 149,000 sum/month  | 1,490,000 sum/year
 *   pro       → 399,000 sum/month  | 3,590,000 sum/year
 *   business  → 899,000 sum/month  | 7,990,000 sum/year
 *   deal_fee  → 1.5% per closed deal (min 50k, max 5M sum)
 */

export type Plan = 'free' | 'starter' | 'pro' | 'business' | 'deal_fee';
export type BizType = 'savdo' | 'ishlab_chiqarish' | 'xizmat' | 'qishloq' | 'qurilish' | 'boshqa';

export interface UserProfile {
  name: string;
  phone: string;
  bizType: BizType;
  plan: Plan;
  dealContactsUsed: number;   // free contacts consumed
  joinedAt: string;
}

const KEY = 'biznesplan_user_v1';

export function getUser(): UserProfile | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); }
  catch { return null; }
}

export function saveUser(u: UserProfile): void {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function signUp(name: string, phone: string, bizType: BizType): UserProfile {
  const u: UserProfile = {
    name, phone, bizType,
    plan: 'free',
    dealContactsUsed: 0,
    joinedAt: new Date().toISOString(),
  };
  saveUser(u);
  return u;
}

export function useDealContact(): 'ok' | 'paywall' {
  const u = getUser();
  if (!u) return 'paywall';
  if (u.plan !== 'free') return 'ok';
  if (u.dealContactsUsed >= 3) return 'paywall';
  saveUser({ ...u, dealContactsUsed: u.dealContactsUsed + 1 });
  return 'ok';
}

export function upgradePlan(plan: Plan): void {
  const u = getUser();
  if (u) saveUser({ ...u, plan });
}

export const FREE_LIMIT = 3;

export const PLAN_NAMES: Record<Plan, string> = {
  free:      'Bepul',
  starter:   'Starter',
  pro:       'Pro',
  business:  'Biznes',
  deal_fee:  'Bitim foizi',
};

export const BIZ_TYPE_LABELS: Record<BizType, string> = {
  savdo:           'Savdo (do\'kon, ulgurji)',
  ishlab_chiqarish:'Ishlab chiqarish',
  xizmat:          'Xizmat ko\'rsatish',
  qishloq:         'Qishloq xo\'jaligi',
  qurilish:        'Qurilish',
  boshqa:          'Boshqa',
};
