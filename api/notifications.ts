/**
 * api/notifications.ts — Per-user match notifications.
 *
 *   GET  /api/notifications?userId=…            → newest 50 for the user
 *   POST /api/notifications { userId, id? }     → mark one (id) or all as read
 */

import { sbSelect, sbUpsert } from './_supabase';
import { json, preflight, methodNotAllowed } from './_http';

export const config = { runtime: 'edge' };

interface NotifRow {
  id: string; user_id: string; kind: string; ad_id: string | null; my_ad_id: string | null;
  score: number | null; title: string | null; body: string | null; read: boolean; created_at: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return preflight();

  try {
    if (req.method === 'GET') {
      const userId = new URL(req.url).searchParams.get('userId');
      if (!userId) return json({ notifications: [], unread: 0 });
      const rows = await sbSelect<NotifRow>('notifications',
        `user_id=eq.${userId}&order=created_at.desc&limit=50`);
      return json({ notifications: rows, unread: rows.filter(r => !r.read).length });
    }

    if (req.method === 'POST') {
      const { userId, id } = await req.json();
      if (!userId) return json({ error: 'userId required' }, 400);
      if (id) {
        await sbUpsert('notifications', { id, read: true });
      } else {
        // Mark all unread as read.
        const unread = await sbSelect<{ id: string }>('notifications', `user_id=eq.${userId}&read=eq.false`);
        for (const n of unread) await sbUpsert('notifications', { id: n.id, read: true });
      }
      return json({ ok: true });
    }

    return methodNotAllowed();
  } catch (err) {
    return json({ error: 'notifications error', detail: String(err) }, 500);
  }
}
