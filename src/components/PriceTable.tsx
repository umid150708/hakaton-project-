/**
 * PriceTable — "Joriy Bozor Narxlari" section on the Result page.
 *
 * Shows real market prices fetched from OLX.uz (or offline fallback),
 * visualises the min/avg/max range for each product, and embeds the
 * revenue-check verdict so the user knows if their stated income is realistic.
 */

import { useState } from 'react';
import type { RevenueCheckResult } from '../lib/revenueCheck';
import type { CategoryInfo } from '../lib/categoryMap';

// ─── Shared price row shape ───────────────────────────────────────────────────
// Accepts both PriceResult (from api/prices.ts) and FallbackPriceResult.

export interface PriceRow {
  query: string;
  avg: number;
  min: number;
  max: number;
  median: number;
  count: number;
  listings: { title: string; price: number; city: string }[];
  source: 'olx' | 'fallback';
  fetchedAt: string;
  unit?: string;   // present in FallbackPriceResult, optional
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUZS(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mlrd`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} mln`;
  return n.toLocaleString('ru') + " so'm";
}

function fmtUZSFull(n: number): string {
  return n.toLocaleString('ru') + " so'm";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Visual min/avg/max range bar */
function PriceRangeBar({ min, avg, max }: { min: number; avg: number; max: number }) {
  const span = max - min;
  if (span <= 0) return null;

  const avgPct = Math.round(((avg - min) / span) * 100);

  return (
    <div className="mt-2 mb-1">
      <div className="relative h-1.5 bg-slate-700 rounded-full">
        {/* avg marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-md z-10"
          style={{ left: `calc(${avgPct}% - 6px)` }}
        />
        {/* filled track up to avg */}
        <div
          className="absolute left-0 top-0 h-full bg-emerald-600/40 rounded-l-full"
          style={{ width: `${avgPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1.5">
        <span>{fmtUZS(min)}</span>
        <span className="text-emerald-400 font-medium">{fmtUZS(avg)} o'rta</span>
        <span>{fmtUZS(max)}</span>
      </div>
    </div>
  );
}

/** Single price query card */
function PriceCard({ row }: { row: PriceRow }) {
  const [showListings, setShowListings] = useState(false);

  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 text-sm font-medium capitalize truncate">
            {row.query}
          </p>
          {row.unit && (
            <p className="text-slate-500 text-xs mt-0.5">1 {row.unit}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-emerald-400 text-lg font-bold leading-none">
            {fmtUZS(row.avg)}
          </p>
          <p className="text-slate-500 text-xs mt-0.5">{row.count} e'lon</p>
        </div>
      </div>

      <PriceRangeBar min={row.min} avg={row.avg} max={row.max} />

      {/* Sample listings toggle */}
      {row.listings.length > 0 && (
        <button
          onClick={() => setShowListings(s => !s)}
          className="mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          <span>{showListings ? '▲' : '▼'}</span>
          <span>{showListings ? "Yashirish" : `${row.listings.length} ta e'lonni ko'rish`}</span>
        </button>
      )}

      {showListings && (
        <div className="mt-2 space-y-1.5">
          {row.listings.map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
              <span className="text-slate-300 text-xs truncate flex-1">{l.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 text-xs">{l.city}</span>
                <span className="text-white text-xs font-medium">{fmtUZSFull(l.price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Revenue check verdict card */
function RevenueVerdictCard({ result }: { result: RevenueCheckResult }) {
  const config = {
    ok:           { color: '#10b981', bg: '#10b98115', icon: '✓', label: 'Realistik' },
    ok_high:      { color: '#f59e0b', bg: '#f59e0b15', icon: '⚠', label: 'Biroz yuqori' },
    too_low:      { color: '#f59e0b', bg: '#f59e0b15', icon: '⚠', label: 'Juda past' },
    too_high:     { color: '#ef4444', bg: '#ef444415', icon: '✕', label: 'Juda yuqori' },
    unverifiable: { color: '#64748b', bg: '#64748b15', icon: '—', label: 'Solishtirilmadi' },
  }[result.status];

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: config.bg, borderColor: config.color + '30' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: config.color + '20', color: config.color }}
        >
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-white text-sm font-semibold">Daromad tekshiruvi</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: config.color + '25', color: config.color }}
            >
              {config.label}
            </span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed mb-2">
            {result.message}
          </p>

          {/* Min/Max reference */}
          {result.estimated_min_uzs > 0 && (
            <div className="flex gap-4 mb-2">
              <div>
                <p className="text-slate-500 text-xs">Taxminiy min</p>
                <p className="text-slate-200 text-xs font-medium">{fmtUZS(result.estimated_min_uzs)}/oy</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Taxminiy max</p>
                <p className="text-slate-200 text-xs font-medium">{fmtUZS(result.estimated_max_uzs)}/oy</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Nisbat</p>
                <p className="text-xs font-medium" style={{ color: config.color }}>
                  {result.ratio.toFixed(1)}×
                </p>
              </div>
            </div>
          )}

          {/* Tip */}
          <p className="text-xs leading-relaxed" style={{ color: config.color + 'cc' }}>
            → {result.tip}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PriceTableProps {
  prices: Record<string, PriceRow>;
  revenueCheck: RevenueCheckResult;
  category: CategoryInfo;
  className?: string;
}

export default function PriceTable({
  prices,
  revenueCheck,
  category,
  className = '',
}: PriceTableProps) {
  const rows = Object.values(prices);
  const hasLiveData = rows.some(r => r.source === 'olx');
  const hasAnyData  = rows.length > 0;

  // For service businesses or no data: show only revenue check
  const showPrices = hasAnyData && category.isProductBusiness;

  // Source badge
  const sourceBadge = hasLiveData
    ? { text: 'OLX Live', color: '#10b981', dot: true }
    : { text: 'Offline ma\'lumot', color: '#f59e0b', dot: false };

  return (
    <section className={`bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden ${className}`}>

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <h2 className="text-white font-semibold text-sm">Joriy Bozor Narxlari</h2>
            <p className="text-slate-500 text-xs mt-0.5">{category.category}</p>
          </div>
        </div>

        {hasAnyData && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
            style={{
              color: sourceBadge.color,
              backgroundColor: sourceBadge.color + '15',
              borderColor: sourceBadge.color + '35',
            }}
          >
            {sourceBadge.dot && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: sourceBadge.color }}
              />
            )}
            {sourceBadge.text}
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">

        {/* Price cards */}
        {showPrices && (
          <div className="space-y-3">
            {rows.map(row => (
              <PriceCard key={row.query} row={row} />
            ))}
          </div>
        )}

        {/* Service business — no product prices */}
        {!showPrices && category.isProductBusiness === false && (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">
              Xizmat biznesi — mahsulot narxlari mavjud emas.
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Daromad bozor narxlarisiz baholandi.
            </p>
          </div>
        )}

        {/* Revenue check — always shown */}
        <RevenueVerdictCard result={revenueCheck} />

        {/* Data timestamp */}
        {hasAnyData && rows[0]?.fetchedAt && (
          <p className="text-slate-700 text-xs text-right">
            Ma'lumot: {rows[0].fetchedAt}
          </p>
        )}

      </div>
    </section>
  );
}
