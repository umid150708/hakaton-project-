/**
 * AIStrip.tsx — AI market analysis banner above the ads grid
 *
 * Caching strategy:
 *   - Responses cached in localStorage per (tab, category) for 1 hour
 *   - Cache hit = zero API calls, instant display
 *   - Manual ↻ bypasses cache and fetches fresh
 *   - 16 possible combos (2 tabs × 8 cats) = at most 16 API calls per hour total
 */

import { useState, useEffect, useRef } from 'react';
import type { Category } from '../lib/bozorData';
import { CATEGORIES } from '../lib/bozorData';

interface Props {
  tab: 'buy' | 'sell';
  cat: Category;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry { text: string; ts: number }

function cacheGet(tab: string, cat: string): string | null {
  try {
    const raw = localStorage.getItem(`ai_bozor_v1_${tab}_${cat}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null; // expired
    return entry.text;
  } catch { return null; }
}

function cacheSet(tab: string, cat: string, text: string) {
  try {
    const entry: CacheEntry = { text, ts: Date.now() };
    localStorage.setItem(`ai_bozor_v1_${tab}_${cat}`, JSON.stringify(entry));
  } catch { /* storage full — ignore */ }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIStrip({ tab, cat }: Props) {
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  const lastCombo = useRef('');
  const catLabel  = CATEGORIES.find(c => c.id === cat)?.label ?? 'umumiy bozor';

  useEffect(() => {
    let cancelled = false;

    const combo      = `${tab}-${cat}`;
    const isNewCombo = combo !== lastCombo.current;
    lastCombo.current = combo;

    // Use cache unless this is a manual refresh on the same combo
    const skipCache = !isNewCombo && forceRefresh > 0;

    if (!skipCache) {
      const cached = cacheGet(tab, cat);
      if (cached) {
        setText(cached);
        setLoading(false);
        setError(false);
        setFromCache(true);
        return;
      }
    }

    // Cache miss or forced refresh — hit the API
    setLoading(true);
    setError(false);
    setText('');
    setFromCache(false);

    const scope = cat === 'all'
      ? "O'zbekiston ulgurji bozori"
      : `"${catLabel}" kategoriyasi`;

    const prompt = tab === 'buy'
      ? `O'zbek tilida 3 jumlada: ${scope} bo'yicha xaridorlar uchun hozirgi narx holati. Qaysi tovarlar arzonlashmoqda yoki taqchil? Hozir sotib olish foydali? Aniq, ishbilarmon til bilan yoz.`
      : `O'zbek tilida 3 jumlada: ${scope} bo'yicha sotuvchilar uchun hozirgi narx holati. Qaysi tovarlar qimmatlashmoqda yoki talab oshmoqda? Hozir sotish foydali? Aniq, ishbilarmon til bilan yoz.`;

    fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(20_000),
    })
      .then(r => r.json())
      .then((data: { text?: string }) => {
        if (cancelled) return;
        const t = data?.text ?? '';
        if (t) {
          setText(t);
          cacheSet(tab, cat, t);
        } else {
          setError(true);
        }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tab, cat, forceRefresh]);

  return (
    <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 px-4 py-3 flex items-start gap-3">
      {/* Icon */}
      <span className="text-lg shrink-0 mt-0.5">🤖</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">
            AI Tahlil · {tab === 'buy' ? 'Xaridorlar' : 'Sotuvchilar'} · {catLabel}
          </p>
          {fromCache && !loading && (
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-full border border-slate-700">
              keshdan
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded-full animate-pulse w-full" />
            <div className="h-3 bg-slate-800 rounded-full animate-pulse w-[85%]" />
            <div className="h-3 bg-slate-800 rounded-full animate-pulse w-[60%]" />
          </div>
        ) : error ? (
          <p className="text-slate-500 text-sm">
            Tahlil yuklanmadi.{' '}
            <button
              onClick={() => setForceRefresh(n => n + 1)}
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Qayta urinish
            </button>
          </p>
        ) : (
          <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
        )}
      </div>

      {/* Refresh — bypasses cache */}
      {!loading && (
        <button
          onClick={() => setForceRefresh(n => n + 1)}
          title="Yangi tahlil olish"
          className="shrink-0 text-slate-700 hover:text-purple-400 text-base transition-colors mt-0.5"
        >
          ↻
        </button>
      )}
    </div>
  );
}
