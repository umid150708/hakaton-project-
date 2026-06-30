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
  price: string;
  contact: string;
  date: string;
  sample?: boolean;
}

const SAMPLE_BUY: Ad[] = [
  { id:'b1',  type:'buy', product:"Bug'doy uni (1-nav)", quantity:'20 tonna',   location:"Toshkent",      price:'',                    contact:'+998 90 123 45 67', date:'30.06.2026', sample:true },
  { id:'b2',  type:'buy', product:'Sement (M400)',       quantity:'50 tonna',   location:"Samarqand",     price:'',                    contact:'+998 91 234 56 78', date:'30.06.2026', sample:true },
  { id:'b3',  type:'buy', product:"Mol go'shti",         quantity:'500 kg',     location:"Namangan",      price:'',                    contact:'+998 93 345 67 89', date:'29.06.2026', sample:true },
  { id:'b4',  type:'buy', product:'Armitura (d12)',       quantity:'10 tonna',   location:"Jizzax",        price:'',                    contact:'+998 94 456 78 90', date:'29.06.2026', sample:true },
  { id:'b5',  type:'buy', product:'Qand shakar',          quantity:'5 tonna',    location:"Farg'ona",      price:'',                    contact:'+998 95 567 89 01', date:'28.06.2026', sample:true },
  { id:'b6',  type:'buy', product:'Paxta yogi',           quantity:'2 tonna',    location:"Buxoro",        price:'',                    contact:'+998 97 678 90 12', date:'28.06.2026', sample:true },
  { id:'b7',  type:'buy', product:'Kartoshka',            quantity:'15 tonna',   location:"Andijon",       price:'',                    contact:'+998 99 789 01 23', date:'27.06.2026', sample:true },
  { id:'b8',  type:'buy', product:"G'isht (qizil)",       quantity:'50 000 dona',location:"Toshkent vil.", price:'',                    contact:'+998 90 890 12 34', date:'27.06.2026', sample:true },
  { id:'b9',  type:'buy', product:'Pomidor',              quantity:'8 tonna',    location:"Qarshi",        price:'',                    contact:'+998 91 901 23 45', date:'26.06.2026', sample:true },
  { id:'b10', type:'buy', product:'Tovuq go\'shti',       quantity:'1 tonna',    location:"Nukus",         price:'',                    contact:'+998 93 012 34 56', date:'26.06.2026', sample:true },
  { id:'b11', type:'buy', product:'Makkajo\'xori',        quantity:'30 tonna',   location:"Termiz",        price:'',                    contact:'+998 94 123 45 60', date:'25.06.2026', sample:true },
  { id:'b12', type:'buy', product:'Gazlama (zigir)',      quantity:'500 metr',   location:"Namangan",      price:'',                    contact:'+998 95 234 56 71', date:'25.06.2026', sample:true },
  { id:'b13', type:'buy', product:'Yog\'och (qayin)',     quantity:'5 m³',       location:"Toshkent",      price:'',                    contact:'+998 97 345 67 82', date:'24.06.2026', sample:true },
  { id:'b14', type:'buy', product:'Mineral o\'g\'it',     quantity:'10 tonna',   location:"Sirdaryo",      price:'',                    contact:'+998 99 456 78 93', date:'24.06.2026', sample:true },
  { id:'b15', type:'buy', product:'Qovoq',                quantity:'3 tonna',    location:"Xorazm",        price:'',                    contact:'+998 90 567 89 04', date:'23.06.2026', sample:true },
  { id:'b16', type:'buy', product:'Sut (pasterizatsiya)', quantity:'500 litr/kun',location:"Toshkent",     price:'',                    contact:'+998 91 678 90 15', date:'23.06.2026', sample:true },
  { id:'b17', type:'buy', product:'Temir profil',         quantity:'8 tonna',    location:"Farg'ona",      price:'',                    contact:'+998 93 789 01 26', date:'22.06.2026', sample:true },
  { id:'b18', type:'buy', product:'Qovoq urug\'i',        quantity:'200 kg',     location:"Qashqadaryo",   price:'',                    contact:'+998 94 890 12 37', date:'22.06.2026', sample:true },
  { id:'b19', type:'buy', product:'Polietilen paket',     quantity:'100 000 dona',location:"Andijon",      price:'',                    contact:'+998 95 901 23 48', date:'21.06.2026', sample:true },
  { id:'b20', type:'buy', product:'Shifer (7 to\'lqin)',  quantity:'2 000 dona', location:"Samarqand",     price:'',                    contact:'+998 97 012 34 59', date:'21.06.2026', sample:true },
];

const SAMPLE_SELL: Ad[] = [
  { id:'s1',  type:'sell', product:"Bug'doy uni (oliy nav)", quantity:'50 tonna/oy',  location:"Toshkent — Yunusobod",  price:"2 400 so'm/kg",   contact:'+998 90 111 22 33', date:'30.06.2026', sample:true },
  { id:'s2',  type:'sell', product:'Sement (M500, Ohorli)', quantity:'200 tonna',     location:"Quvasoy, Farg'ona",     price:"950 so'm/kg",     contact:'+998 91 222 33 44', date:'30.06.2026', sample:true },
  { id:'s3',  type:'sell', product:"Mol go'shti (sifatli)", quantity:'2 tonna/hafta', location:"Toshkent — Chorsu",     price:"78 000 so'm/kg",  contact:'+998 93 333 44 55', date:'29.06.2026', sample:true },
  { id:'s4',  type:'sell', product:'Armitura (d10-d16)',    quantity:'30 tonna',      location:"Bektemir, Toshkent",    price:"9 200 so'm/kg",   contact:'+998 94 444 55 66', date:'29.06.2026', sample:true },
  { id:'s5',  type:'sell', product:'Qand shakar (import)',  quantity:'20 tonna',      location:"Samarqand — ombor",     price:"5 100 so'm/kg",   contact:'+998 95 555 66 77', date:'28.06.2026', sample:true },
  { id:'s6',  type:'sell', product:'Paxta yog\'i (rafinir)',quantity:'5 tonna',       location:"Andijon — zavod",       price:"15 500 so'm/litr",contact:'+998 97 666 77 88', date:'28.06.2026', sample:true },
  { id:'s7',  type:'sell', product:'Kartoshka (yangi hosil)',quantity:'40 tonna',     location:"Toshkent vil. — Zangi", price:"2 800 so'm/kg",   contact:'+998 99 777 88 99', date:'27.06.2026', sample:true },
  { id:'s8',  type:'sell', product:"G'isht (250×120×65)",   quantity:'100 000 dona',  location:"Samarqand — zavod",     price:"950 so'm/dona",   contact:'+998 90 888 99 00', date:'27.06.2026', sample:true },
  { id:'s9',  type:'sell', product:'Pomidor (issiqxona)',   quantity:'5 tonna/hafta', location:"Sirdaryo — Guliston",   price:"5 500 so'm/kg",   contact:'+998 91 999 00 11', date:'26.06.2026', sample:true },
  { id:'s10', type:'sell', product:"Tovuq go'shti (ferma)", quantity:'3 tonna',       location:"Toshkent — Sergeli",    price:"33 000 so'm/kg",  contact:'+998 93 000 11 22', date:'26.06.2026', sample:true },
  { id:'s11', type:'sell', product:'Makkajo\'xori (quruq)', quantity:'100 tonna',     location:"Jizzax viloyati",       price:"1 900 so'm/kg",   contact:'+998 94 111 22 30', date:'25.06.2026', sample:true },
  { id:'s12', type:'sell', product:'Gazlama (chintz, 80g)', quantity:'2 000 metr',    location:"Namangan — bozor",      price:"12 000 so'm/metr",contact:'+998 95 222 33 41', date:'25.06.2026', sample:true },
  { id:'s13', type:'sell', product:'Yog\'och (eman, quruq)',quantity:'20 m³',         location:"Toshkent — Ipodrom",    price:"3 500 000 so'm/m³",contact:'+998 97 333 44 52',date:'24.06.2026', sample:true },
  { id:'s14', type:'sell', product:'Azot o\'g\'it (karbam)',quantity:'20 tonna',      location:"Navoiy — Karbamid",     price:"3 200 so'm/kg",   contact:'+998 99 444 55 63', date:'24.06.2026', sample:true },
  { id:'s15', type:'sell', product:'Tarvuz (Mitan, katta)', quantity:'15 tonna',      location:"Xorazm — Urganch",      price:"1 200 so'm/kg",   contact:'+998 90 555 66 74', date:'23.06.2026', sample:true },
  { id:'s16', type:'sell', product:'Sut (ferma, yangi)',    quantity:'1 000 litr/kun',location:"Toshkent vil. — Bo'ka", price:"5 800 so'm/litr", contact:'+998 91 666 77 85', date:'23.06.2026', sample:true },
  { id:'s17', type:'sell', product:'Temir profil (kvadrat)',quantity:'15 tonna',      location:"Chirchiq — zavod",       price:"8 900 so'm/kg",   contact:'+998 93 777 88 96', date:'22.06.2026', sample:true },
  { id:'s18', type:'sell', product:'Osh (Devzira)',         quantity:'10 tonna',      location:"Farg'ona — Qo'qon",     price:"7 500 so'm/kg",   contact:'+998 94 888 99 07', date:'22.06.2026', sample:true },
  { id:'s19', type:'sell', product:'PVC quvur (d110)',      quantity:'500 metr',      location:"Toshkent — Yunusobod",  price:"28 000 so'm/m",   contact:'+998 95 999 00 18', date:'21.06.2026', sample:true },
  { id:'s20', type:'sell', product:'Yong\'oq (yangi hosil)',quantity:'500 kg',        location:"Namangan — Kosonsoy",   price:"45 000 so'm/kg",  contact:'+998 97 000 11 29', date:'21.06.2026', sample:true },
];

const ADS_KEY = 'b2b_user_ads_v1';

function loadUserAds(): Ad[] {
  try { return JSON.parse(localStorage.getItem(ADS_KEY) ?? '[]'); }
  catch { return []; }
}
function saveUserAd(ad: Ad) {
  const all = loadUserAds();
  all.unshift(ad);
  localStorage.setItem(ADS_KEY, JSON.stringify(all.slice(0, 100)));
}

function AdCard({ ad }: { ad: Ad }) {
  const isBuy = ad.type === 'buy';
  return (
    <div className={`p-3 rounded-xl border ${isBuy ? 'bg-blue-950/20 border-blue-900/40' : 'bg-emerald-950/20 border-emerald-900/40'}`}>
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <p className="text-white text-xs font-semibold leading-snug">{ad.product}</p>
        {ad.sample && <span className="text-slate-700 text-xs shrink-0">{ad.date}</span>}
        {!ad.sample && <span className="text-xs px-1.5 py-0.5 bg-amber-900/40 text-amber-400 rounded-full shrink-0">Yangi</span>}
      </div>
      <div className="space-y-0.5">
        <p className="text-slate-400 text-xs">📦 {ad.quantity}</p>
        <p className="text-slate-400 text-xs">📍 {ad.location}</p>
        {ad.price && <p className={`text-xs font-medium ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>💵 {ad.price}</p>}
        {ad.contact && <p className="text-slate-500 text-xs">📞 {ad.contact}</p>}
      </div>
    </div>
  );
}

function PostAdModal({ type, onClose, onPost }: { type: 'buy'|'sell'; onClose: () => void; onPost: (ad: Ad) => void }) {
  const [product, setProduct]   = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice]       = useState('');
  const [contact, setContact]   = useState('');
  const [done, setDone]         = useState(false);
  const isBuy = type === 'buy';
  const canSubmit = product.trim() && quantity.trim() && location.trim();

  const submit = () => {
    if (!canSubmit) return;
    const ad: Ad = {
      id: Date.now().toString(),
      type,
      product: product.trim(),
      quantity: quantity.trim(),
      location: location.trim(),
      price: price.trim(),
      contact: contact.trim(),
      date: new Date().toLocaleDateString('uz-UZ'),
    };
    saveUserAd(ad);
    onPost(ad);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`px-4 py-3 border-b border-slate-800 flex items-center justify-between ${isBuy ? 'bg-blue-900/20' : 'bg-emerald-900/20'}`}>
          <p className={`font-semibold text-sm ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>
            {isBuy ? "🛒 Xarid e'loni" : "💰 Sotuv e'loni"}
          </p>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-4 space-y-2">
          <input value={product} onChange={e => setProduct(e.target.value)}
            placeholder={isBuy ? "Nima kerak? (sement, un, go'sht...)" : "Nima sotasiz? (armitura, kartoshka...)"}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 outline-none focus:border-blue-600" />
          <div className="grid grid-cols-2 gap-2">
            <input value={quantity} onChange={e => setQuantity(e.target.value)}
              placeholder="Miqdor (10 tonna, 500 kg)"
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600" />
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder={isBuy ? "Qayerga? (Jizzax...)" : "Qayerdan? (Toshkent...)"}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600" />
            {!isBuy && (
              <input value={price} onChange={e => setPrice(e.target.value)}
                placeholder="Narx (9 500 so'm/kg)"
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-emerald-600" />
            )}
            <input value={contact} onChange={e => setContact(e.target.value)}
              placeholder="Telefon raqam"
              className={`px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 outline-none focus:border-blue-600 ${isBuy ? 'col-span-2' : ''}`} />
          </div>
          <button onClick={submit} disabled={!canSubmit}
            className={`w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors disabled:bg-slate-800 disabled:text-slate-600 ${isBuy ? 'bg-blue-700 hover:bg-blue-600' : 'bg-emerald-700 hover:bg-emerald-600'}`}>
            {done ? "✓ E'lon joylashtirildi!" : isBuy ? "🛒 Xarid e'lonini joylash" : "💰 Sotuv e'lonini joylash"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdsBoard() {
  const [userAds, setUserAds] = useState<Ad[]>(loadUserAds);
  const [modal, setModal]     = useState<'buy' | 'sell' | null>(null);

  const buyAds  = [...userAds.filter(a => a.type === 'buy'),  ...SAMPLE_BUY];
  const sellAds = [...userAds.filter(a => a.type === 'sell'), ...SAMPLE_SELL];

  const onPost = (ad: Ad) => setUserAds(loadUserAds());

  return (
    <>
      {modal && <PostAdModal type={modal} onClose={() => setModal(null)} onPost={onPost} />}

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-semibold">📢 Xaridorlar va Sotuvchilar</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {buyAds.length} ta xarid · {sellAds.length} ta sotuv e'loni
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModal('buy')}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors">
              🛒 Sotib olaman
            </button>
            <button onClick={() => setModal('sell')}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors">
              💰 Sotaman
            </button>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-2 divide-x divide-slate-800">
          {/* Buy column */}
          <div>
            <div className="px-3 py-2 bg-blue-950/30 border-b border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              <p className="text-blue-400 text-xs font-semibold">XARIDORLAR ({buyAds.length})</p>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-[480px] overflow-y-auto">
              {buyAds.map(ad => (
                <div key={ad.id} className="p-2.5">
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          </div>

          {/* Sell column */}
          <div>
            <div className="px-3 py-2 bg-emerald-950/30 border-b border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <p className="text-emerald-400 text-xs font-semibold">SOTUVCHILAR ({sellAds.length})</p>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-[480px] overflow-y-auto">
              {sellAds.map(ad => (
                <div key={ad.id} className="p-2.5">
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
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

        {/* ── Buy / Sell Ads Board ── */}
        <AdsBoard />

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
