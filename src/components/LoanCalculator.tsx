/**
 * LoanCalculator — kredit kalkulyatori section.
 * Standard amortization: PMT = P × r(1+r)^n / ((1+r)^n − 1)
 * Shows monthly payment, total interest, and affordability at 3 bank rates.
 */

import { useState } from 'react';

interface Props {
  loan_amount_uzs: number;
  loan_term_months: number;
  monthly_revenue_uzs: number;
}

interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

const RATES = [
  { label: '18%', annual: 0.18, color: '#10b981', desc: 'Davlat banklari (eng qulay)' },
  { label: '22%', annual: 0.22, color: '#3b82f6', desc: "Tijorat banklari o'rtacha" },
  { label: '26%', annual: 0.26, color: '#f59e0b', desc: 'Mikrokreditlar, MFI' },
];

function calcPMT(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12;
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function buildAmortization(principal: number, annualRate: number, months: number): AmortRow[] {
  const r = annualRate / 12;
  const pmt = calcPMT(principal, annualRate, months);
  const rows: AmortRow[] = [];
  let balance = principal;
  for (let i = 1; i <= months; i++) {
    const interest = balance * r;
    const principalPart = pmt - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({ month: i, payment: pmt, principal: principalPart, interest, balance });
  }
  return rows;
}

function fmt(uzs: number): string {
  if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(1)} mln`;
  if (uzs >= 1_000) return `${(uzs / 1_000).toFixed(0)} ming`;
  return uzs.toFixed(0);
}

function fmtFull(uzs: number): string {
  if (uzs >= 1_000_000) return `${(uzs / 1_000_000).toFixed(2)} mln so'm`;
  return `${(uzs / 1_000).toFixed(0)} ming so'm`;
}

export default function LoanCalculator({ loan_amount_uzs, loan_term_months, monthly_revenue_uzs }: Props) {
  const [selectedRate, setSelectedRate] = useState(0); // index into RATES
  const [showSchedule, setShowSchedule] = useState(false);

  if (loan_amount_uzs <= 0 || loan_term_months <= 0) return null;

  const rate = RATES[selectedRate];
  const pmt = calcPMT(loan_amount_uzs, rate.annual, loan_term_months);
  const totalPaid = pmt * loan_term_months;
  const totalInterest = totalPaid - loan_amount_uzs;
  const dtiPct = monthly_revenue_uzs > 0 ? (pmt / monthly_revenue_uzs) * 100 : null;
  const affordable = dtiPct !== null && dtiPct <= 40;
  const schedule = showSchedule ? buildAmortization(loan_amount_uzs, rate.annual, loan_term_months) : [];

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <span className="text-lg">🏦</span>
        <div>
          <h2 className="text-white font-semibold text-sm">Kredit kalkulyatori</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {fmt(loan_amount_uzs)} so'm · {loan_term_months} oy
          </p>
        </div>
      </div>

      {/* Rate selector */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-slate-500 text-xs mb-3">Foiz stavkasini tanlang</p>
        <div className="grid grid-cols-3 gap-2">
          {RATES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setSelectedRate(i)}
              className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                selectedRate === i
                  ? 'border-transparent'
                  : 'border-slate-700 text-slate-500 bg-slate-800/40 hover:border-slate-600'
              }`}
              style={
                selectedRate === i
                  ? { backgroundColor: r.color + '20', color: r.color, borderColor: r.color + '60' }
                  : {}
              }
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-2 text-center">{rate.desc}</p>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-b border-slate-800">
        <div className="px-4 py-4 text-center">
          <p className="text-slate-500 text-xs mb-1">Oylik to'lov</p>
          <p className="font-bold text-xl leading-none" style={{ color: rate.color }}>{fmt(pmt)}</p>
          <p className="text-slate-600 text-xs mt-1">so'm/oy</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-slate-500 text-xs mb-1">Jami foizlar</p>
          <p className="text-amber-400 font-bold text-xl leading-none">{fmt(totalInterest)}</p>
          <p className="text-slate-600 text-xs mt-1">so'm qo'shimcha</p>
        </div>
        <div className="px-4 py-4 text-center">
          <p className="text-slate-500 text-xs mb-1">Jami to'lov</p>
          <p className="text-slate-300 font-bold text-xl leading-none">{fmt(totalPaid)}</p>
          <p className="text-slate-600 text-xs mt-1">so'm {loan_term_months} oyda</p>
        </div>
      </div>

      {/* Affordability verdict */}
      {dtiPct !== null && (
        <div className={`mx-5 my-4 p-3 rounded-xl border ${
          affordable
            ? 'bg-emerald-950/40 border-emerald-800/50'
            : 'bg-red-950/40 border-red-800/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className={`text-xs font-semibold ${affordable ? 'text-emerald-400' : 'text-red-400'}`}>
              {affordable ? '✓ Daromadingizga mos' : '✗ Daromadingiz yetarli emas'}
            </p>
            <span className={`text-xs font-mono ${affordable ? 'text-emerald-300' : 'text-red-300'}`}>
              DTI: {dtiPct.toFixed(0)}%
            </span>
          </div>
          {/* DTI bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(dtiPct, 100)}%`,
                backgroundColor: dtiPct <= 30 ? '#10b981' : dtiPct <= 40 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <p className={`text-xs mt-1.5 leading-relaxed ${affordable ? 'text-emerald-300/70' : 'text-red-300/70'}`}>
            {affordable
              ? `Oylik to'lov (${fmtFull(pmt)}) daromadingizning ${dtiPct.toFixed(0)}% — banklar 40% dan pastini afzal ko'radi.`
              : `Oylik to'lov (${fmtFull(pmt)}) daromadingizning ${dtiPct.toFixed(0)}%. Bank kredit rad etishi mumkin — miqdorni kamaytiring yoki muddatni uzaytiring.`
            }
          </p>
        </div>
      )}

      {/* Compare all rates */}
      <div className="px-5 pb-4">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Barcha stavkalar taqqoslamasi</p>
        <div className="space-y-2">
          {RATES.map((r, i) => {
            const m = calcPMT(loan_amount_uzs, r.annual, loan_term_months);
            const tot = m * loan_term_months;
            const interest = tot - loan_amount_uzs;
            const isSelected = i === selectedRate;
            return (
              <div
                key={r.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-slate-800' : 'bg-slate-900 hover:bg-slate-800/60'
                }`}
                onClick={() => setSelectedRate(i)}
              >
                <span
                  className="text-sm font-bold w-10 shrink-0"
                  style={{ color: r.color }}
                >
                  {r.label}
                </span>
                <div className="flex-1">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(m / (calcPMT(loan_amount_uzs, 0.26, loan_term_months))) * 100}%`, backgroundColor: r.color + 'aa' }}
                    />
                  </div>
                </div>
                <span className="text-white text-sm font-mono w-24 text-right shrink-0">
                  {fmt(m)} <span className="text-slate-500 text-xs font-normal">/oy</span>
                </span>
                <span className="text-slate-500 text-xs w-24 text-right shrink-0 hidden sm:block">
                  +{fmt(interest)} foiz
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Amortization schedule toggle */}
      <div className="px-5 pb-5">
        <button
          onClick={() => setShowSchedule(s => !s)}
          className="w-full py-2.5 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs rounded-xl transition-colors"
        >
          {showSchedule ? "− To’lov jadvalini yopish" : "+ To’lov jadvalini ko’rish (oyma-oy)"}
        </button>

        {showSchedule && schedule.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="px-3 py-2 text-left text-slate-500 font-medium">Oy</th>
                  <th className="px-3 py-2 text-right text-slate-500 font-medium">To'lov</th>
                  <th className="px-3 py-2 text-right text-slate-500 font-medium">Asosiy</th>
                  <th className="px-3 py-2 text-right text-slate-500 font-medium">Foiz</th>
                  <th className="px-3 py-2 text-right text-slate-500 font-medium">Qoldiq</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map(row => (
                  <tr key={row.month} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="px-3 py-1.5 text-slate-400">{row.month}</td>
                    <td className="px-3 py-1.5 text-white text-right font-mono" style={{ color: rate.color }}>
                      {fmt(row.payment)}
                    </td>
                    <td className="px-3 py-1.5 text-slate-300 text-right font-mono">{fmt(row.principal)}</td>
                    <td className="px-3 py-1.5 text-amber-400/80 text-right font-mono">{fmt(row.interest)}</td>
                    <td className="px-3 py-1.5 text-slate-500 text-right font-mono">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
