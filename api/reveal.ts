/**
 * api/reveal.ts — Gated contact reveal (the real access check).
 *
 * POST { userId, adId } → decides eligibility and only then returns the phone:
 *   • subscription plan (starter/pro/business) → reveal (unlimited)
 *   • deal_fee plan  → reveal ONLY if a paid fee exists for this ad, else 402
 *   • free plan      → reveal if under the 3-deal limit (and consume one), else paywall
 *   • signed out     → { paywall: 'signup' }
 */

import { sbSelect, sbUpsert } from './_supabase';
import { dealFee, type AdRow } from './_match';

export const config = { runtime: 'edge' };

const FREE_LIMIT = 3;
const SUBSCRIPTION_PLANS = ['starter', 'pro', 'business'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...cors } });

interface ProfileRow { id: string; plan: string | null; deal_contacts_used: number | null }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  try {
    const { userId, adId } = await req.json();
    if (!userId) return json({ paywall: 'signup' });
    if (!adId)   return json({ error: 'adId required' }, 400);

    const [ad] = await sbSelect<AdRow>('ads', `id=eq.${adId}&limit=1`);
    if (!ad) return json({ error: 'ad not found' }, 404);

    const [profile] = await sbSelect<ProfileRow>('user_profiles', `id=eq.${userId}&limit=1`);
    const plan = profile?.plan ?? 'free';

    // Subscriptions: unlimited reveal.
    if (SUBSCRIPTION_PLANS.includes(plan)) {
      return json({ contact: ad.contact ?? '' });
    }

    // Pay-per-deal: only after the fee is paid for THIS ad.
    if (plan === 'deal_fee') {
      const paid = await sbSelect<{ id: string }>('deal_fees', `user_id=eq.${userId}&ad_id=eq.${adId}&limit=1`);
      if (paid.length) return json({ contact: ad.contact ?? '' });
      return json({ paywall: 'payfee', fee: dealFee(ad) });
    }

    // Free plan: 3 reveals, then paywall.
    const used = profile?.deal_contacts_used ?? 0;
    if (used >= FREE_LIMIT) return json({ paywall: 'subscribe' });
    await sbUpsert('user_profiles', {
      id: userId,
      deal_contacts_used: used + 1,
      updated_at: new Date().toISOString(),
    });
    return json({ contact: ad.contact ?? '', freeLeft: FREE_LIMIT - (used + 1) });
  } catch (err) {
    return json({ error: 'reveal error', detail: String(err) }, 500);
  }
}
