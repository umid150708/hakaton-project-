/**
 * PriceTicker.tsx — Top-of-site scrolling strip of AVERAGE market prices.
 *
 * Shows the daily market snapshot (generated server-side, refreshed by a
 * cron job). These are *average wholesale prices* for the whole market —
 * deliberately styled differently from seller/buyer ad prices so the two
 * are never confused.
 *
 * Data: GET /api/market-prices (latest snapshot), cached 1h in localStorage.
 */

import { useEffect, useState } from 'react';

interface PriceEntry {
  key: string;
  name: string;
  unit: string;
  emoji: string;
  uzPrice: number;
  changePct: number;
  trend: 'up' | 'down' | 'flat';
  note: string;
}

interface Snapshot {
  date: string | null;
  data: PriceEntry[];
  analysis: string;
}

const CACHE_KEY = 'market_ticker_v1';
const TTL_MS = 60 * 60 * 1000; // 1 hour

function readCache(): Snapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, snap } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null;
    return snap;
  } catch { return null; }
}

function writeCache(snap: Snapshot) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), snap })); } catch { /* ignore */ }
}

function fmt(n: number): string {
  return n.toLocaleString('ru-RU').replace(/,/g, ' ');
}

function TickerItem({ p }: { p: PriceEntry }) {
  const color = p.trend === 'up' ? 'text-emerald-400' : p.trend === 'down' ? 'text-rose-400' : 'text-zinc-500';
  const arrow = p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '■';
  return (
    <span className="inline-flex items-center gap-2 px-5 border-r border-zinc-800/60">
      <span className="text-sm">{p.emoji}</span>
      <span className="text-zinc-300 text-xs font-medium">{p.name}</span>
      <span className="text-white text-xs font-bold tabular-nums">{fmt(p.uzPrice)} so'm/{p.unit}</span>
      <span className={`text-[11px] font-bold tabular-nums ${color}`}>
        {arrow} {p.changePct > 0 ? '+' : ''}{p.changePct}%
      </span>
    </span>
  );
}

export default function PriceTicker() {
  const [snap, setSnap] = useState<Snapshot | null>(readCache);

  useEffect(() => {
    if (snap) return; // have fresh cache
    let alive = true;
    fetch('/api/market-prices')
      .then(r => r.json())
      .then((s: Snapshot) => {
        if (!alive || !s?.data?.length) return;
        setSnap(s);
        writeCache(s);
      })
      .catch(() => { /* silent — ticker just hides if unavailable */ });
    return () => { alive = false; };
  }, [snap]);

  if (!snap || !snap.data.length) return null;

  // Duplicate the list so the -50% marquee loops seamlessly
  const items = [...snap.data, ...snap.data];

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden flex items-stretch">
      {/* Fixed label — makes clear these are AVERAGES, not ads */}
      <div className="shrink-0 flex items-center gap-1.5 px-4 bg-zinc-900 border-r border-zinc-800 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
          O'rtacha bozor narxlari
        </span>
      </div>

      {/* Scrolling track */}
      <div className="overflow-hidden flex-1 flex items-center py-2">
        <div className="ticker-track">
          {items.map((p, i) => <TickerItem key={`${p.key}-${i}`} p={p} />)}
        </div>
      </div>
    </div>
  );
}
