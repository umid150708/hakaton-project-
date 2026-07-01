/**
 * auth.ts — Supabase Auth (Google + email/password) + profile store.
 *
 * Identity is a Supabase auth user; the app's working profile (plan, business
 * type, learned context) lives in the RLS-protected `user_profiles` row keyed
 * by the auth user id. We keep an in-memory + localStorage mirror so the UI
 * can read the current user synchronously, and expose a subscribe()/useAuth()
 * store so components re-render on sign in/out.
 *
 * Mutations are mirror-first (instant UI) then persisted to the row async.
 */

import { useSyncExternalStore } from 'react';
import { supabase } from './supabaseClient';

export type Plan = 'free' | 'starter' | 'pro' | 'business' | 'deal_fee';
export type BizType = 'savdo' | 'ishlab_chiqarish' | 'xizmat' | 'qishloq' | 'qurilish' | 'boshqa';
export type RegType = 'yatt' | 'mchj' | 'boshqa';
export type Collateral = 'none' | 'real_estate' | 'vehicle' | 'both';
export type YearsInBiz = '<1' | '1-3' | '3-5' | '5+';

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  phone: string;
  bizType: BizType;
  plan: Plan;
  dealContactsUsed: number;
  joinedAt: string;

  // Structured context (powers tailored AI advice)
  disability?: 'I' | 'II' | 'III';
  location?: string;
  revenueBand?: '<500mln' | '500mln-1mlrd' | '>1mlrd';
  employees?: '0' | '1-5' | '5-20' | '20+';

  // Extended business profile
  businessName?: string;
  regType?: RegType;
  yearsInBiz?: YearsInBiz;
  collateral?: Collateral;
  bio?: string;
}

const KEY = 'biznesplan_user_v1';

// ── Reactive store ─────────────────────────────────────────────────────────────

function readCache(): UserProfile | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null'); }
  catch { return null; }
}

let _current: UserProfile | null = readCache();
const listeners = new Set<() => void>();

function setMirror(u: UserProfile | null): void {
  _current = u;
  if (u) localStorage.setItem(KEY, JSON.stringify(u));
  else   localStorage.removeItem(KEY);
  listeners.forEach(l => l());
}

export function getUser(): UserProfile | null { return _current; }
export function saveUser(u: UserProfile): void { setMirror(u); }

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** React hook: current user, re-renders on auth changes. */
export function useAuth(): UserProfile | null {
  return useSyncExternalStore(subscribe, getUser, getUser);
}

// ── Auth actions ───────────────────────────────────────────────────────────────

export async function signUpEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  setMirror(null);
}

// ── Profile row <-> mirror ───────────────────────────────────────────────────────

interface Row {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  biz_type: string | null;
  disability: string | null;
  location: string | null;
  revenue_band: string | null;
  employees: string | null;
  plan: string | null;
  deal_contacts_used: number | null;
  business_name: string | null;
  reg_type: string | null;
  years_in_biz: string | null;
  collateral: string | null;
  bio: string | null;
}

function rowToProfile(r: Row): UserProfile {
  return {
    id:               r.id,
    email:            r.email ?? undefined,
    name:             r.name ?? '',
    phone:            r.phone ?? '',
    bizType:          (r.biz_type as BizType) ?? 'savdo',
    plan:             (r.plan as Plan) ?? 'free',
    dealContactsUsed: r.deal_contacts_used ?? 0,
    joinedAt:         '',
    disability:       (r.disability as UserProfile['disability']) ?? undefined,
    location:         r.location ?? undefined,
    revenueBand:      (r.revenue_band as UserProfile['revenueBand']) ?? undefined,
    employees:        (r.employees as UserProfile['employees']) ?? undefined,
    businessName:     r.business_name ?? undefined,
    regType:          (r.reg_type as RegType) ?? undefined,
    yearsInBiz:       (r.years_in_biz as YearsInBiz) ?? undefined,
    collateral:       (r.collateral as Collateral) ?? undefined,
    bio:              r.bio ?? undefined,
  };
}

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
}

/** Fetch the signed-in user's profile row, creating a default one if missing. */
async function ensureProfile(user: AuthUser): Promise<void> {
  const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
  let row = data as Row | null;
  if (!row) {
    const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
    const { data: created } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, email: user.email ?? null, name, plan: 'free', deal_contacts_used: 0 })
      .select('*')
      .single();
    row = created as Row;
  }
  if (row) setMirror(rowToProfile(row));
}

let _inited = false;
/** Wire Supabase session → mirror. Call once at app startup. */
export function initAuth(): void {
  if (_inited) return;
  _inited = true;
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) ensureProfile(data.session.user as AuthUser);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) ensureProfile(session.user as AuthUser);
    else setMirror(null);
  });
}

// ── Mutations (mirror-first, async row persist) ──────────────────────────────────

function patchRow(patch: Record<string, unknown>): void {
  const id = _current?.id;
  if (!id) return;
  void supabase.from('user_profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
}

/** Merge fields into the profile (learned context, business info). Persists to the row. */
export function updateProfile(patch: Partial<UserProfile>): UserProfile | null {
  if (!_current) return null;
  const next = { ..._current, ...patch };
  setMirror(next);

  const rowPatch: Record<string, unknown> = {};
  if ('name'         in patch) rowPatch.name          = patch.name;
  if ('phone'        in patch) rowPatch.phone         = patch.phone;
  if ('bizType'      in patch) rowPatch.biz_type      = patch.bizType;
  if ('disability'   in patch) rowPatch.disability    = patch.disability ?? null;
  if ('location'     in patch) rowPatch.location      = patch.location ?? null;
  if ('revenueBand'  in patch) rowPatch.revenue_band  = patch.revenueBand ?? null;
  if ('employees'    in patch) rowPatch.employees     = patch.employees ?? null;
  if ('businessName' in patch) rowPatch.business_name = patch.businessName ?? null;
  if ('regType'      in patch) rowPatch.reg_type      = patch.regType ?? null;
  if ('yearsInBiz'   in patch) rowPatch.years_in_biz  = patch.yearsInBiz ?? null;
  if ('collateral'   in patch) rowPatch.collateral    = patch.collateral ?? null;
  if ('bio'          in patch) rowPatch.bio           = patch.bio ?? null;
  if (Object.keys(rowPatch).length) patchRow(rowPatch);

  return next;
}

export function useDealContact(): 'ok' | 'paywall' {
  const u = _current;
  if (!u) return 'paywall';
  if (u.plan !== 'free') return 'ok';
  if (u.dealContactsUsed >= FREE_LIMIT) return 'paywall';
  const next = { ...u, dealContactsUsed: u.dealContactsUsed + 1 };
  setMirror(next);
  patchRow({ deal_contacts_used: next.dealContactsUsed });
  return 'ok';
}

export function upgradePlan(plan: Plan): void {
  if (!_current) return;
  setMirror({ ..._current, plan });
  patchRow({ plan });
}

// ── Constants ────────────────────────────────────────────────────────────────

export const FREE_LIMIT = 3;

export const PLAN_NAMES: Record<Plan, string> = {
  free:      'Bepul',
  starter:   'Starter',
  pro:       'Pro',
  business:  'Biznes',
  deal_fee:  'Bitim foizi',
};

export const BIZ_TYPE_LABELS: Record<BizType, string> = {
  savdo:            "Savdo (do'kon, ulgurji)",
  ishlab_chiqarish: 'Ishlab chiqarish',
  xizmat:           "Xizmat ko'rsatish",
  qishloq:          "Qishloq xo'jaligi",
  qurilish:         'Qurilish',
  boshqa:           'Boshqa',
};

export const REG_TYPE_LABELS: Record<RegType, string> = {
  yatt:   'YaTT (Yakka tartibli tadbirkor)',
  mchj:   'MChJ (Mas\'uliyati cheklangan jamiyat)',
  boshqa: 'Boshqa shakl',
};

export const COLLATERAL_LABELS: Record<Collateral, string> = {
  none:        "Yo'q",
  real_estate: "Ko'chmas mulk",
  vehicle:     'Avtomobil',
  both:        'Ikkalasi ham',
};
