/**
 * api/profile.ts — Per-user context store (cross-device persistence)
 *
 *   GET  /api/profile?phone=...  → returns the user's stored profile row
 *   POST /api/profile { phone, ... } → upserts the profile by phone
 *
 * Writes use the server-only service key (RLS-bypassing), so the browser
 * never holds write credentials. Note: identity here is the phone from
 * signup — adequate for this app's lightweight auth model.
 */

import { sbSelect, sbUpsert } from './_supabase';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface ProfileRow {
  phone: string;
  name?: string;
  biz_type?: string;
  disability?: string | null;
  location?: string | null;
  revenue_band?: string | null;
  employees?: string | null;
  updated_at?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  // ── Read ──
  if (req.method === 'GET') {
    const phone = new URL(req.url).searchParams.get('phone');
    if (!phone) return new Response(JSON.stringify({ error: 'phone required' }), { status: 400, headers: cors });
    try {
      const rows = await sbSelect<ProfileRow>('user_profiles', `phone=eq.${encodeURIComponent(phone)}&limit=1`);
      return new Response(JSON.stringify(rows[0] ?? null), {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (e) {
      console.error('profile GET failed:', String(e));
      return new Response(JSON.stringify(null), { status: 200, headers: { 'Content-Type': 'application/json', ...cors } });
    }
  }

  // ── Write ──
  if (req.method === 'POST') {
    let body: ProfileRow;
    try {
      body = await req.json();
      if (!body.phone) throw new Error('phone required');
    } catch {
      return new Response(JSON.stringify({ error: 'phone required' }), { status: 400, headers: cors });
    }
    try {
      const row = await sbUpsert<ProfileRow>('user_profiles', { ...body, updated_at: new Date().toISOString() });
      return new Response(JSON.stringify({ ok: true, row }), {
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (e) {
      console.error('profile POST failed:', String(e));
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: cors });
}
