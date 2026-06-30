/**
 * TaxCalculator — soliq hisob-kitobi section on the Result page.
 * Shows recommended tax regime, monthly obligation, and after-tax income.
 */

import type { TaxResult } from '../lib/taxCalc';

interface Props {
  tax: TaxResult;
  monthly_revenue_uzs: number;
}

function fmt(uzs: number): string {
  if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(1)} mln so'm`;
  return `${(uzs / 1_000).toFixed(0)} ming so'm`;
}

export default function TaxCalculator({ tax, monthly_revenue_uzs }: Props) {
  const regimeColor = tax.regime === 'patent' ? '#10b981' : '#3b82f6';

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧾</span>
          <div>
            <h2 className="text-white font-semibold text-sm">Soliq hisob-kitobi</h2>
            <p className="text-slate-500 text-xs mt-0.5">O'zbekiston KOK soliq tizimi · 2024</p>
          </div>
        </div>
        {/* Regime badge */}
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{ color: regimeColor, backgroundColor: regimeColor + '20', border: `1px solid ${regimeColor}40` }}
        >
          {tax.regime_label}
        </span>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
        <div className="px-4 py-4 text-center">
          <p className="text-slate-500 text-xs mb-1">Oylik soliq</p>
          <p className="text-red-400 font-bold text-lg leading-none">{fmt(tax.monthly_tax_uzs)}</p>
          <p className="text-slate-600 text-xs mt-1">{tax.effective_rate_pct.toFixed(1)}% daromaddan</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-slate-500 text-xs mb-1">Yillik soliq</p>
          <p className="text-amber-400 font-bold text-lg leading-none">{fmt(tax.annual_tax_uzs)}</p>
          <p className="text-slate-600 text-xs mt-1">yiliga to'lanadi</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-slate-500 text-xs mb-1">Soliqdan keyin</p>
          <p className="text-emerald-400 font-bold text-lg leading-none">{fmt(tax.after_tax_monthly_uzs)}</p>
          <p className="text-slate-600 text-xs mt-1">oyiga qoladi</p>
        </div>
      </div>

      {/* Visual bar: revenue split */}
      {monthly_revenue_uzs > 0 && (
        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-slate-500 text-xs mb-3">Oylik daromadning taqsimoti</p>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
            {/* Tax portion */}
            <div
              className="h-full bg-red-500/70 transition-all duration-700"
              style={{ width: `${Math.min(tax.effective_rate_pct, 100)}%` }}
            />
            {/* After-tax portion */}
            <div
              className="h-full bg-emerald-500/50 flex-1"
            />
          </div>
          <div className="flex justify-between text-xs mt-1.5">
            <span className="text-red-400">Soliq: {fmt(tax.monthly_tax_uzs)}</span>
            <span className="text-emerald-400">Qolgan: {fmt(tax.after_tax_monthly_uzs)}</span>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="px-5 py-4 border-b border-slate-800 space-y-3">
        <p className="text-slate-500 text-xs uppercase tracking-wider">Tarkib</p>
        {tax.breakdown.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.note}</p>
            </div>
            <span className="text-slate-300 text-sm font-mono shrink-0">
              {fmt(item.monthly_uzs)}<span className="text-slate-600 font-normal">/oy</span>
            </span>
          </div>
        ))}
      </div>

      {/* VAT warning */}
      {tax.vat_applicable && (
        <div className="mx-5 my-4 p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl">
          <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ QQS (VAT) majburiy</p>
          <p className="text-amber-300/80 text-xs leading-relaxed">
            Yillik daromadingiz 1 mlrd so'mdan oshganligi uchun QQS (12%) to'lash shart.
            Buxgalter yoki soliq maslahatchisiga murojaat qiling.
          </p>
        </div>
      )}

      {/* Recommendation */}
      <div className="px-5 pb-4 space-y-3">
        <div className="p-3 bg-slate-800/60 rounded-xl">
          <p className="text-slate-400 text-xs leading-relaxed">
            💡 <strong className="text-white">Tavsiya:</strong> {tax.recommendation}
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-slate-700 text-xs leading-relaxed">
          ⚠ {tax.disclaimer}
        </p>
      </div>
    </section>
  );
}
