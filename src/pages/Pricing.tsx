/**
 * Pricing.tsx — BiznesPlan AI monetisation page
 *
 * Two models:
 *  A) Subscription plans  (Starter / Pro / Biznes)
 *  B) Deal-fee model      (1.5% per closed deal)
 *
 * Numbers are grounded in:
 *  • Uzbekistan average SME wholesale deal: ~30M sum
 *  • Informal broker (dallol) fee in UZ: 3–5%
 *  • Comparable SaaS in UZ: OLX Pro 80–200k/month
 *  • Facebook/Instagram ad (weekly): ~400k sum
 *  • Annual discount = 17–26% (SaaS industry standard: 20%)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, upgradePlan, type Plan } from '../lib/auth';

// ─── Pricing data ──────────────────────────────────────────────────────────────

const DEAL_FEE_PCT = 1.5;   // % of deal value
const DEAL_FEE_MIN = 50_000;     // minimum fee per deal (sum)
const DEAL_FEE_MAX = 5_000_000;  // maximum fee per deal (sum)

interface PlanMeta {
  id: Plan;
  name: string;
  icon: string;
  color: string;         // tailwind color token
  monthlyPrice: number;  // sum / month
  yearlyPrice: number;   // sum / year  (already discounted)
  yearSave: number;      // % saved vs monthly × 12
  tagline: string;
  bestFor: string;
  features: string[];
  notIncluded?: string[];
  badge?: string;
}

const PLANS: PlanMeta[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '🚀',
    color: 'blue',
    monthlyPrice: 149_000,
    yearlyPrice:  1_490_000,
    yearSave: 17,
    tagline: "Kichik biznes uchun ideal kirish nuqtasi",
    bestFor: "Oyiga 1–5 ta bitim yopuvchilar",
    features: [
      '30 ta aloqa / oy',
      'Barcha kategoriyalar bo\'yicha e\'lon',
      'AI maslahatchi (5 ta savol/kun)',
      'Asosiy bozor filtrlari',
      'Standart ko\'rinish',
    ],
    notIncluded: ['Yuqori joylashuv (priority)', 'Haftalik hisobot', 'Ko\'p foydalanuvchi'],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '⚡',
    color: 'purple',
    monthlyPrice: 399_000,
    yearlyPrice:  3_590_000,
    yearSave: 25,
    tagline: "O'sib borayotgan biznes uchun to'liq paket",
    bestFor: "Oyiga 5–20 ta bitim yopuvchilar",
    badge: "Eng mashhur",
    features: [
      'Cheksiz aloqalar',
      'Cheksiz AI maslahatchi',
      'Priority ko\'rinish (yuqorida chiqish)',
      'AI bozor tahlili (har kuni)',
      'Haftalik narx hisoboti',
      'E\'lonni \"Tanlangan\" belgilash',
      'Barcha kategoriyalar',
    ],
    notIncluded: ['Ko\'p foydalanuvchi (5 ta)', 'Shaxsiy menejer'],
  },
  {
    id: 'business',
    name: 'Biznes',
    icon: '🏢',
    color: 'emerald',
    monthlyPrice: 899_000,
    yearlyPrice:  7_990_000,
    yearSave: 26,
    tagline: "Katta kompaniyalar va agentliklar uchun",
    bestFor: "Oyiga 20+ ta bitim yopuvchilar",
    features: [
      'Hammasi Pro-da bor',
      '5 ta foydalanuvchi (bir akkaunt)',
      'Featured e\'lonlar (doim yuqorida)',
      'Maxsus AI bozor hisoboti (haftalik)',
      'Raqobatchilar tahlili',
      'Shaxsiy menejer (ish kunlari)',
      'API integratsiya (tez orada)',
    ],
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('uz-UZ');
}

function colorClasses(color: string, variant: 'bg' | 'border' | 'text' | 'badge') {
  const map: Record<string, Record<string, string>> = {
    blue:    { bg: 'bg-blue-700 hover:bg-blue-600',   border: 'border-blue-700',    text: 'text-blue-400',   badge: 'bg-blue-900/40 text-blue-400 border-blue-800' },
    purple:  { bg: 'bg-purple-700 hover:bg-purple-600',border: 'border-purple-600',  text: 'text-purple-400', badge: 'bg-purple-900/40 text-purple-300 border-purple-700' },
    emerald: { bg: 'bg-emerald-700 hover:bg-emerald-600',border:'border-emerald-700',text: 'text-emerald-400',badge: 'bg-emerald-900/40 text-emerald-400 border-emerald-800' },
  };
  return map[color]?.[variant] ?? '';
}

// ─── ROI Calculator ────────────────────────────────────────────────────────────

function ROICalc() {
  const [deals, setDeals] = useState(4);
  const [avg, setAvg] = useState(30);   // M sum

  const totalM = deals * avg;
  const dealFeeM = (totalM * DEAL_FEE_PCT) / 100;
  const starterM = 149;
  const proM = 399;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-white font-bold text-lg mb-1">💡 Qaysi model foydali?</h3>
      <p className="text-slate-500 text-sm mb-5">Oylik bitimlaringizni kiriting — hisoblaylik.</p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Oyda necha bitim?</label>
          <input type="range" min={1} max={30} value={deals} onChange={e => setDeals(+e.target.value)}
            className="w-full accent-purple-500" />
          <p className="text-white font-bold text-lg mt-1">{deals} ta bitim/oy</p>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">O'rtacha bitim hajmi</label>
          <input type="range" min={5} max={500} step={5} value={avg} onChange={e => setAvg(+e.target.value)}
            className="w-full accent-purple-500" />
          <p className="text-white font-bold text-lg mt-1">{avg} mln so'm</p>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-xl p-3 border text-center ${dealFeeM <= starterM ? 'bg-emerald-900/30 border-emerald-700' : 'bg-slate-800 border-slate-700'}`}>
          <p className="text-slate-400 text-xs mb-1">Bitim foizi (1.5%)</p>
          <p className="text-white font-bold text-base">{fmt(Math.round(dealFeeM))} ming</p>
          <p className="text-slate-500 text-[11px] mt-1">so'm/oy</p>
          {dealFeeM <= starterM && <p className="text-emerald-400 text-[10px] mt-1 font-semibold">✓ Arzon</p>}
        </div>
        <div className={`rounded-xl p-3 border text-center ${starterM <= dealFeeM && starterM <= proM ? 'bg-blue-900/30 border-blue-700' : 'bg-slate-800 border-slate-700'}`}>
          <p className="text-slate-400 text-xs mb-1">Starter plan</p>
          <p className="text-white font-bold text-base">149 ming</p>
          <p className="text-slate-500 text-[11px] mt-1">so'm/oy</p>
          {starterM < dealFeeM && <p className="text-blue-400 text-[10px] mt-1 font-semibold">✓ Arzon</p>}
        </div>
        <div className={`rounded-xl p-3 border text-center ${proM <= dealFeeM && proM <= starterM ? 'bg-purple-900/30 border-purple-700' : 'bg-slate-800 border-slate-700'}`}>
          <p className="text-slate-400 text-xs mb-1">Pro plan</p>
          <p className="text-white font-bold text-base">399 ming</p>
          <p className="text-slate-500 text-[11px] mt-1">so'm/oy</p>
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-3 text-center">
        Oylik savdo hajmi: ~{fmt(totalM)} mln so'm · Bitim foizi narxi: {fmt(Math.round(dealFeeM * 1_000_000 / 1000))} so'm/oy
      </p>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Pricing() {
  const navigate = useNavigate();
  const user = getUser();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [chosen, setChosen]   = useState<Plan | null>(null);

  const choose = (plan: Plan) => {
    setChosen(plan);
    upgradePlan(plan);
    setTimeout(() => navigate('/bozor'), 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white text-xl leading-none">←</button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-xs">B</div>
            <span className="text-white font-semibold text-sm">BiznesPlan AI</span>
          </div>
          {user && (
            <span className="text-slate-500 text-xs">
              Salom, {user.name.split(' ')[0]} 👋
            </span>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* Hero */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs px-3 py-1 bg-purple-900/40 text-purple-400 rounded-full border border-purple-800 font-medium">
            Tadbirkorlar uchun — O'zbekiston #1 B2B platformasi
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Har bir bitimdan ko'proq<br />
            <span className="text-purple-400">daromad oling</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Birinchi <span className="text-white font-semibold">3 ta aloqa bepul</span>. Keyin biznesingizga mos modelni tanlang —
            to'liq obuna yoki faqat yopilgan bitimdan foiz.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
            <button onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
              Oylik
            </button>
            <button onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
              Yillik
              <span className="text-xs px-1.5 py-0.5 bg-emerald-800/60 text-emerald-400 rounded-full border border-emerald-700/50 font-medium">−25%</span>
            </button>
          </div>
        </div>

        {/* Free tier callout */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl shrink-0">🎁</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-bold text-lg">Bepul boshlang — hech qanday karta kerak emas</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Ro'yxatdan o'tgan har bir tadbirkorga <span className="text-white font-semibold">3 ta bepul aloqa</span> beriladi.
              Platformani sinab ko'ring, keyin qulay tarifni tanlang.
            </p>
          </div>
          <button onClick={() => navigate('/bozor')}
            className="shrink-0 px-5 py-2.5 bg-white text-slate-950 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
            Bepul boshlash →
          </button>
        </div>

        {/* Subscription plans */}
        <div>
          <h2 className="text-white font-bold text-xl mb-2 text-center">Obuna rejalari</h2>
          <p className="text-slate-500 text-sm text-center mb-8">
            Ko'p bitim yopuvchilar uchun — obuna bitim foizidan arzonroq chiqadi
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map(plan => {
              const price = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
              const isChosen = chosen === plan.id;
              const isPro = plan.id === 'pro';

              return (
                <div key={plan.id}
                  className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all
                    ${isPro
                      ? 'bg-purple-950/30 border-purple-600 shadow-xl shadow-purple-900/20 scale-[1.02]'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
                  `}
                >
                  {/* Most popular badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full font-bold shadow-lg">
                        ⭐ {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan header */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{plan.icon}</span>
                      <span className={`font-bold text-lg ${colorClasses(plan.color, 'text')}`}>{plan.name}</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-white">{fmt(price)}</span>
                      <span className="text-slate-500 text-sm mb-1">so'm/oy</span>
                    </div>
                    {billing === 'yearly' && (
                      <p className="text-xs text-slate-500 mt-1">
                        Yillik: <span className="text-white font-semibold">{fmt(plan.yearlyPrice)}</span> so'm
                        <span className="ml-2 text-emerald-400 font-semibold">−{plan.yearSave}%</span>
                      </p>
                    )}
                    {billing === 'monthly' && (
                      <p className="text-xs text-slate-600 mt-1">yillik tanlasangiz tejaladi</p>
                    )}
                    <p className="text-slate-600 text-[11px] mt-1.5">📌 {plan.bestFor}</p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => choose(plan.id)}
                    className={`py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${
                      isChosen ? 'bg-green-600' : colorClasses(plan.color, 'bg')
                    }`}
                  >
                    {isChosen ? '✓ Tanlandi!' : `${plan.name} rejasini tanlash`}
                  </button>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <span className={`shrink-0 text-sm ${colorClasses(plan.color, 'text')}`}>✓</span>
                        <span className="text-slate-300 text-xs leading-relaxed">{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded?.map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <span className="shrink-0 text-slate-700 text-sm">✗</span>
                        <span className="text-slate-700 text-xs leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-600 text-sm font-medium shrink-0">YOKI</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Deal fee model */}
        <div>
          <h2 className="text-white font-bold text-xl mb-2 text-center">Bitim foizi modeli</h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Obuna to'lamasdan — faqat muvaffaqiyatli yopilgan bitimdan foiz
          </p>

          <div className="bg-slate-900 rounded-2xl border border-amber-900/50 p-6 max-w-2xl mx-auto">
            {/* Big number */}
            <div className="text-center mb-6">
              <p className="text-7xl font-black text-amber-400">1.5%</p>
              <p className="text-slate-400 text-sm mt-2">yopilgan har bir bitim summasidan</p>
            </div>

            {/* Why 1.5% */}
            <div className="bg-slate-800/60 rounded-xl p-4 mb-5">
              <p className="text-white text-sm font-semibold mb-3">Nima uchun aynan 1.5%?</p>
              <div className="space-y-2">
                {[
                  { label: "O'zbekistondagi norasmiy dallol (broker)", pct: '3–5%', color: 'text-red-400' },
                  { label: 'Xalqaro B2B platformalar (Alibaba va h.k.)', pct: '1–3%', color: 'text-orange-400' },
                  { label: 'BiznesPlan AI — raqamli platforma', pct: '1.5%', color: 'text-amber-400', highlight: true },
                ].map(r => (
                  <div key={r.label} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${r.highlight ? 'bg-amber-900/25 border border-amber-700/40' : ''}`}>
                    <span className="text-slate-400 text-xs">{r.label}</span>
                    <span className={`font-bold text-sm shrink-0 ${r.color}`}>{r.pct}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 text-xs mt-3">
                Biz broker narxining yarmi — ammo AI vositalari bilan birga.
              </p>
            </div>

            {/* Min / max */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Minimal to\'lov', value: fmt(DEAL_FEE_MIN) + ' so\'m', sub: '~3M sum bitimda' },
                { label: '30M sum bitimda', value: '450 000 so\'m', sub: 'qulay narx' },
                { label: 'Maksimal to\'lov', value: fmt(DEAL_FEE_MAX) + ' so\'m', sub: '333M+ sum bitimda' },
              ].map(s => (
                <div key={s.label} className="text-center bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-500 text-[10px] mb-1">{s.label}</p>
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <button onClick={() => choose('deal_fee')}
              className={`w-full py-3 rounded-xl text-slate-950 text-sm font-bold transition-all active:scale-95 ${
                chosen === 'deal_fee' ? 'bg-green-500' : 'bg-amber-400 hover:bg-amber-300'
              }`}>
              {chosen === 'deal_fee' ? '✓ Tanlandi!' : '🤝 Bitim foizi modelini tanlash'}
            </button>
          </div>
        </div>

        {/* ROI Calculator */}
        <ROICalc />

        {/* Comparison table */}
        <div>
          <h2 className="text-white font-bold text-xl mb-6 text-center">To'liq taqqoslash</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Xususiyat</th>
                  <th className="text-center px-3 py-3 text-slate-500 font-medium">Bepul</th>
                  <th className="text-center px-3 py-3 text-blue-400 font-medium">Starter</th>
                  <th className="text-center px-3 py-3 text-purple-400 font-semibold">Pro ⭐</th>
                  <th className="text-center px-3 py-3 text-emerald-400 font-medium">Biznes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { f: "E'lon joylash",          free:'✓', s:'✓', p:'✓', b:'✓' },
                  { f: 'Aloqa (kontakt)',          free:'3 ta', s:'30/oy', p:'∞', b:'∞' },
                  { f: 'AI maslahatchi',           free:'✓', s:'5/kun', p:'∞', b:'∞' },
                  { f: 'Kategoriya filtri',         free:'✓', s:'✓', p:'✓', b:'✓' },
                  { f: "Priority ko'rinish",        free:'–', s:'–', p:'✓', b:'✓' },
                  { f: 'AI bozor tahlili',          free:'–', s:'–', p:'✓', b:'✓' },
                  { f: "Featured e'lonlar",         free:'–', s:'–', p:'–', b:'✓' },
                  { f: 'Ko\'p foydalanuvchi',       free:'–', s:'–', p:'–', b:'5 ta' },
                  { f: 'Shaxsiy menejer',           free:'–', s:'–', p:'–', b:'✓' },
                  { f: 'Haftalik bozor hisoboti',   free:'–', s:'–', p:'✓', b:'✓' },
                ].map(row => (
                  <tr key={row.f} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-2.5 text-slate-300 text-xs">{row.f}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-600">{row.free}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-blue-400">{row.s}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-purple-400 font-medium">{row.p}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-emerald-400">{row.b}</td>
                  </tr>
                ))}
                {/* Prices */}
                <tr className="bg-slate-900 border-t border-slate-700">
                  <td className="px-4 py-3 text-white font-semibold text-xs">Oylik narx</td>
                  <td className="px-3 py-3 text-center text-slate-500 text-xs font-bold">0 so'm</td>
                  <td className="px-3 py-3 text-center text-blue-400 text-xs font-bold">149 000</td>
                  <td className="px-3 py-3 text-center text-purple-400 text-xs font-bold">399 000</td>
                  <td className="px-3 py-3 text-center text-emerald-400 text-xs font-bold">899 000</td>
                </tr>
                <tr className="bg-slate-900">
                  <td className="px-4 py-3 text-white font-semibold text-xs">Yillik narx</td>
                  <td className="px-3 py-3 text-center text-slate-500 text-xs font-bold">0 so'm</td>
                  <td className="px-3 py-3 text-center text-xs">
                    <span className="text-blue-400 font-bold">1 490 000</span>
                    <span className="block text-emerald-500 text-[10px]">−17%</span>
                  </td>
                  <td className="px-3 py-3 text-center text-xs">
                    <span className="text-purple-400 font-bold">3 590 000</span>
                    <span className="block text-emerald-500 text-[10px]">−25%</span>
                  </td>
                  <td className="px-3 py-3 text-center text-xs">
                    <span className="text-emerald-400 font-bold">7 990 000</span>
                    <span className="block text-emerald-500 text-[10px]">−26%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust badges */}
        <div className="text-center space-y-4">
          <p className="text-slate-600 text-xs uppercase tracking-wider">Ishonch kafolatlari</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              '🔒 To\'lovlar xavfsiz',
              '↩️ 14 kun ichida qaytarish',
              '📞 Qo\'llab-quvvatlash: 1140',
              '🇺🇿 O\'zbekiston uchun yaratilgan',
            ].map(t => (
              <span key={t} className="text-slate-500 text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-white font-bold text-xl mb-6 text-center">Ko'p so'raladigan savollar</h2>
          {[
            {
              q: '3 ta bepul aloqa tugagach nima bo\'ladi?',
              a: 'Tarifni tanlashingiz so\'raladi. Sotuvchi kontaktini ko\'rish va aloqa qilish uchun obuna yoki bitim foizi modelini tanlang.'
            },
            {
              q: 'Bitim foizi qanday hisoblanadi?',
              a: 'Bitim yopilgach, platformada bitim summasini kiriting. Biz 1.5% hisoblaymiz (minimal 50 000, maksimal 5 000 000 so\'m). To\'lov Payme orqali amalga oshiriladi.'
            },
            {
              q: 'Yillik obunadan qachon foydalanish kerak?',
              a: 'Agar oyiga 3+ ta bitim yopsangiz, yillik obuna bitim foizidan ancha arzonroq chiqadi. ROI kalkulyatorimizda o\'zingiz hisoblang.'
            },
            {
              q: 'Rejani o\'zgartirish mumkinmi?',
              a: 'Ha, istalgan vaqtda yuqori rejaga o\'tish mumkin. Pastga tushish keyingi to\'lov sanasidan kuchga kiradi.'
            },
          ].map(faq => (
            <details key={faq.q} className="bg-slate-900 border border-slate-800 rounded-xl p-4 group">
              <summary className="text-white text-sm font-semibold cursor-pointer list-none flex items-center justify-between gap-3">
                {faq.q}
                <span className="text-slate-600 group-open:text-white transition-colors shrink-0">+</span>
              </summary>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center space-y-4">
          <p className="text-white font-bold text-lg">Hali ham savolingiz bormi?</p>
          <p className="text-slate-400 text-sm">AI maslahatchi bilan gaplashing yoki bozorga qarang</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/interview')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
              🤖 AI Maslahatchi
            </button>
            <button onClick={() => navigate('/bozor')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition-colors">
              📊 Bozorga qaytish
            </button>
          </div>
          <p className="text-slate-700 text-xs pt-2">BiznesPlan AI · Xakaton 2026 · O'zbekiston</p>
        </div>
      </div>
    </div>
  );
}
