/**
 * Bozor.tsx — B2B Ads Board (Muammo 14)
 * Two-column buy / sell ads board for Uzbekistan wholesale market.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Types ─────────────────────────────────────────────────────────────────────

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

// ─── Sample data ───────────────────────────────────────────────────────────────

const SAMPLE_BUY: Ad[] = [
  { id:'b1',  type:'buy', product:"Bug'doy uni (1-nav)",     quantity:'20 tonna',      location:'Toshkent',          price:'',                     contact:'+998 90 123 45 67', date:'30.06.2026', sample:true },
  { id:'b2',  type:'buy', product:'Sement (M400)',            quantity:'50 tonna',      location:'Samarqand',         price:'',                     contact:'+998 91 234 56 78', date:'30.06.2026', sample:true },
  { id:'b3',  type:'buy', product:"Mol go'shti",              quantity:'500 kg',        location:'Namangan',          price:'75 000 so\'m/kg',      contact:'+998 93 345 67 89', date:'29.06.2026', sample:true },
  { id:'b4',  type:'buy', product:'Armitura (d12)',            quantity:'10 tonna',      location:'Jizzax',            price:'',                     contact:'+998 94 456 78 90', date:'29.06.2026', sample:true },
  { id:'b5',  type:'buy', product:'Qand shakar',               quantity:'5 tonna',       location:"Farg'ona",          price:'5 000 so\'m/kg',       contact:'+998 95 567 89 01', date:'28.06.2026', sample:true },
  { id:'b6',  type:'buy', product:'Paxta yogi',                quantity:'2 tonna',       location:'Buxoro',            price:'',                     contact:'+998 97 678 90 12', date:'28.06.2026', sample:true },
  { id:'b7',  type:'buy', product:'Kartoshka',                 quantity:'15 tonna',      location:'Andijon',           price:'2 500 so\'m/kg',       contact:'+998 99 789 01 23', date:'27.06.2026', sample:true },
  { id:'b8',  type:'buy', product:"G'isht (qizil)",            quantity:'50 000 dona',   location:'Toshkent vil.',     price:'',                     contact:'+998 90 890 12 34', date:'27.06.2026', sample:true },
  { id:'b9',  type:'buy', product:'Pomidor',                   quantity:'8 tonna',       location:'Qarshi',            price:'',                     contact:'+998 91 901 23 45', date:'26.06.2026', sample:true },
  { id:'b10', type:'buy', product:"Tovuq go'shti",             quantity:'1 tonna',       location:'Nukus',             price:'30 000 so\'m/kg',      contact:'+998 93 012 34 56', date:'26.06.2026', sample:true },
  { id:'b11', type:'buy', product:"Makkajo'xori",              quantity:'30 tonna',      location:'Termiz',            price:'',                     contact:'+998 94 123 45 60', date:'25.06.2026', sample:true },
  { id:'b12', type:'buy', product:'Gazlama (zigir)',            quantity:'500 metr',      location:'Namangan',          price:'',                     contact:'+998 95 234 56 71', date:'25.06.2026', sample:true },
  { id:'b13', type:'buy', product:"Yog'och (qayin)",           quantity:'5 m³',          location:'Toshkent',          price:'',                     contact:'+998 97 345 67 82', date:'24.06.2026', sample:true },
  { id:'b14', type:'buy', product:"Mineral o'g'it",            quantity:'10 tonna',      location:'Sirdaryo',          price:'',                     contact:'+998 99 456 78 93', date:'24.06.2026', sample:true },
  { id:'b15', type:'buy', product:'Qovoq',                     quantity:'3 tonna',       location:'Xorazm',            price:'',                     contact:'+998 90 567 89 04', date:'23.06.2026', sample:true },
  { id:'b16', type:'buy', product:'Sut (pasterizatsiya)',       quantity:'500 litr/kun',  location:'Toshkent',          price:'5 500 so\'m/litr',     contact:'+998 91 678 90 15', date:'23.06.2026', sample:true },
  { id:'b17', type:'buy', product:'Temir profil',               quantity:'8 tonna',       location:"Farg'ona",          price:'',                     contact:'+998 93 789 01 26', date:'22.06.2026', sample:true },
  { id:'b18', type:'buy', product:"Qovoq urug'i",              quantity:'200 kg',        location:'Qashqadaryo',       price:'',                     contact:'+998 94 890 12 37', date:'22.06.2026', sample:true },
  { id:'b19', type:'buy', product:'Polietilen paket',           quantity:'100 000 dona',  location:'Andijon',           price:'',                     contact:'+998 95 901 23 48', date:'21.06.2026', sample:true },
  { id:'b20', type:'buy', product:"Shifer (7 to'lqin)",        quantity:'2 000 dona',    location:'Samarqand',         price:'',                     contact:'+998 97 012 34 59', date:'21.06.2026', sample:true },
];

const SAMPLE_SELL: Ad[] = [
  { id:'s1',  type:'sell', product:"Bug'doy uni (oliy nav)", quantity:'50 tonna/oy',   location:"Toshkent — Yunusobod",  price:"2 400 so'm/kg",    contact:'+998 90 111 22 33', date:'30.06.2026', sample:true },
  { id:'s2',  type:'sell', product:'Sement (M500, Ohorli)', quantity:'200 tonna',      location:"Quvasoy, Farg'ona",     price:"950 so'm/kg",      contact:'+998 91 222 33 44', date:'30.06.2026', sample:true },
  { id:'s3',  type:'sell', product:"Mol go'shti (sifatli)", quantity:'2 tonna/hafta',  location:"Toshkent — Chorsu",     price:"78 000 so'm/kg",   contact:'+998 93 333 44 55', date:'29.06.2026', sample:true },
  { id:'s4',  type:'sell', product:'Armitura (d10-d16)',    quantity:'30 tonna',       location:"Bektemir, Toshkent",    price:"9 200 so'm/kg",    contact:'+998 94 444 55 66', date:'29.06.2026', sample:true },
  { id:'s5',  type:'sell', product:'Qand shakar (import)',  quantity:'20 tonna',       location:"Samarqand — ombor",     price:"5 100 so'm/kg",    contact:'+998 95 555 66 77', date:'28.06.2026', sample:true },
  { id:'s6',  type:'sell', product:"Paxta yog'i (rafinir)", quantity:'5 tonna',        location:"Andijon — zavod",       price:"15 500 so'm/litr", contact:'+998 97 666 77 88', date:'28.06.2026', sample:true },
  { id:'s7',  type:'sell', product:'Kartoshka (yangi hosil)',quantity:'40 tonna',      location:"Toshkent vil. — Zangi", price:"2 800 so'm/kg",    contact:'+998 99 777 88 99', date:'27.06.2026', sample:true },
  { id:'s8',  type:'sell', product:"G'isht (250×120×65)",  quantity:'100 000 dona',   location:"Samarqand — zavod",     price:"950 so'm/dona",    contact:'+998 90 888 99 00', date:'27.06.2026', sample:true },
  { id:'s9',  type:'sell', product:'Pomidor (issiqxona)',   quantity:'5 tonna/hafta',  location:"Sirdaryo — Guliston",   price:"5 500 so'm/kg",    contact:'+998 91 999 00 11', date:'26.06.2026', sample:true },
  { id:'s10', type:'sell', product:"Tovuq go'shti (ferma)",quantity:'3 tonna',         location:"Toshkent — Sergeli",    price:"33 000 so'm/kg",   contact:'+998 93 000 11 22', date:'26.06.2026', sample:true },
  { id:'s11', type:'sell', product:"Makkajo'xori (quruq)", quantity:'100 tonna',       location:"Jizzax viloyati",       price:"1 900 so'm/kg",    contact:'+998 94 111 22 30', date:'25.06.2026', sample:true },
  { id:'s12', type:'sell', product:'Gazlama (chintz, 80g)',quantity:'2 000 metr',      location:"Namangan — bozor",      price:"12 000 so'm/metr", contact:'+998 95 222 33 41', date:'25.06.2026', sample:true },
  { id:'s13', type:'sell', product:"Yog'och (eman, quruq)",quantity:'20 m³',           location:"Toshkent — Ipodrom",    price:"3 500 000 so'm/m³",contact:'+998 97 333 44 52', date:'24.06.2026', sample:true },
  { id:'s14', type:'sell', product:"Azot o'g'it (karbam)", quantity:'20 tonna',        location:"Navoiy — Karbamid",     price:"3 200 so'm/kg",    contact:'+998 99 444 55 63', date:'24.06.2026', sample:true },
  { id:'s15', type:'sell', product:'Tarvuz (Mitan, katta)',quantity:'15 tonna',        location:"Xorazm — Urganch",      price:"1 200 so'm/kg",    contact:'+998 90 555 66 74', date:'23.06.2026', sample:true },
  { id:'s16', type:'sell', product:"Sut (ferma, yangi)",   quantity:'1 000 litr/kun',  location:"Toshkent vil. — Bo'ka", price:"5 800 so'm/litr",  contact:'+998 91 666 77 85', date:'23.06.2026', sample:true },
  { id:'s17', type:'sell', product:'Temir profil (kvadrat)',quantity:'15 tonna',       location:"Chirchiq — zavod",       price:"8 900 so'm/kg",    contact:'+998 93 777 88 96', date:'22.06.2026', sample:true },
  { id:'s18', type:'sell', product:'Osh (Devzira)',         quantity:'10 tonna',        location:"Farg'ona — Qo'qon",     price:"7 500 so'm/kg",    contact:'+998 94 888 99 07', date:'22.06.2026', sample:true },
  { id:'s19', type:'sell', product:'PVC quvur (d110)',      quantity:'500 metr',        location:"Toshkent — Yunusobod",  price:"28 000 so'm/m",    contact:'+998 95 999 00 18', date:'21.06.2026', sample:true },
  { id:'s20', type:'sell', product:"Yong'oq (yangi hosil)",quantity:'500 kg',          location:"Namangan — Kosonsoy",   price:"45 000 so'm/kg",   contact:'+998 97 000 11 29', date:'21.06.2026', sample:true },
];

const ADS_KEY = 'b2b_user_ads_v1';
function loadUserAds(): Ad[] {
  try { return JSON.parse(localStorage.getItem(ADS_KEY) ?? '[]'); }
  catch { return []; }
}
function saveUserAd(ad: Ad) {
  const all = loadUserAds();
  all.unshift(ad);
  localStorage.setItem(ADS_KEY, JSON.stringify(all.slice(0, 200)));
}

// ─── Unit groups ───────────────────────────────────────────────────────────────

const UNIT_GROUPS = [
  { label: "⚖️ Og'irlik", units: ['kg', 'tonna', 'gramm', 'sentner', 'kvintal'] },
  { label: '🪣 Hajm',     units: ['litr', 'm³', 'sm³'] },
  { label: '📏 Uzunlik',  units: ['metr', 'sm', 'km'] },
  { label: '📐 Maydon',   units: ['m²', 'gektar', 'sotix'] },
  { label: '🔢 Sanoq',    units: ["dona", "ta", "juft", "o'ram", "qop", "blok", "quti", "pallet", "komplekt"] },
];
const ALL_UNITS = UNIT_GROUPS.flatMap(g => g.units);
const FREQ_OPTIONS = [
  { value: '', label: '(bir marta)' },
  { value: '/kun', label: '/kun' },
  { value: '/hafta', label: '/hafta' },
  { value: '/oy', label: '/oy' },
  { value: '/yil', label: '/yil' },
];

// ─── Ad Card ───────────────────────────────────────────────────────────────────

function AdCard({ ad }: { ad: Ad }) {
  const isBuy = ad.type === 'buy';
  return (
    <div className={`
      rounded-xl border p-4 flex flex-col gap-2 transition-all hover:scale-[1.01]
      ${isBuy
        ? 'bg-blue-950/30 border-blue-800/50 hover:border-blue-600/60'
        : 'bg-emerald-950/30 border-emerald-800/50 hover:border-emerald-600/60'}
    `}>
      {/* Product name + date */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-semibold text-sm leading-snug flex-1">{ad.product}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {!ad.sample && (
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-medium">
              YANGI
            </span>
          )}
          <span className="text-slate-600 text-[11px]">{ad.date}</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">📦</span>
          <span className={`text-sm font-semibold ${isBuy ? 'text-blue-300' : 'text-emerald-300'}`}>
            {ad.quantity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <span className="text-slate-300 text-sm">{ad.location}</span>
        </div>
        {ad.price && (
          <div className="flex items-center gap-2">
            <span className="text-base">💵</span>
            <span className={`text-sm font-bold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>
              {ad.price}
            </span>
          </div>
        )}
      </div>

      {/* Contact button */}
      {ad.contact && (
        <a
          href={`tel:${ad.contact.replace(/\s/g, '')}`}
          className={`
            mt-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors
            ${isBuy
              ? 'bg-blue-800/50 hover:bg-blue-700/60 text-blue-200'
              : 'bg-emerald-800/50 hover:bg-emerald-700/60 text-emerald-200'}
          `}
        >
          📞 {ad.contact}
        </a>
      )}
    </div>
  );
}

// ─── Post Ad Modal ─────────────────────────────────────────────────────────────

function PostAdModal({ type, onClose, onPost }: {
  type: 'buy' | 'sell';
  onClose: () => void;
  onPost: (ad: Ad) => void;
}) {
  const [product, setProduct]   = useState('');
  const [amount, setAmount]     = useState('');
  const [unit, setUnit]         = useState('kg');
  const [freq, setFreq]         = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice]       = useState('');
  const [priceUnit, setPriceUnit] = useState('kg');
  const [contact, setContact]   = useState('');
  const [done, setDone]         = useState(false);

  const isBuy = type === 'buy';
  const quantityStr = amount.trim() ? `${amount.trim()} ${unit}${freq}` : '';
  const canSubmit = product.trim() && quantityStr && location.trim();

  const accentBorder = isBuy ? 'focus:border-blue-500' : 'focus:border-emerald-500';
  const inputCls = `w-full px-3 py-2.5 bg-slate-800 border border-slate-700 ${accentBorder} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`;

  const submit = () => {
    if (!canSubmit) return;
    const ad: Ad = {
      id: Date.now().toString(),
      type,
      product: product.trim(),
      quantity: quantityStr,
      location: location.trim(),
      price: price.trim() ? `${price.trim()} so'm/${priceUnit}` : '',
      contact: contact.trim(),
      date: new Date().toLocaleDateString('uz-UZ'),
    };
    saveUserAd(ad);
    onPost(ad);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className={`px-5 py-4 border-b border-slate-800 flex items-center justify-between ${isBuy ? 'bg-blue-900/25' : 'bg-emerald-900/25'}`}>
          <div>
            <p className={`font-bold text-base ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>
              {isBuy ? "🛒 Xarid e'loni joylash" : "💰 Sotuv e'loni joylash"}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {isBuy ? 'Nima sotib olmoqchisiz?' : 'Nima sotmoqchisiz?'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Product name */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              Mahsulot nomi <span className="text-red-400">*</span>
            </label>
            <input
              value={product} onChange={e => setProduct(e.target.value)}
              placeholder={isBuy ? "Sement, un, armitura, go'sht..." : "Kartoshka, gazlama, yog'och, guruch..."}
              className={inputCls}
              autoFocus
            />
          </div>

          {/* Quantity row */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              Miqdor <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Raqam"
                className={`w-28 shrink-0 px-3 py-2.5 bg-slate-800 border border-slate-700 ${accentBorder} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`}
              />
              <select
                value={unit} onChange={e => setUnit(e.target.value)}
                className={`flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 ${accentBorder} rounded-xl text-white text-sm outline-none transition-colors`}
              >
                {UNIT_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </optgroup>
                ))}
              </select>
              <select
                value={freq} onChange={e => setFreq(e.target.value)}
                className={`w-32 shrink-0 px-2 py-2.5 bg-slate-800 border border-slate-700 ${accentBorder} rounded-xl text-white text-sm outline-none transition-colors`}
              >
                {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            {quantityStr && (
              <p className="text-xs text-slate-500 mt-1.5">
                📦 Ko'rinishi: <span className={`font-semibold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>{quantityStr}</span>
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              {isBuy ? 'Qayerga yetkazish kerak?' : 'Qayerdan olish mumkin?'} <span className="text-red-400">*</span>
            </label>
            <input
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder={isBuy ? 'Toshkent, Samarqand, viloyat...' : 'Chorsu bozori, zavod, ombor manzili...'}
              className={inputCls}
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              {isBuy ? 'Maqsadli narx (ixtiyoriy)' : 'Sotuv narxi (ixtiyoriy)'}
            </label>
            <div className="flex gap-2 items-center">
              <input
                value={price} onChange={e => setPrice(e.target.value)}
                placeholder={isBuy ? 'Maksimal narx: 9 000' : 'Narx: 9 500'}
                className={`flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 ${accentBorder} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`}
              />
              <span className="text-slate-500 text-sm shrink-0">so'm /</span>
              <select
                value={priceUnit} onChange={e => setPriceUnit(e.target.value)}
                className={`w-24 shrink-0 px-2 py-2.5 bg-slate-800 border border-slate-700 ${accentBorder} rounded-xl text-white text-sm outline-none transition-colors`}
              >
                {ALL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Telefon raqam</label>
            <input
              value={contact} onChange={e => setContact(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={inputCls}
            />
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`
              w-full py-3 rounded-xl text-white text-sm font-bold transition-all
              disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
              ${done
                ? 'bg-green-600'
                : isBuy
                  ? 'bg-blue-700 hover:bg-blue-600 active:scale-95'
                  : 'bg-emerald-700 hover:bg-emerald-600 active:scale-95'}
            `}
          >
            {done
              ? "✓ E'lon muvaffaqiyatli joylashtirildi!"
              : isBuy
                ? "🛒 Xarid e'lonini joylash"
                : "💰 Sotuv e'lonini joylash"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Bozor() {
  const navigate = useNavigate();
  const [userAds, setUserAds] = useState<Ad[]>(loadUserAds);
  const [modal, setModal]     = useState<'buy' | 'sell' | null>(null);
  const [search, setSearch]   = useState('');

  // Reload from localStorage when modal closes
  useEffect(() => {
    if (!modal) setUserAds(loadUserAds());
  }, [modal]);

  const onPost = () => setUserAds(loadUserAds());

  // Filter
  const q = search.toLowerCase().trim();
  const allBuy  = [...userAds.filter(a => a.type === 'buy'),  ...SAMPLE_BUY];
  const allSell = [...userAds.filter(a => a.type === 'sell'), ...SAMPLE_SELL];
  const buyAds  = q ? allBuy.filter(a => a.product.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) : allBuy;
  const sellAds = q ? allSell.filter(a => a.product.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) : allSell;

  const userBuyCount  = userAds.filter(a => a.type === 'buy').length;
  const userSellCount = userAds.filter(a => a.type === 'sell').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white text-xl leading-none shrink-0">←</button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-white font-bold text-lg">Bozor-Analitika</h1>
              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 text-xs rounded-full border border-blue-900 font-medium">B2B</span>
            </div>
            <p className="text-slate-500 text-xs">
              {buyAds.length} ta xarid · {sellAds.length} ta sotuv
              {(userBuyCount + userSellCount) > 0 && (
                <span className="text-amber-400"> · {userBuyCount + userSellCount} ta sizning e'loningiz</span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="shrink-0 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            🤖 Maslahat →
          </button>
        </div>
      </header>

      {/* ── Action bar ── */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="E'lonlarda qidirish: sement, kartoshka, Toshkent..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-800 border border-slate-700 focus:border-blue-600 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
            )}
          </div>

          {/* Post buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setModal('buy')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <span className="text-base">🛒</span>
              <span>Sotib olaman</span>
            </button>
            <button
              onClick={() => setModal('sell')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all"
            >
              <span className="text-base">💰</span>
              <span>Sotaman</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Two-column board ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className="grid grid-cols-2 gap-4 h-full" style={{ gridTemplateColumns: '1fr 1fr' }}>

          {/* ── BUYERS column ── */}
          <div className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-3 h-3 bg-blue-400 rounded-full shrink-0" />
              <h2 className="text-blue-400 font-bold text-sm tracking-wide">XARIDORLAR</h2>
              <span className="ml-auto text-slate-600 text-xs font-medium">{buyAds.length} ta e'lon</span>
            </div>

            {/* Cards */}
            <div className="space-y-3 overflow-y-auto pb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {buyAds.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm">"{search}" bo'yicha e'lon topilmadi</p>
                </div>
              ) : (
                buyAds.map(ad => <AdCard key={ad.id} ad={ad} />)
              )}
            </div>
          </div>

          {/* ── SELLERS column ── */}
          <div className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-3 h-3 bg-emerald-400 rounded-full shrink-0" />
              <h2 className="text-emerald-400 font-bold text-sm tracking-wide">SOTUVCHILAR</h2>
              <span className="ml-auto text-slate-600 text-xs font-medium">{sellAds.length} ta e'lon</span>
            </div>

            {/* Cards */}
            <div className="space-y-3 overflow-y-auto pb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {sellAds.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-sm">"{search}" bo'yicha e'lon topilmadi</p>
                </div>
              ) : (
                sellAds.map(ad => <AdCard key={ad.id} ad={ad} />)
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <PostAdModal
          type={modal}
          onClose={() => setModal(null)}
          onPost={onPost}
        />
      )}

      {/* ── Footer ── */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-4 py-2.5 text-center">
        <p className="text-slate-700 text-xs">
          Chorsu · Ipodrom ulgurji bozori · 2026-yil iyun · BiznesPlan AI
        </p>
      </div>
    </div>
  );
}
