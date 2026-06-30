/**
 * Bozor.tsx — B2B Marketplace (Muammo 14)
 * Toggle Buy/Sell · Category filters · AI market strip
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Categories ────────────────────────────────────────────────────────────────

type Category =
  | 'all'
  | 'grain'    // Don & Un
  | 'meat'     // Go'sht & Sut
  | 'veg'      // Sabzavot & Meva
  | 'build'    // Qurilish materiallari
  | 'food'     // Oziq-ovqat mahsulotlari
  | 'textile'  // Gazlama & Tikuv
  | 'agri'     // Qishloq xo'jaligi
  | 'other';   // Boshqa

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'all',     label: 'Barchasi',       icon: '🗂️' },
  { id: 'grain',   label: "Don & Un",       icon: '🌾' },
  { id: 'build',   label: 'Qurilish',       icon: '🏗️' },
  { id: 'meat',    label: "Go'sht & Sut",   icon: '🥩' },
  { id: 'veg',     label: 'Sabzavot & Meva',icon: '🥦' },
  { id: 'food',    label: 'Oziq-ovqat',     icon: '🍯' },
  { id: 'textile', label: 'Gazlama',        icon: '👗' },
  { id: 'agri',    label: "Qishloq xo'j.",  icon: '🌱' },
  { id: 'other',   label: 'Boshqa',         icon: '📦' },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Ad {
  id: string;
  type: 'buy' | 'sell';
  category: Category;
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
  { id:'b1',  type:'buy', category:'grain',   product:"Bug'doy uni (1-nav)",   quantity:'20 tonna',      location:'Toshkent',          price:'',                  contact:'+998 90 123 45 67', date:'30.06.2026', sample:true },
  { id:'b2',  type:'buy', category:'build',   product:'Sement (M400)',          quantity:'50 tonna',      location:'Samarqand',         price:'',                  contact:'+998 91 234 56 78', date:'30.06.2026', sample:true },
  { id:'b3',  type:'buy', category:'meat',    product:"Mol go'shti",            quantity:'500 kg',        location:'Namangan',          price:"75 000 so'm/kg",    contact:'+998 93 345 67 89', date:'29.06.2026', sample:true },
  { id:'b4',  type:'buy', category:'build',   product:'Armitura (d12)',          quantity:'10 tonna',      location:'Jizzax',            price:'',                  contact:'+998 94 456 78 90', date:'29.06.2026', sample:true },
  { id:'b5',  type:'buy', category:'food',    product:'Qand shakar',             quantity:'5 tonna',       location:"Farg'ona",          price:"5 000 so'm/kg",     contact:'+998 95 567 89 01', date:'28.06.2026', sample:true },
  { id:'b6',  type:'buy', category:'food',    product:'Paxta yogi',              quantity:'2 tonna',       location:'Buxoro',            price:'',                  contact:'+998 97 678 90 12', date:'28.06.2026', sample:true },
  { id:'b7',  type:'buy', category:'veg',     product:'Kartoshka',               quantity:'15 tonna',      location:'Andijon',           price:"2 500 so'm/kg",     contact:'+998 99 789 01 23', date:'27.06.2026', sample:true },
  { id:'b8',  type:'buy', category:'build',   product:"G'isht (qizil)",          quantity:'50 000 dona',   location:'Toshkent vil.',     price:'',                  contact:'+998 90 890 12 34', date:'27.06.2026', sample:true },
  { id:'b9',  type:'buy', category:'veg',     product:'Pomidor',                 quantity:'8 tonna',       location:'Qarshi',            price:'',                  contact:'+998 91 901 23 45', date:'26.06.2026', sample:true },
  { id:'b10', type:'buy', category:'meat',    product:"Tovuq go'shti",           quantity:'1 tonna',       location:'Nukus',             price:"30 000 so'm/kg",    contact:'+998 93 012 34 56', date:'26.06.2026', sample:true },
  { id:'b11', type:'buy', category:'grain',   product:"Makkajo'xori",            quantity:'30 tonna',      location:'Termiz',            price:'',                  contact:'+998 94 123 45 60', date:'25.06.2026', sample:true },
  { id:'b12', type:'buy', category:'textile', product:'Gazlama (zigir)',          quantity:'500 metr',      location:'Namangan',          price:'',                  contact:'+998 95 234 56 71', date:'25.06.2026', sample:true },
  { id:'b13', type:'buy', category:'build',   product:"Yog'och (qayin)",         quantity:'5 m³',          location:'Toshkent',          price:'',                  contact:'+998 97 345 67 82', date:'24.06.2026', sample:true },
  { id:'b14', type:'buy', category:'agri',    product:"Mineral o'g'it",          quantity:'10 tonna',      location:'Sirdaryo',          price:'',                  contact:'+998 99 456 78 93', date:'24.06.2026', sample:true },
  { id:'b15', type:'buy', category:'veg',     product:'Qovoq',                   quantity:'3 tonna',       location:'Xorazm',            price:'',                  contact:'+998 90 567 89 04', date:'23.06.2026', sample:true },
  { id:'b16', type:'buy', category:'meat',    product:'Sut (pasterizatsiya)',     quantity:'500 litr/kun',  location:'Toshkent',          price:"5 500 so'm/litr",   contact:'+998 91 678 90 15', date:'23.06.2026', sample:true },
  { id:'b17', type:'buy', category:'build',   product:'Temir profil',             quantity:'8 tonna',       location:"Farg'ona",          price:'',                  contact:'+998 93 789 01 26', date:'22.06.2026', sample:true },
  { id:'b18', type:'buy', category:'agri',    product:"Qovoq urug'i",            quantity:'200 kg',        location:'Qashqadaryo',       price:'',                  contact:'+998 94 890 12 37', date:'22.06.2026', sample:true },
  { id:'b19', type:'buy', category:'other',   product:'Polietilen paket',         quantity:'100 000 dona',  location:'Andijon',           price:'',                  contact:'+998 95 901 23 48', date:'21.06.2026', sample:true },
  { id:'b20', type:'buy', category:'build',   product:"Shifer (7 to'lqin)",      quantity:'2 000 dona',    location:'Samarqand',         price:'',                  contact:'+998 97 012 34 59', date:'21.06.2026', sample:true },
];

const SAMPLE_SELL: Ad[] = [
  { id:'s1',  type:'sell', category:'grain',   product:"Bug'doy uni (oliy nav)",  quantity:'50 tonna/oy',    location:"Toshkent — Yunusobod",  price:"2 400 so'm/kg",     contact:'+998 90 111 22 33', date:'30.06.2026', sample:true },
  { id:'s2',  type:'sell', category:'build',   product:'Sement (M500, Ohorli)',   quantity:'200 tonna',      location:"Quvasoy, Farg'ona",     price:"950 so'm/kg",       contact:'+998 91 222 33 44', date:'30.06.2026', sample:true },
  { id:'s3',  type:'sell', category:'meat',    product:"Mol go'shti (sifatli)",   quantity:'2 tonna/hafta',  location:'Toshkent — Chorsu',     price:"78 000 so'm/kg",    contact:'+998 93 333 44 55', date:'29.06.2026', sample:true },
  { id:'s4',  type:'sell', category:'build',   product:'Armitura (d10-d16)',       quantity:'30 tonna',       location:'Bektemir, Toshkent',    price:"9 200 so'm/kg",     contact:'+998 94 444 55 66', date:'29.06.2026', sample:true },
  { id:'s5',  type:'sell', category:'food',    product:'Qand shakar (import)',     quantity:'20 tonna',       location:'Samarqand — ombor',     price:"5 100 so'm/kg",     contact:'+998 95 555 66 77', date:'28.06.2026', sample:true },
  { id:'s6',  type:'sell', category:'food',    product:"Paxta yog'i (rafinir)",   quantity:'5 tonna',        location:'Andijon — zavod',        price:"15 500 so'm/litr",  contact:'+998 97 666 77 88', date:'28.06.2026', sample:true },
  { id:'s7',  type:'sell', category:'veg',     product:'Kartoshka (yangi hosil)', quantity:'40 tonna',       location:'Toshkent vil. — Zangi', price:"2 800 so'm/kg",     contact:'+998 99 777 88 99', date:'27.06.2026', sample:true },
  { id:'s8',  type:'sell', category:'build',   product:"G'isht (250×120×65)",    quantity:'100 000 dona',   location:'Samarqand — zavod',     price:"950 so'm/dona",     contact:'+998 90 888 99 00', date:'27.06.2026', sample:true },
  { id:'s9',  type:'sell', category:'veg',     product:'Pomidor (issiqxona)',     quantity:'5 tonna/hafta',  location:'Sirdaryo — Guliston',   price:"5 500 so'm/kg",     contact:'+998 91 999 00 11', date:'26.06.2026', sample:true },
  { id:'s10', type:'sell', category:'meat',    product:"Tovuq go'shti (ferma)",  quantity:'3 tonna',        location:'Toshkent — Sergeli',    price:"33 000 so'm/kg",    contact:'+998 93 000 11 22', date:'26.06.2026', sample:true },
  { id:'s11', type:'sell', category:'grain',   product:"Makkajo'xori (quruq)",   quantity:'100 tonna',      location:'Jizzax viloyati',        price:"1 900 so'm/kg",     contact:'+998 94 111 22 30', date:'25.06.2026', sample:true },
  { id:'s12', type:'sell', category:'textile', product:'Gazlama (chintz, 80g)',  quantity:'2 000 metr',     location:'Namangan — bozor',       price:"12 000 so'm/metr",  contact:'+998 95 222 33 41', date:'25.06.2026', sample:true },
  { id:'s13', type:'sell', category:'build',   product:"Yog'och (eman, quruq)",  quantity:'20 m³',          location:'Toshkent — Ipodrom',    price:"3 500 000 so'm/m³", contact:'+998 97 333 44 52', date:'24.06.2026', sample:true },
  { id:'s14', type:'sell', category:'agri',    product:"Azot o'g'it (karbam)",   quantity:'20 tonna',       location:'Navoiy — Karbamid',     price:"3 200 so'm/kg",     contact:'+998 99 444 55 63', date:'24.06.2026', sample:true },
  { id:'s15', type:'sell', category:'veg',     product:'Tarvuz (Mitan, katta)',  quantity:'15 tonna',       location:'Xorazm — Urganch',      price:"1 200 so'm/kg",     contact:'+998 90 555 66 74', date:'23.06.2026', sample:true },
  { id:'s16', type:'sell', category:'meat',    product:"Sut (ferma, yangi)",     quantity:'1 000 litr/kun', location:"Toshkent vil. — Bo'ka", price:"5 800 so'm/litr",   contact:'+998 91 666 77 85', date:'23.06.2026', sample:true },
  { id:'s17', type:'sell', category:'build',   product:'Temir profil (kvadrat)', quantity:'15 tonna',       location:'Chirchiq — zavod',       price:"8 900 so'm/kg",     contact:'+998 93 777 88 96', date:'22.06.2026', sample:true },
  { id:'s18', type:'sell', category:'grain',   product:'Osh (Devzira)',          quantity:'10 tonna',       location:"Farg'ona — Qo'qon",     price:"7 500 so'm/kg",     contact:'+998 94 888 99 07', date:'22.06.2026', sample:true },
  { id:'s19', type:'sell', category:'build',   product:'PVC quvur (d110)',       quantity:'500 metr',       location:'Toshkent — Yunusobod',  price:"28 000 so'm/m",     contact:'+998 95 999 00 18', date:'21.06.2026', sample:true },
  { id:'s20', type:'sell', category:'food',    product:"Yong'oq (yangi hosil)",  quantity:'500 kg',         location:'Namangan — Kosonsoy',   price:"45 000 so'm/kg",    contact:'+998 97 000 11 29', date:'21.06.2026', sample:true },
];

// ─── LocalStorage ──────────────────────────────────────────────────────────────

const ADS_KEY = 'b2b_user_ads_v2';
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
  { label: '🔢 Sanoq',    units: ['dona', 'ta', 'juft', "o'ram", 'qop', 'blok', 'quti', 'pallet', 'komplekt'] },
];
const ALL_UNITS = UNIT_GROUPS.flatMap(g => g.units);
const FREQ_OPTIONS = [
  { value: '', label: '(bir marta)' },
  { value: '/kun', label: '/kun' },
  { value: '/hafta', label: '/hafta' },
  { value: '/oy', label: '/oy' },
  { value: '/yil', label: '/yil' },
];

// ─── Category badge ────────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: Category }) {
  const c = CATEGORIES.find(x => x.id === cat);
  if (!c || cat === 'all') return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-medium">
      {c.icon} {c.label}
    </span>
  );
}

// ─── Ad Card ───────────────────────────────────────────────────────────────────

function AdCard({ ad }: { ad: Ad }) {
  const isBuy = ad.type === 'buy';
  return (
    <div className={`
      rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200
      hover:shadow-lg hover:-translate-y-0.5 cursor-default
      ${isBuy
        ? 'bg-slate-900 border-blue-900/50 hover:border-blue-600/60'
        : 'bg-slate-900 border-emerald-900/50 hover:border-emerald-600/60'}
    `}>
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-semibold text-sm leading-snug flex-1">{ad.product}</p>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {!ad.sample
            ? <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-semibold">YANGI</span>
            : <span className="text-slate-700 text-[11px]">{ad.date}</span>
          }
        </div>
      </div>

      {/* Category badge */}
      <CatBadge cat={ad.category} />

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <span className={`text-sm font-bold ${isBuy ? 'text-blue-300' : 'text-emerald-300'}`}>{ad.quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <span className="text-slate-300 text-sm">{ad.location}</span>
        </div>
        {ad.price && (
          <div className="flex items-center gap-2">
            <span className="text-base">💵</span>
            <span className={`text-sm font-bold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>{ad.price}</span>
          </div>
        )}
      </div>

      {/* Call */}
      {ad.contact && (
        <a
          href={`tel:${ad.contact.replace(/\s/g, '')}`}
          className={`
            flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${isBuy
              ? 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800/50'
              : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-800/50'}
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
  const [category, setCategory] = useState<Category>('grain');
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
  const canSubmit = category !== 'all' && product.trim() && quantityStr && location.trim();
  const ring = isBuy ? 'focus:border-blue-500' : 'focus:border-emerald-500';
  const base = `w-full px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`;

  const submit = () => {
    if (!canSubmit) return;
    const ad: Ad = {
      id: Date.now().toString(), type, category,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`px-5 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 ${isBuy ? 'bg-blue-950/80 backdrop-blur' : 'bg-emerald-950/80 backdrop-blur'}`}>
          <div>
            <p className={`font-bold text-base ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>
              {isBuy ? "🛒 Xarid e'loni joylash" : "💰 Sotuv e'loni joylash"}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">{isBuy ? 'Nima sotib olmoqchisiz?' : 'Nima sotmoqchisiz?'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0">✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Category picker */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-2 block">
              Kategoriya <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-all
                    ${category === c.id
                      ? isBuy
                        ? 'bg-blue-700/40 border-blue-500 text-blue-300'
                        : 'bg-emerald-700/40 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                    }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product name */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              Mahsulot nomi <span className="text-red-400">*</span>
            </label>
            <input value={product} onChange={e => setProduct(e.target.value)}
              placeholder={isBuy ? "Sement, un, armitura, go'sht..." : "Kartoshka, gazlama, yog'och..."}
              className={base} autoFocus />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              Miqdor <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Raqam"
                className={`w-24 shrink-0 px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`} />
              <select value={unit} onChange={e => setUnit(e.target.value)}
                className={`flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm outline-none`}>
                {UNIT_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.units.map(u => <option key={u} value={u}>{u}</option>)}
                  </optgroup>
                ))}
              </select>
              <select value={freq} onChange={e => setFreq(e.target.value)}
                className={`w-28 shrink-0 px-2 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm outline-none`}>
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
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder={isBuy ? 'Toshkent, Samarqand...' : 'Chorsu bozori, zavod, ombor...'}
              className={base} />
          </div>

          {/* Price */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              {isBuy ? 'Maqsadli narx (ixtiyoriy)' : 'Sotuv narxi (ixtiyoriy)'}
            </label>
            <div className="flex gap-2 items-center">
              <input value={price} onChange={e => setPrice(e.target.value)}
                placeholder={isBuy ? 'Maks: 9 000' : 'Narx: 9 500'}
                className={`flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm placeholder-slate-500 outline-none`} />
              <span className="text-slate-500 text-sm shrink-0">so'm /</span>
              <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)}
                className={`w-24 shrink-0 px-2 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm outline-none`}>
                {ALL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Telefon raqam</label>
            <input value={contact} onChange={e => setContact(e.target.value)}
              placeholder="+998 90 123 45 67" className={base} />
          </div>

          <button onClick={submit} disabled={!canSubmit}
            className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all
              disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
              ${done ? 'bg-green-600'
                : isBuy ? 'bg-blue-700 hover:bg-blue-600 active:scale-95'
                : 'bg-emerald-700 hover:bg-emerald-600 active:scale-95'}`}>
            {done ? "✓ E'lon muvaffaqiyatli joylashtirildi!" : isBuy ? "🛒 Xarid e'lonini joylash" : "💰 Sotuv e'lonini joylash"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Market Strip ───────────────────────────────────────────────────────────

function AIStrip({ tab, cat }: { tab: 'buy' | 'sell'; cat: Category }) {
  const [text, setText]   = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen]   = useState(false);

  const catLabel = CATEGORIES.find(c => c.id === cat)?.label ?? 'umumiy bozor';

  const analyze = async () => {
    if (loading) return;
    setOpen(true); setLoading(true); setText('');
    const scope = cat === 'all' ? "O'zbekiston ulgurji bozori" : `"${catLabel}" kategoriyasi`;
    const prompt = tab === 'buy'
      ? `O'zbek tilida 2-3 jumlada: ${scope} bo'yicha xaridorlar uchun hozirgi narx holati. Qaysi tovarlar arzonlashmoqda yoki taqchil? Hozir sotib olish foydali?`
      : `O'zbek tilida 2-3 jumlada: ${scope} bo'yicha sotuvchilar uchun hozirgi narx holati. Qaysi tovarlar qimmatlashmoqda? Hozir sotish foydali?`;
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }), signal: AbortSignal.timeout(20_000),
      });
      setText((await res.json())?.text ?? 'Tahlil yuklanmadi.');
    } catch {
      setText('Tahlil yuklanmadi. Internet aloqasini tekshiring.');
    } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 overflow-hidden">
      <button onClick={open ? () => setOpen(false) : analyze}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900/15 transition-colors text-left">
        <span className="text-xl shrink-0">🤖</span>
        <div className="flex-1 min-w-0">
          <p className="text-purple-300 text-sm font-semibold">AI Bozor Tahlili</p>
          <p className="text-slate-500 text-xs truncate">
            {loading ? 'Tahlil qilinmoqda...'
              : open && text ? text.slice(0, 65) + '...'
              : `${tab === 'buy' ? 'Xaridorlar' : 'Sotuvchilar'} uchun — ${catLabel}`}
          </p>
        </div>
        {loading
          ? <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin shrink-0" />
          : !open
            ? <span className="text-xs px-3 py-1.5 bg-purple-800/50 hover:bg-purple-700/60 text-purple-300 rounded-lg border border-purple-700/40 font-medium transition-colors shrink-0">Tahlil →</span>
            : <span className="text-slate-500 shrink-0">▲</span>
        }
      </button>
      {open && !loading && text && (
        <div className="px-4 pb-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-purple-900/30">
            <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
          </div>
          <button onClick={analyze} className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">↻ Yangilash</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Bozor() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState<'buy' | 'sell'>('buy');
  const [cat, setCat]       = useState<Category>('all');
  const [userAds, setUserAds] = useState<Ad[]>(loadUserAds);
  const [modal, setModal]   = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { if (!modal) setUserAds(loadUserAds()); }, [modal]);

  const isBuy = tab === 'buy';

  // All ads for current tab
  const baseAds = isBuy
    ? [...userAds.filter(a => a.type === 'buy'), ...SAMPLE_BUY]
    : [...userAds.filter(a => a.type === 'sell'), ...SAMPLE_SELL];

  // Count per category for badge numbers
  const countByCat = (c: Category) =>
    c === 'all' ? baseAds.length : baseAds.filter(a => a.category === c).length;

  // Apply category + search filters
  const q = search.toLowerCase().trim();
  const ads = baseAds
    .filter(a => cat === 'all' || a.category === cat)
    .filter(a => !q || a.product.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));

  const switchTab = (t: 'buy' | 'sell') => { setTab(t); setCat('all'); setSearch(''); };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white text-xl leading-none shrink-0">←</button>

          {/* Buy / Sell toggle */}
          <div className="flex bg-slate-900 border border-slate-700 rounded-xl p-1 gap-1 shrink-0">
            <button onClick={() => switchTab('buy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === 'buy' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:text-white'}`}>
              🛒 Xaridorlar
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'buy' ? 'bg-blue-500/40 text-blue-100' : 'bg-slate-800 text-slate-500'}`}>
                {[...userAds.filter(a => a.type === 'buy'), ...SAMPLE_BUY].length}
              </span>
            </button>
            <button onClick={() => switchTab('sell')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                tab === 'sell' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:text-white'}`}>
              💰 Sotuvchilar
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'sell' ? 'bg-emerald-500/40 text-emerald-100' : 'bg-slate-800 text-slate-500'}`}>
                {[...userAds.filter(a => a.type === 'sell'), ...SAMPLE_SELL].length}
              </span>
            </button>
          </div>

          {/* Search with filter icon */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Mahsulot yoki shahar..."
              className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 focus:border-blue-600 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs">✕</button>
            )}
          </div>

          {/* Post */}
          <button onClick={() => setModal(true)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all active:scale-95
              ${isBuy ? 'bg-blue-700 hover:bg-blue-600' : 'bg-emerald-700 hover:bg-emerald-600'}`}>
            <span>+</span>
            <span className="hidden sm:inline">E'lon</span>
          </button>

          <button onClick={() => navigate('/interview')} title="AI Maslahat" className="shrink-0 text-slate-500 hover:text-white text-lg transition-colors">🤖</button>
        </div>

        {/* ── Category filter strip ── */}
        <div className="border-t border-slate-800/60 bg-slate-950/80">
          <div className="max-w-5xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(c => {
              const count = countByCat(c.id);
              const active = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(c.id)} disabled={count === 0 && c.id !== 'all'}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0
                    ${active
                      ? isBuy
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                      : count === 0
                        ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                        : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
                    }
                  `}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                  {c.id !== 'all' && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 space-y-4">

        {/* AI Strip */}
        <AIStrip key={`${tab}-${cat}`} tab={tab} cat={cat} />

        {/* Result info */}
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            {q || cat !== 'all'
              ? <><span className={`font-semibold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>{ads.length}</span> ta natija
                {cat !== 'all' && <> · <span className="text-white">{CATEGORIES.find(c=>c.id===cat)?.label}</span></>}
                {q && <> · "<span className="text-white">{search}</span>"</>}
              </>
              : <><span className={`font-semibold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>{ads.length}</span> ta {isBuy ? "xarid e'loni" : "sotuv e'loni"}</>
            }
          </p>
          {(q || cat !== 'all') && (
            <button onClick={() => { setSearch(''); setCat('all'); }} className="text-xs text-slate-500 hover:text-white transition-colors">
              Filtrni tozalash ✕
            </button>
          )}
        </div>

        {/* Ads grid */}
        {ads.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-slate-300 font-semibold mb-1">Hech narsa topilmadi</p>
            <p className="text-slate-600 text-sm">Filtr yoki qidiruvni o'zgartiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && <PostAdModal type={tab} onClose={() => setModal(false)} onPost={() => setUserAds(loadUserAds())} />}

      {/* Footer */}
      <div className="border-t border-slate-800 bg-slate-900/40 px-4 py-2.5 text-center">
        <p className="text-slate-700 text-xs">Chorsu · Ipodrom ulgurji bozori · 2026-yil iyun · BiznesPlan AI</p>
      </div>
    </div>
  );
}
