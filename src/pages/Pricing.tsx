/**
 * Pricing.tsx — BiznesPlan AI plans & deal-fee page
 * All constants live in src/lib/pricingConfig.ts.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, upgradePlan, type Plan } from '../lib/auth';
import {
  PLANS, DEAL_FEE_PCT, DEAL_FEE_MIN, DEAL_FEE_MAX,
  AVG_DEAL_SUM, AVG_DEALS_PER_MONTH,
  planColor, fmtSum,
} from '../lib/pricingConfig';

// ─── ROI Calculator ────────────────────────────────────────────────────────────

function ROICalc() {
  // Defaults from stat.uz: ~15 deals/month, ~34M sum/deal (see pricingConfig.ts)
  const [deals, setDeals] = useState(AVG_DEALS_PER_MONTH);
  const [avgM, setAvgM]   = useState(AVG_DEAL_SUM / 1_000_000);

  const dealFeeM  = (deals * avgM * DEAL_FEE_PCT) / 100;
  const starterM  = 149;
  const proM      = 399;

  const cheapest = dealFeeM <= starterM ? 'deal' : starterM <= proM ? 'starter' : 'pro';

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">
      <h3 className="text-white font-bold text-lg mb-1">💡 Qaysi model foydali?</h3>
      <p className="text-slate-500 text-sm mb-5">Oylik bitimlaringizni kiriting — hisoblaylik.</p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">Oyda necha bitim?</label>
          <input type="range" min={1} max={30} value={deals} onChange={e => setDeals(+e.target.value)} className="w-full accent-purple-500" />
          <p className="text-white font-bold text-lg mt-1">{deals} ta bitim/oy</p>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1.5 block">O'rtacha bitim hajmi</label>
          <input type="range" min={5} max={500} step={5} value={avgM} onChange={e => setAvgM(+e.target.value)} className="w-full accent-purple-500" />
          <p className="text-white font-bold text-lg mt-1">{avgM} mln so'm</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'deal',    label: 'Bitim foizi (1.5%)', value: `${fmtSum(Math.round(dealFeeM))} ming` },
          { key: 'starter', label: 'Starter plan',        value: '149 ming' },
          { key: 'pro',     label: 'Pro plan',             value: '399 ming' },
        ].map(opt => (
          <div key={opt.key} className={`rounded-xl p-3 border text-center transition-all ${
            cheapest === opt.key ? 'bg-emerald-900/30 border-emerald-700' : 'bg-slate-800 border-slate-700'
          }`}>
            <p className="text-slate-400 text-xs mb-1">{opt.label}</p>
            <p className="text-white font-bold text-base">{opt.value}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">so'm/oy</p>
            {cheapest === opt.key && <p className="text-emerald-400 text-[10px] mt-1 font-semibold">✓ Arzon</p>}
          </div>
        ))}
      </div>
      <p className="text-slate-600 text-xs mt-3 text-center">
        Stat.uz o'rtacha: ~{AVG_DEALS_PER_MONTH} bitim/oy · ~{AVG_DEAL_SUM / 1_000_000}M so'm/bitim
      </p>
    </div>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: typeof PLANS[number];
  billing: 'monthly' | 'yearly';
  chosen: Plan | null;
  onChoose: (id: Plan) => void;
}

function PlanCard({ plan, billing, chosen, onChoose }: PlanCardProps) {
  const price = billing === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
  const isChosen = chosen === plan.id;
  const isPro = plan.id === 'pro';

  return (
    <div className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
      isPro
        ? 'bg-purple-950/30 border-purple-600 shadow-xl shadow-purple-900/20 scale-[1.02]'
        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
    }`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-xs px-3 py-1 bg-purple-600 text-white rounded-full font-bold shadow-lg">⭐ {plan.badge}</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{plan.icon}</span>
          <span className={`font-bold text-lg ${planColor(plan.color, 'text')}`}>{plan.name}</span>
        </div>
        <p className="text-slate-400 text-xs">{plan.tagline}</p>
      </div>

      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-white">{fmtSum(price)}</span>
          <span className="text-slate-500 text-sm mb-1">so'm/oy</span>
        </div>
        {billing === 'yearly'
          ? <p className="text-xs text-slate-500 mt-1">Yillik: <span className="text-white font-semibold">{fmtSum(plan.yearlyPrice)}</span> so'm <span className="text-emerald-400 font-semibold ml-1">−{plan.yearSave}%</span></p>
          : <p className="text-xs text-slate-600 mt-1">yillik tanlasangiz tejaladi</p>
        }
        <p className="text-slate-600 text-[11px] mt-1.5">📌 {plan.bestFor}</p>
      </div>

      <button
        onClick={() => onChoose(plan.id)}
        className={`py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${
          isChosen ? 'bg-green-600' : planColor(plan.color, 'bg')
        }`}
      >
        {isChosen ? '✓ Tanlandi!' : `${plan.name} rejasini tanlash`}
      </button>

      <div className="space-y-2">
        {plan.features.map(f => (
          <div key={f} className="flex items-start gap-2">
            <span className={`shrink-0 text-sm ${planColor(plan.color, 'text')}`}>✓</span>
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
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
          {user && <span className="text-slate-500 text-xs">Salom, {user.name.split(' ')[0]} 👋</span>}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* Hero */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs px-3 py-1 bg-purple-900/40 text-purple-400 rounded-full border border-purple-800 font-medium">
            Tadbirkorlar uchun — O'zbekiston #1 B2B platformasi
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Har bir bitimdan ko'proq<br />
            <span className="text-purple-400">daromad oling</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Birinchi <span className="text-white font-semibold">3 ta aloqa bepul</span>.
            Keyin biznesingizga mos modelni tanlang — obuna yoki bitim foizi.
          </p>

          <div className="inline-flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1">
            <button onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
              Oylik
            </button>
            <button onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
              Yillik
              <span className="text-xs px-1.5 py-0.5 bg-emerald-800/60 text-emerald-400 rounded-full border border-emerald-700/50">−25%</span>
            </button>
          </div>
        </div>

        {/* Free tier callout */}
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-4xl shrink-0">🎁</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-bold text-lg">Bepul boshlang — karta kerak emas</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Har bir yangi tadbirkorga <span className="text-white font-semibold">3 ta bepul aloqa</span>. Sinab ko'ring, keyin tanlang.
            </p>
          </div>
          <button onClick={() => navigate('/bozor')} className="shrink-0 px-5 py-2.5 bg-white text-slate-950 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors">
            Bepul boshlash →
          </button>
        </div>

        {/* Subscription plans */}
        <div>
          <h2 className="text-white font-bold text-xl mb-2 text-center">Obuna rejalari</h2>
          <p className="text-slate-500 text-sm text-center mb-8">
            Ko'p bitim yopsangiz — obuna bitim foizidan arzonroq chiqadi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <PlanCard key={plan.id} plan={plan} billing={billing} chosen={chosen} onChoose={choose} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-600 text-sm font-medium shrink-0">YOKI</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Deal fee */}
        <div>
          <h2 className="text-white font-bold text-xl mb-2 text-center">Bitim foizi modeli</h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Obuna yo'q — faqat muvaffaqiyatli yopilgan bitimdan foiz
          </p>

          <div className="bg-slate-900 rounded-2xl border border-amber-900/50 p-6 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-7xl font-black text-amber-400">{DEAL_FEE_PCT}%</p>
              <p className="text-slate-400 text-sm mt-2">yopilgan har bir bitim summasidan</p>
            </div>

            {/* Why 1.5% — sourced */}
            <div className="bg-slate-800/60 rounded-xl p-4 mb-5">
              <p className="text-white text-sm font-semibold mb-3">Nima uchun aynan {DEAL_FEE_PCT}%? — manba asosida</p>
              <div className="space-y-2">
                {[
                  { label: 'UzEx rasmiy tovar birjasi (uzex.uz)', rate: '0.18%', note: "faqat standart tovarlar: paxta, bug'doy, metall", highlight: false },
                  { label: "O'zbekiston norasmiy dallollari", rate: '3–5%', note: 'soliq yo\'q, hujjat yo\'q, AI yo\'q', highlight: false },
                  { label: 'BiznesPlan AI — SME B2B platforma', rate: `${DEAL_FEE_PCT}%`, note: 'AI + kashfiyot + shaffoflik', highlight: true },
                ].map(r => (
                  <div key={r.label} className={`px-3 py-2.5 rounded-lg ${r.highlight ? 'bg-amber-900/25 border border-amber-700/40' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-300 text-xs font-medium">{r.label}</span>
                      <span className={`font-bold text-base shrink-0 ${r.highlight ? 'text-amber-400' : r.rate.includes('3–5') ? 'text-red-400' : 'text-slate-400'}`}>{r.rate}</span>
                    </div>
                    <p className="text-slate-600 text-[10px] mt-0.5">{r.note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
                <p className="text-slate-600 text-[10px]">📊 UzEx manba: uzex.uz/en/pages/online-exchange-trades-tariff</p>
                <p className="text-slate-600 text-[10px]">📊 stat.uz · invexi.org — 2025-yil yanvar–fevral: 46 477 kichik optom korxona · 46 819B so'm / 2 oy → ~34M so'm/bitim</p>
              </div>
            </div>

            {/* Deal examples */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Kichik bitim', deal: '10M so\'m', fee: '150 000 so\'m', sub: "UzEx'dan tashqari" },
                { label: "O'rtacha bitim", deal: `${AVG_DEAL_SUM / 1_000_000}M so'm`, fee: '510 000 so\'m', sub: '≈ stat.uz o\'rtacha' },
                { label: 'Katta bitim', deal: '100M so\'m', fee: '1 500 000 so\'m', sub: 'dalloldan 2× arzon' },
              ].map(s => (
                <div key={s.label} className="text-center bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-500 text-[10px] mb-1">{s.label}</p>
                  <p className="text-white font-bold text-sm">{s.deal}</p>
                  <p className="text-amber-400 font-bold text-sm">{s.fee}</p>
                  <p className="text-slate-600 text-[10px] mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 text-xs text-slate-600 mb-5">
              <span>Min: <span className="text-slate-400 font-medium">{fmtSum(DEAL_FEE_MIN)} so'm</span></span>
              <span>·</span>
              <span>Max: <span className="text-slate-400 font-medium">{fmtSum(DEAL_FEE_MAX)} so'm</span></span>
            </div>

            <button
              onClick={() => choose('deal_fee')}
              className={`w-full py-3 rounded-xl text-slate-950 text-sm font-bold transition-all active:scale-95 ${
                chosen === 'deal_fee' ? 'bg-green-500' : 'bg-amber-400 hover:bg-amber-300'
              }`}
            >
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
                  { f: "E'lon joylash",          free:'✓',    s:'✓',     p:'✓',  b:'✓' },
                  { f: 'Aloqa (kontakt)',          free:'3 ta', s:'30/oy', p:'∞',  b:'∞' },
                  { f: 'AI maslahatchi',           free:'✓',    s:'5/kun', p:'∞',  b:'∞' },
                  { f: "Priority ko'rinish",        free:'–',    s:'–',     p:'✓',  b:'✓' },
                  { f: 'AI bozor tahlili',          free:'–',    s:'–',     p:'✓',  b:'✓' },
                  { f: "Featured e'lonlar",         free:'–',    s:'–',     p:'–',  b:'✓' },
                  { f: "Ko'p foydalanuvchi",        free:'–',    s:'–',     p:'–',  b:'5 ta' },
                  { f: 'Shaxsiy menejer',           free:'–',    s:'–',     p:'–',  b:'✓' },
                ].map(row => (
                  <tr key={row.f} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-2.5 text-slate-300 text-xs">{row.f}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-slate-600">{row.free}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-blue-400">{row.s}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-purple-400 font-medium">{row.p}</td>
                    <td className="px-3 py-2.5 text-center text-xs text-emerald-400">{row.b}</td>
                  </tr>
                ))}
                <tr className="bg-slate-900 border-t border-slate-700">
                  <td className="px-4 py-3 text-white font-semibold text-xs">Oylik narx</td>
                  <td className="px-3 py-3 text-center text-slate-500 text-xs font-bold">0</td>
                  <td className="px-3 py-3 text-center text-blue-400 text-xs font-bold">149 000</td>
                  <td className="px-3 py-3 text-center text-purple-400 text-xs font-bold">399 000</td>
                  <td className="px-3 py-3 text-center text-emerald-400 text-xs font-bold">899 000</td>
                </tr>
                <tr className="bg-slate-900">
                  <td className="px-4 py-3 text-white font-semibold text-xs">Yillik narx</td>
                  <td className="px-3 py-3 text-center text-slate-500 text-xs font-bold">0</td>
                  <td className="px-3 py-3 text-center text-xs"><span className="text-blue-400 font-bold">1 490 000</span><span className="block text-emerald-500 text-[10px]">−17%</span></td>
                  <td className="px-3 py-3 text-center text-xs"><span className="text-purple-400 font-bold">3 590 000</span><span className="block text-emerald-500 text-[10px]">−25%</span></td>
                  <td className="px-3 py-3 text-center text-xs"><span className="text-emerald-400 font-bold">7 990 000</span><span className="block text-emerald-500 text-[10px]">−26%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data sources */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-3 font-medium">📊 Narxlar asosi — rasmiy manbalar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">O'rtacha bitim (~34M so'm):</p>
              <p>• stat.uz / invexi.org — 2025-yil yanvar–fevral</p>
              <p>• 46 477 kichik optom korxona → 46 819B so'm / 2 oy</p>
              <p>• ~508M so'm/oy/korxona ÷ ~15 bitim = ~34M so'm/bitim</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 font-medium">1.5% komissiya asosi:</p>
              <p>• UzEx rasmiy birja: 0.18% (uzex.uz)</p>
              <p>• Norasmiy dallollar: 3–5%</p>
              <p>• Uzum Market (B2C): 10–35%</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-3 text-[10px] text-slate-700">
            {[
              { label: 'invexi.org — Wholesale Jan–Feb 2025', url: 'https://invexi.org/press/retail-and-wholesale-trade-turnover-in-the-republic-of-uzbekistan-january-february-2025/' },
              { label: 'uzex.uz — Exchange tariffs', url: 'https://uzex.uz/en/pages/online-exchange-trades-tariff' },
              { label: 'invexi.org — SME indicators 2024', url: 'https://invexi.org/press/key-indicators-of-small-entrepreneurship-in-the-republic-of-uzbekistan-for-2024/' },
              { label: 'stat.uz — National Statistics', url: 'https://stat.uz' },
            ].map(s => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 underline transition-colors">{s.label}</a>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-white font-bold text-xl mb-6 text-center">Ko'p so'raladigan savollar</h2>
          {[
            { q: '3 ta bepul aloqa tugagach nima bo\'ladi?', a: 'Tarifni tanlashingiz so\'raladi. Sotuvchi kontaktini ko\'rish uchun obuna yoki bitim foizi modelini tanlang.' },
            { q: 'Bitim foizi qanday hisoblanadi?', a: `Bitim yopilgach, platformada summasini kiriting. Biz ${DEAL_FEE_PCT}% hisoblaymiz (min ${fmtSum(DEAL_FEE_MIN)}, max ${fmtSum(DEAL_FEE_MAX)} so'm). To'lov Payme orqali.` },
            { q: 'Yillik obunadan qachon foydalanish kerak?', a: 'Agar oyiga 3+ ta bitim yopsangiz, yillik obuna bitim foizidan arzonroq. ROI kalkulyatorimizda o\'zingiz hisoblang.' },
            { q: 'Rejani o\'zgartirish mumkinmi?', a: 'Ha, istalgan vaqtda yuqori rejaga o\'tish mumkin. Pastga tushish keyingi to\'lov sanasidan kuchga kiradi.' },
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

        {/* Trust badges */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            {["🔒 To'lovlar xavfsiz", '↩️ 14 kun ichida qaytarish', '📞 Qo\'llab-quvvatlash: 1140', "🇺🇿 O'zbekiston uchun yaratilgan"].map(t => (
              <span key={t} className="text-slate-500 text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-800 bg-slate-900/50 mt-10">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center space-y-4">
          <p className="text-white font-bold text-lg">Hali ham savolingiz bormi?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/interview')} className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">🤖 AI Maslahatchi</button>
            <button onClick={() => navigate('/bozor')} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl border border-slate-700 transition-colors">📊 Bozorga qaytish</button>
          </div>
          <p className="text-slate-700 text-xs pt-2">BiznesPlan AI · Xakaton 2026 · O'zbekiston</p>
        </div>
      </div>
    </div>
  );
}
