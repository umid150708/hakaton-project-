/**
 * NotificationBell.tsx — bell + dropdown of match notifications.
 *
 * Personalized-marketplace payoff: when someone posts an ad that matches one of
 * yours ≥85%, it shows up here ("Bu bitim sizni qiziqtiradimi?"). Hidden when
 * signed out or when the backend has no notifications table yet.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell } from '@tabler/icons-react';
import { useAuth } from '../lib/auth';
import { useNotifications, markRead } from '../lib/notifications';

export default function NotificationBell() {
  const user     = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { items, unread, refresh, setItems, setUnread } = useNotifications();

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  if (!user) return null;

  const openItem = (adId: string | null) => {
    setOpen(false);
    navigate(adId ? `/bozor?ad=${adId}` : '/bozor');
  };

  const readAll = async () => {
    setItems(items.map(i => ({ ...i, read: true })));
    setUnread(0);
    await markRead();
    refresh();
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button onClick={() => setOpen(o => !o)} title="Bildirishnomalar"
        className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 transition-colors">
        <IconBell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-emerald-950 text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-white text-sm font-semibold">Mos bitimlar</span>
            {unread > 0 && (
              <button onClick={readAll} className="text-emerald-400 hover:text-emerald-300 text-xs">Hammasini o'qildi</button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-zinc-400 text-sm">Hozircha mos bitim yo'q</p>
                <p className="text-zinc-600 text-xs mt-1">E'lon joylang — mos takliflar shu yerda chiqadi</p>
              </div>
            ) : (
              items.map(n => (
                <button key={n.id} onClick={() => openItem(n.ad_id)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800/60 hover:bg-zinc-800/50 transition-colors ${n.read ? '' : 'bg-emerald-950/10'}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium leading-snug">{n.title ?? 'Mos bitim'}</p>
                      {n.body && <p className="text-zinc-400 text-xs mt-0.5 leading-snug">{n.body}</p>}
                      <p className="text-emerald-400 text-xs mt-1">Ko'rish →</p>
                    </div>
                    {n.score != null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold shrink-0">{n.score}%</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
