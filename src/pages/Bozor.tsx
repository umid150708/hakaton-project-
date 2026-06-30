/**
 * Bozor.tsx — Bozor-Analitika B2B Platform (Muammo 14)
 *
 * Features:
 *  1. CBU live exchange rates (USD/RUB/CNY) — import price pressure signals
 *  2. Curated wholesale B2B price dataset with trend indicators
 *  3. AI market analyst — Gemini explains current price dynamics in Uzbek
 *  4. Crowdsourced price reports — anyone can submit prices they've seen
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  B2B_PRODUCTS, B2B_CATEGORIES, fmtB2BPrice,
  type B2BProduct,
} from '../lib/b2bPrices';
import { fetchRates, IMPORT_SENSITIVITY, type RateSnapshot } from '../lib/cbuRates';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'price_asc' | 'price_desc' | 'trend' | 'name';

// ─── Buy / Sell Ads Board ─────────────────────────────────────────────────────

interface Ad {
  id: string;
  type: 'buy' | 'sell';
  product: string;
  quantity: string;
  location: string;
  price: string;       // optional for buy ads
  contact: string;
  date: string;
}

const ADS_KEY = 'b2b_ads_v2';

function loadAds(): Ad[] {
  try { return JSON.parse(localStorage.getItem(ADS_KEY) ?? '[]'); }
  catch { return []; }
}
function saveAd(ad: Ad) {
  const all = loadAds();
  all.unshift(ad);
  localStorage.setItem(ADS_KEY, JSON.stringify(all.slice(0, 100)));
}

function AdsBoard() {
  const [tab, setTab]           = useState<'buy' | 'sell'>('buy');
  const [filter, setFilter]     = useState<'all' | 'buy' | 'sell'>('all');
  const [ads, setAds]           = useState<Ad[]>(loadAds);
  const [product, setProduct]   = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice]       = useState('');
  const [contact, setContact]   = useState('');
  const [done, setDone]         = useState(false);

  const canSubmit = product.trim() && quantity.trim() && location.trim();

  const submit = () => {
    if (!canSubmit) return;
    const ad: Ad = {
      id: Date.now().toString(),
      type: tab,
      product: product.trim(),
      quantity: quantity.trim(),
      location: location.trim(),
      price: price.trim(),
      contact: contact.trim(),
      date: new Date().toLocaleDateString('uz-UZ'),
    };
    saveAd(ad);
    setAds(loadAds());
    setProduct(''); setQuantity(''); setLocation(''); setPrice(''); setContact('');
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  const visible = filter === 'all' ? ads : ads.filter(a => a.type === filter);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <p className="text-white text-sm font-semibold">📢 Xaridorlar va Sotuvchilar</p>
        <p className="text-slate-500 text-xs mt-0.5">E'lon joylashtiring — toping yoki soting</p>
      </div>

      {/* Buy / Sell tab switcher */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setTab('buy')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'buy'
              ? 'bg-blue-900/40 text-blue-400 border-b-2 border-blue-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🛒 Sotib olaman
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'sell'
              ? 'bg-emerald-900/40 text-emerald-400 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          💰 Sotaman
        </button>
      </div>

      {/* Form */}
      <div className="p-4 border-b border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            value={product} onChange={e => setProduct(e.target.value)}
            placeholder={tab === 'buy' ? "Nima kerak? (sement, un...)" : "Nima sotasiz? (go'sht, armitura...)"}
            className="col-span-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600"
          />
          <input
            value={quantity} onChange={e => setQuantity(e.target.value)}
            placeholder="Miqdor (10 tonna, 500 kg...)"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600"
          />
          <input
            value={location} onChange={e => setLocation(e.target.value)}
            placeholder={tab === 'buy' ? "Qayerga? (Jizzax, Namangan...)" : "Qayerdan? (Toshkent, Andijon...)"}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600"
          />
          {tab === 'sell' && (
            <input
              value={price} onChange={e => setPrice(e.target.value)}
              placeholder="Narx (so'mda, kg/tonna)"
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-emerald-600"
            />
          )}
          <input
            value={contact} onChange={e => setContact(e.target.value)}
            placeholder="Telefon yoki ism (ixtiyoriy)"
            className={`px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600 ${tab === 'sell' ? '' : 'col-span-2'}`}
          />
        </div>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`w-full py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:bg-slate-800 disabled:text-slate-600 ${
            tab === 'buy'
              ? 'bg-blue-700 hover:bg-blue-600'
              : 'bg-emerald-700 hover:bg-emerald-600'
          }`}
        >
          {done ? '✓ E\'lon joylashtirildi!' : tab === 'buy' ? '🛒 Xarid e\'lonini joylashtirish' : '💰 Sotuv e\'lonini joylashtirish'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-slate-800">
        {(['all', 'buy', 'sell'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              filter === f ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f === 'all' ? `Barchasi (${ads.length})` : f === 'buy' ? `🛒 Xarid (${ads.filter(a=>a.type==='buy').length})` : `💰 Sotuv (${ads.filter(a=>a.type==='sell').length})`}
          </button>
        ))}
      </div>

      {/* Ads list */}
      {visible.length === 0 ? (
        <p className="px-4 py-4 text-slate-600 text-xs text-center">
          {filter === 'all' ? "Hali e'lon yo'q. Birinchi bo'lib joylashtiring!" : "Bu toifada e'lon yo'q"}
        </p>
      ) : (
        <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
          {visible.map(ad => (
            <div key={ad.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    ad.type === 'buy'
                      ? 'bg-blue-950 text-blue-400 border border-blue-900'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                  }`}>
                    {ad.type === 'buy' ? '🛒 Xarid' : '💰 Sotuv'}
                  </span>
                  <span className="text-white text-sm font-semibold">{ad.product}</span>
                </div>
                <span className="text-slate-600 text-xs shrink-0">{ad.date}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-400">
                <span>📦 {ad.quantity}</span>
                <span>📍 {ad.location}</span>
                {ad.price && <span className="text-emerald-400 font-medium">💵 {ad.price} so'm</span>}
                {ad.contact && <span>📞 {ad.contact}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CBU Rate Bar ─────────────────────────────────────────────────────────────

function RateBar({ rates }: { rates: RateSnapshot }) {
  const items = [
    { label: 'USD', value: rates.usd, diff: rates.usdDiff },
    { label: 'RUB', value: rates.rub, diff: rates.rubDiff },
    { label: 'CNY', value: rates.cny, diff: rates.cnyDiff },
  ];
  return (
    <div className="flex items-center gap-4 text-xs">
      {items.map(it => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="text-slate-500">{it.label}</span>
          <span className="text-white font-mono">{it.value.toLocaleString('uz-UZ', { maximumFractionDigits: 0 })}</span>
          <span className={it.diff >= 0 ? 'text-red-400' : 'text-emerald-400'}>
            {it.diff >= 0 ? '↑' : '↓'}{Math.abs(it.diff).toFixed(0)}
          </span>
        </span>
      ))}
      <span className="text-slate-700">CBU · {rates.date}</span>
    </div>
  );
}

// ─── Import pressure badge ─────────────────────────────────────────────────────

function ImportBadge({ productId, rates }: { productId: string; rates: RateSnapshot | null }) {
  const sens = IMPORT_SENSITIVITY[productId];
  if (!sens || !rates) return null;

  const diff = sens.currency === 'USD' ? rates.usdDiff
    : sens.currency === 'RUB' ? rates.rubDiff
    : rates.cnyDiff;

  const rate = sens.currency === 'USD' ? rates.usd
    : sens.currency === 'RUB' ? rates.rub
    : rates.cny;

  const impact = ((diff / rate) * 100 * sens.impactPct).toFixed(1);
  const up = diff > 0;

  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${up ? 'bg-red-950/40 text-red-400' : 'bg-emerald-950/40 text-emerald-400'}`}>
      {sens.currency} {up ? '↑' : '↓'} → narx {up ? '+' : ''}{impact}%
    </span>
  );
}

// ─── B2B product card ─────────────────────────────────────────────────────────

function ProductCard({ p, rates }: { p: B2BProduct; rates: RateSnapshot | null }) {
  const [open, setOpen] = useState(false);
  const trendColor = p.trend === 'up' ? '#ef4444' : p.trend === 'down' ? '#10b981' : '#64748b';
  const trendIcon  = p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '→';
  const sign       = p.trendPct > 0 ? '+' : '';
  const rangePct   = p.priceMax > p.priceMin
    ? Math.round(((p.pricePerUnit - p.priceMin) / (p.priceMax - p.priceMin)) * 100)
    : 50;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-white font-semibold text-sm leading-snug flex-1">{p.name}</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ color: trendColor, backgroundColor: trendColor + '18' }}>
            {trendIcon} {sign}{p.trendPct.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-slate-500 text-xs">{p.categoryLabel}</p>
          <ImportBadge productId={p.id} rates={rates} />
        </div>

        <div className="flex items-end gap-3 mb-2">
          <div>
            <p className="text-xl font-bold text-emerald-400 leading-none">{fmtB2BPrice(p.pricePerUnit)}</p>
            <p className="text-slate-600 text-xs mt-0.5">so'm/{p.unit}</p>
          </div>
          <div className="flex-1 pb-1">
            <div className="relative h-1.5 bg-slate-800 rounded-full">
              <div className="absolute h-full bg-emerald-700/50 rounded-full" style={{ width: `${rangePct}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full border-2 border-slate-900"
                style={{ left: `calc(${rangePct}% - 4px)` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-700 mt-1">
              <span>{fmtB2BPrice(p.priceMin)}</span>
              <span>{fmtB2BPrice(p.priceMax)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Min: <span className="text-slate-400">{p.bulkUnit}</span></span>
          <span className="text-slate-600">Jami: <span className="text-slate-300 font-medium">{fmtB2BPrice(p.pricePerUnit * p.bulkMin)}</span></span>
        </div>
      </div>

      <button onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2 bg-slate-800/60 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-between transition-colors">
        <span>📍 Qayerdan sotib olish ({p.suppliers.length} ta)</span>
        <span>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-4 pb-3 pt-2 bg-slate-950/40 space-y-1.5">
          {p.suppliers.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-emerald-500 shrink-0 text-xs">{i === 0 ? '★' : '·'}</span>
              <span className="text-slate-400 text-xs leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── AI Market Analyst ────────────────────────────────────────────────────────

function AIAnalyst({ rates, productName }: { rates: RateSnapshot | null; productName?: string }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const analyze = async () => {
    setLoading(true);
    setDone(false);
    setAnalysis('');

    const context = rates
      ? `USD: ${rates.usd} so'm (${rates.usdDiff >= 0 ? '+' : ''}${rates.usdDiff} bugun), RUB: ${rates.rub} so'm, CNY: ${rates.cny} so'm`
      : '';

    const prompt = productName
      ? `O'zbek tilida 2-3 jumlada: "${productName}" mahsulotining hozirgi bozor holati. ${context}. Bu mahsulot import qilingan bo'lsa, valyuta kursi qanday ta'sir qiladi? Tadbirkor uchun: hozir sotib olish vaqtimi yoki kutish kerakmi?`
      : `O'zbek tilida 3-4 jumlada Toshkent ulgurji bozori tahlili: ${context}. Qaysi tovarlar qimmatlamoqda? Import tovarlariga valyuta kursi ta'siri. Tadbirkorlar uchun amaliy maslahat.`;

    try {
      // Use backend endpoint — keeps API key hidden from browser
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await res.json();
      const text = data?.text ?? 'Tahlil yuklanmadi.';
      setAnalysis(text);
      setDone(true);
    } catch {
      setAnalysis("Tahlil yuklanmadi. Internet aloqasini tekshiring.");
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-purple-900/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <p className="text-white text-sm font-semibold">AI Bozor Tahlilchisi</p>
            <p className="text-slate-500 text-xs">
              {productName ? `"${productName}" tahlili` : 'Umumiy bozor holati'}
            </p>
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 disabled:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {loading ? 'Tahlil qilinmoqda...' : done ? 'Yangilash' : 'Tahlil qilish'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          Gemini AI bozor ma'lumotlarini tahlil qilmoqda...
        </div>
      )}

      {done && analysis && (
        <div className="bg-slate-800/60 rounded-lg p-3">
          <p className="text-slate-300 text-sm leading-relaxed">{analysis}</p>
          {rates && (
            <p className="text-slate-600 text-xs mt-2">
              Ma'lumot asosi: USD {rates.usd.toFixed(0)}, RUB {rates.rub.toFixed(0)}, CNY {rates.cny.toFixed(0)} so'm · CBU {rates.date}
            </p>
          )}
        </div>
      )}

      {!loading && !done && (
        <p className="text-slate-600 text-xs">
          Tugmani bosing — AI valyuta kurslari va bozor ma'lumotlari asosida tahlil beradi.
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Bozor() {
  const navigate = useNavigate();

  const [query, setQuery]             = useState('');
  const [activeCategory, setCategory] = useState('all');
  const [sort, setSort]               = useState<SortKey>('price_asc');
  const [rates, setRates]             = useState<RateSnapshot | null>(null);
  const [ratesError, setRatesError]   = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();

  // Load CBU rates on mount
  useEffect(() => {
    fetchRates()
      .then(setRates)
      .catch(() => setRatesError(true));
  }, []);

  const filtered = useMemo(() => {
    let list = B2B_PRODUCTS;
    if (activeCategory !== 'all') list = list.filter(p => p.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameRu.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === 'price_asc')  return a.pricePerUnit - b.pricePerUnit;
      if (sort === 'price_desc') return b.pricePerUnit - a.pricePerUnit;
      if (sort === 'trend')      return b.trendPct - a.trendPct;
      return a.name.localeCompare(b.name);
    });
  }, [query, activeCategory, sort]);

  const rising  = B2B_PRODUCTS.filter(p => p.trend === 'up').length;
  const falling = B2B_PRODUCTS.filter(p => p.trend === 'down').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── CBU ticker strip ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Product price ticker */}
          <div className="flex items-center gap-4 overflow-x-auto text-xs">
            <span className="text-slate-600 shrink-0">Bozor:</span>
            {B2B_PRODUCTS.slice(0, 5).map(p => (
              <span key={p.id} className="shrink-0 flex items-center gap-1">
                <span className="text-slate-500">{p.name.split(' ')[0]}</span>
                <span className="text-white font-mono">{fmtB2BPrice(p.pricePerUnit)}</span>
                <span style={{ color: p.trend === 'up' ? '#ef4444' : p.trend === 'down' ? '#10b981' : '#475569' }}>
                  {p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '→'}
                </span>
              </span>
            ))}
          </div>
          {/* CBU rates */}
          {rates && <RateBar rates={rates} />}
          {ratesError && <span className="text-slate-700 text-xs">CBU kurs yuklanmadi</span>}
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white text-xl leading-none">←</button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold">Bozor-Analitika</h1>
              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 text-xs rounded-full border border-blue-900">B2B</span>
            </div>
            <p className="text-slate-500 text-xs">
              {B2B_PRODUCTS.length} ta mahsulot ·
              <span className="text-red-400"> {rising}↑</span> ·
              <span className="text-emerald-400"> {falling}↓</span>
              {rates && <span className="text-slate-600"> · USD: {rates.usd.toFixed(0)} so'm</span>}
            </p>
          </div>
          <button onClick={() => navigate('/interview')}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
            Kredit balli →
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5">

        {/* ── Search ── */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text" value={query}
            onChange={e => { setQuery(e.target.value); setSelectedProduct(undefined); }}
            placeholder="Mahsulot kiriting: un, sement, go'sht..."
            className="w-full pl-9 pr-9 py-3 bg-slate-900 border border-slate-700 focus:border-blue-600 rounded-xl text-white text-sm placeholder-slate-600 outline-none transition-colors"
          />
          {query && (
            <button onClick={() => { setQuery(''); setSelectedProduct(undefined); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
          )}
        </div>

        {/* ── AI Analyst ── */}
        <AIAnalyst rates={rates} productName={query.trim() || undefined} />

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5 overflow-x-auto flex-1">
            {B2B_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 outline-none">
            <option value="price_asc">Narx ↑</option>
            <option value="price_desc">Narx ↓</option>
            <option value="trend">Ko'p o'zgargan</option>
            <option value="name">Nom</option>
          </select>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Mahsulotlar", value: filtered.length, color: 'text-white' },
            { label: "Oshmoqda ↑", value: rising,  color: 'text-red-400' },
            { label: "Tushmoqda ↓", value: falling, color: 'text-emerald-400' },
            { label: "USD bugun",   value: rates ? `${(rates.usd/1000).toFixed(1)}k` : '...', color: rates && rates.usdDiff > 0 ? 'text-red-400' : 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Import pressure alert ── */}
        {rates && rates.usdDiff > 30 && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-950/30 border border-red-900/40 rounded-xl">
            <span className="text-red-400 text-lg shrink-0">⚠️</span>
            <div>
              <p className="text-red-400 text-sm font-medium">Import narxlari oshishi kutilmoqda</p>
              <p className="text-red-300/70 text-xs mt-0.5">
                Dollar bugun +{rates.usdDiff.toFixed(0)} so'm oshdi ({rates.usd.toFixed(0)} so'm).
                Shakar, yog', sement kabi import mahsulotlar narxi 1–3 kunda oshishi mumkin.
              </p>
            </div>
          </div>
        )}

        {/* ── Product grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-slate-400 font-medium">"{query}" topilmadi</p>
            <p className="text-slate-600 text-sm mt-1">Boshqa kalit so'z bilan qidiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelectedProduct(p.name)} className="cursor-pointer">
                <ProductCard p={p} rates={rates} />
              </div>
            ))}
          </div>
        )}

        {/* ── Buy / Sell Ads Board ── */}
        <AdsBoard />

        {/* ── Cross-sell ── */}
        <div className="bg-slate-900 rounded-2xl border border-emerald-900/30 p-5 text-center">
          <p className="text-white font-semibold mb-1">Kredit olishni xohlaysizmi?</p>
          <p className="text-slate-400 text-sm mb-3">Biznes-reja, soliq va kredit tayyorgarlik balli — 5 daqiqada.</p>
          <button onClick={() => navigate('/interview')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">
            Boshlash →
          </button>
        </div>

        <p className="text-center text-slate-700 text-xs pb-2">
          Ma'lumotlar: CBU.uz valyuta kurslari · Chorsu · Ipodrom ulgurji bozori · 2026-yil iyun
        </p>
      </div>
    </div>
  );
}
