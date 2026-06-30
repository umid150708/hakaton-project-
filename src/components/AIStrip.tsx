/**
 * AIStrip.tsx — AI market analysis banner above the ads grid
 *
 * Auto-loads on mount and whenever tab or category changes.
 * No expand/collapse — analysis is always visible.
 */

import { useState, useEffect } from 'react';
import type { Category } from '../lib/bozorData';
import { CATEGORIES } from '../lib/bozorData';

interface Props {
  tab: 'buy' | 'sell';
  cat: Category;
}

export default function AIStrip({ tab, cat }: Props) {
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [tick, setTick]       = useState(0); // bump to refresh

  const catLabel = CATEGORIES.find(c => c.id === cat)?.label ?? 'umumiy bozor';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setText('');

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
      .then(data => {
        if (!cancelled) {
          const t = data?.text ?? '';
          if (t) setText(t);
          else setError(true);
        }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tab, cat, tick]);

  return (
    <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 px-4 py-3 flex items-start gap-3">
      {/* Icon */}
      <span className="text-lg shrink-0 mt-0.5">🤖</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide mb-2">
          AI Tahlil · {tab === 'buy' ? 'Xaridorlar' : 'Sotuvchilar'} · {catLabel}
        </p>

        {loading ? (
          /* Skeleton */
          <div className="space-y-2">
            <div className="h-3 bg-slate-800 rounded-full animate-pulse w-full" />
            <div className="h-3 bg-slate-800 rounded-full animate-pulse w-[85%]" />
            <div className="h-3 bg-slate-800 rounded-full animate-pulse w-[65%]" />
          </div>
        ) : error ? (
          <p className="text-slate-500 text-sm">
            Tahlil yuklanmadi.{' '}
            <button
              onClick={() => setTick(t => t + 1)}
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Qayta urinish
            </button>
          </p>
        ) : (
          <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
        )}
      </div>

      {/* Refresh button — only when content is loaded */}
      {!loading && (
        <button
          onClick={() => setTick(t => t + 1)}
          title="Yangilash"
          className="shrink-0 text-slate-700 hover:text-purple-400 text-base transition-colors mt-0.5"
        >
          ↻
        </button>
      )}
    </div>
  );
}
