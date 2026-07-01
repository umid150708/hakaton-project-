/**
 * notifications.ts — Client access to match notifications + a polling hook.
 */

import { useEffect, useState, useCallback } from 'react';
import { getUser } from './auth';

export interface Notification {
  id: string;
  kind: string;
  ad_id: string | null;
  my_ad_id: string | null;
  score: number | null;
  title: string | null;
  body: string | null;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<{ notifications: Notification[]; unread: number }> {
  const userId = getUser()?.id;
  if (!userId) return { notifications: [], unread: 0 };
  const res = await fetch(`/api/notifications?userId=${userId}`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`notifications ${res.status}`);
  return res.json() as Promise<{ notifications: Notification[]; unread: number }>;
}

export async function markRead(id?: string): Promise<void> {
  const userId = getUser()?.id;
  if (!userId) return;
  await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, id }),
  });
}

/** Poll the user's notifications every 45s (and on mount). Fails silently. */
export function useNotifications() {
  const [items, setItems]   = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const userId = getUser()?.id;

  const refresh = useCallback(async () => {
    try {
      const { notifications, unread } = await fetchNotifications();
      setItems(notifications);
      setUnread(unread);
    } catch { /* backend not ready — stay silent */ }
  }, []);

  useEffect(() => {
    if (!userId) { setItems([]); setUnread(0); return; }
    refresh();
    const t = setInterval(refresh, 45_000);
    return () => clearInterval(t);
  }, [userId, refresh]);

  return { items, unread, refresh, setItems, setUnread };
}
