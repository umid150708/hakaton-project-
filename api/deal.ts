/**
 * api/deal.ts — Record a (mock) platform fee payment for a deal.
 *
 * POST { userId, adId } → computes the fee from the ad, records a deal_fees row,
 * and returns { ok, amount }. After this, /api/reveal will hand over the phone.
 *
 * The payment itself is simulated on the client (a to'lov screen that always
 * succeeds); swapping in Payme/Click later means verifying the payment here
 * before writing the deal_fees row.
 */

import { sbSelect, sbUpsert } from './_supabase';
import { dealFee, type AdRow } from './_match';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json', ...cors } });

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405);

  try {
    const { userId, adId } = await req.json();
    if (!userId || !adId) return json({ error: 'userId and adId required' }, 400);

    const [ad] = await sbSelect<AdRow>('ads', `id=eq.${adId}&limit=1`);
    if (!ad) return json({ error: 'ad not found' }, 404);

    const amount = dealFee(ad.price_value, ad.quantity_value);
    await sbUpsert('deal_fees', { user_id: userId, ad_id: adId, amount, method: 'mock' });

    return json({ ok: true, amount });
  } catch (err) {
    return json({ error: 'deal error', detail: String(err) }, 500);
  }
}
