import { useState } from 'react';
import { CATEGORIES, UNIT_GROUPS, ALL_UNITS, FREQ_OPTIONS, saveUserAd, type Ad, type Category } from '../lib/bozorData';
import { marketplace, type Match, type NewAdInput } from '../lib/marketplace';

interface Props {
  type: 'buy' | 'sell';
  onClose: () => void;
  onPosted: (matches: Match[]) => void;
}

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', "Farg'ona", 'Andijon',
  'Namangan', 'Buxoro', 'Nukus', 'Qarshi', 'Jizzax', 'Navoiy', 'Sirdaryo',
  'Xorazm', 'Termiz', 'Urganch', "Qo'qon",
];

export default function PostAdModal({ type, onClose, onPosted }: Props) {
  const [category, setCategory] = useState<Category>('grain');
  const [product, setProduct]   = useState('');
  const [amount, setAmount]     = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [unit, setUnit]         = useState('kg');
  const [freq, setFreq]         = useState('');
  const [region, setRegion]     = useState('');
  const [district, setDistrict] = useState('');
  const [price, setPrice]       = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceUnit, setPriceUnit] = useState('kg');
  const [contact, setContact]   = useState('');
  const [done, setDone]         = useState(false);
  const [posting, setPosting]   = useState(false);

  // Fair-price AI
  const [priceHint, setPriceHint]   = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  const isBuy = type === 'buy';
  // "20" or "20–22" for display / local fallback.
  const rangeText = (lo: string, hi: string) => {
    const l = lo.trim(), h = hi.trim();
    return l && h && h !== l ? `${l}–${h}` : l;
  };
  const quantityStr = amount.trim() ? `${rangeText(amount, amountMax)} ${unit}${freq}` : '';
  const priceStr    = price.trim() ? `${rangeText(price, priceMax)} so'm/${priceUnit}` : '';
  const canSubmit = category !== 'all' && product.trim() && amount.trim() && region.trim() && !posting;

  const ring = isBuy ? 'focus:border-blue-500' : 'focus:border-emerald-500';
  const inputCls = `w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm placeholder-zinc-500 outline-none transition-colors`;

  const catLabel = CATEGORIES.find(c => c.id === category)?.label ?? '';

  const checkPrice = async () => {
    if (!product.trim() || hintLoading) return;
    setHintLoading(true);
    setPriceHint('');
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: "Siz O'zbekiston ulgurji bozori narx eksperti. Berilgan mahsulot uchun taxminiy ADOLATLI narx oralig'ini bitta qatorda ber: \"~X–Y so'm/birlik\". Keyin 1 qisqa jumla sabab. Ortiqcha yozma.",
          prompt: `Mahsulot: ${product.trim()}. Kategoriya: ${catLabel}. Hudud: ${region || "O'zbekiston"}. ${isBuy ? 'Xaridor uchun maqsadli narx' : 'Sotuvchi uchun sotuv narxi'} oralig'ini ayting.`,
          maxTokens: 200,
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await res.json();
      setPriceHint((data?.text ?? '').trim() || "Narx ma'lumoti topilmadi.");
    } catch {
      setPriceHint("Narxni tekshirib bo'lmadi.");
    } finally {
      setHintLoading(false);
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setPosting(true);

    const locationStr = district.trim() ? `${district.trim()}, ${region}` : region;
    const input: NewAdInput = {
      type, category,
      product: product.trim(),
      quantityValue: amount.trim()    ? Number(amount)    : null,
      quantityMax:   amountMax.trim() ? Number(amountMax) : null,
      quantityUnit: unit,
      quantityFreq: freq,
      region: region.trim(),
      district: district.trim(),
      location: locationStr,
      priceValue: price.trim()    ? Number(price)    : null,
      priceMax:   priceMax.trim() ? Number(priceMax) : null,
      priceUnit,
      contact: contact.trim(),
    };

    try {
      const { matches } = await marketplace.createAd(input);
      finish(matches);
    } catch {
      // Backend not ready — fall back to a local ad so posting still works.
      const ad: Ad = {
        id: Date.now().toString(), type, category,
        product: product.trim(),
        quantity: quantityStr,
        location: locationStr,
        price: priceStr,
        contact: contact.trim(),
        date: new Date().toLocaleDateString('uz-UZ'),
      };
      saveUserAd(ad);
      finish([]);
    }
  };

  const finish = (matches: Match[]) => {
    setPosting(false);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); onPosted(matches); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className={`px-5 py-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur ${isBuy ? 'bg-blue-950/80' : 'bg-emerald-950/80'}`}>
          <div>
            <p className={`font-bold text-base ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>
              {isBuy ? "🛒 Xarid e'loni joylash" : "💰 Sotuv e'loni joylash"}
            </p>
            <p className="text-zinc-500 text-xs mt-0.5">{isBuy ? 'Nima sotib olmoqchisiz?' : 'Nima sotmoqchisiz?'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* Category */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-2 block">Kategoriya <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-all
                    ${category === c.id
                      ? isBuy ? 'bg-blue-700/40 border-blue-500 text-blue-300' : 'bg-emerald-700/40 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}`}>
                  <span className="text-lg">{c.icon}</span>
                  <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Mahsulot nomi <span className="text-red-400">*</span></label>
            <input value={product} onChange={e => setProduct(e.target.value)} autoFocus
              placeholder={isBuy ? "Sement, un, armitura, go'sht..." : "Kartoshka, gazlama, yog'och..."} className={inputCls} />
          </div>

          {/* Quantity (with optional range) */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Miqdor <span className="text-red-400">*</span></label>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 shrink-0">
                <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="20"
                  className={`w-20 px-2.5 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm text-center placeholder-zinc-500 outline-none transition-colors`} />
                <span className="text-zinc-600 text-sm">–</span>
                <input type="number" min="0" value={amountMax} onChange={e => setAmountMax(e.target.value)} placeholder="22"
                  title="Ixtiyoriy: oraliq uchun"
                  className={`w-20 px-2.5 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm text-center placeholder-zinc-600 outline-none transition-colors`} />
              </div>
              <select value={unit} onChange={e => setUnit(e.target.value)}
                className={`flex-1 min-w-[90px] px-3 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm outline-none`}>
                {UNIT_GROUPS.map(g => <optgroup key={g.label} label={g.label}>{g.units.map(u => <option key={u} value={u}>{u}</option>)}</optgroup>)}
              </select>
              <select value={freq} onChange={e => setFreq(e.target.value)}
                className={`w-24 shrink-0 px-2 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm outline-none`}>
                {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            {quantityStr && <p className="text-xs text-zinc-500 mt-1.5">📦 <span className={`font-semibold ${isBuy ? 'text-blue-400' : 'text-emerald-400'}`}>{quantityStr}</span></p>}
          </div>

          {/* Location: region + district (district powers near-me matching) */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">
              {isBuy ? 'Qayerga yetkazish kerak?' : 'Qayerdan olish mumkin?'} <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <select value={region} onChange={e => setRegion(e.target.value)}
                className={`flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-sm outline-none ${region ? 'text-white' : 'text-zinc-500'}`}>
                <option value="">Viloyat / shahar</option>
                {REGIONS.map(r => <option key={r} value={r} className="text-white">{r}</option>)}
              </select>
              <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Tuman / mahalla"
                className={`flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm placeholder-zinc-500 outline-none`} />
            </div>
            <p className="text-zinc-600 text-[11px] mt-1">Tuman/mahalla — yaqin-atrofdagi mos takliflarni topish uchun</p>
          </div>

          {/* Price + fair-price AI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-400 text-xs font-medium">{isBuy ? 'Maqsadli narx (ixtiyoriy)' : 'Sotuv narxi (ixtiyoriy)'}</label>
              <button onClick={checkPrice} disabled={!product.trim() || hintLoading}
                className="text-purple-400 hover:text-purple-300 text-xs font-semibold disabled:opacity-40 transition-colors">
                {hintLoading ? 'Tekshirilmoqda…' : '🤖 Adolatli narxni tekshirish'}
              </button>
            </div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder={isBuy ? 'dan' : '100000'}
                className={`w-24 px-2.5 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm text-center placeholder-zinc-500 outline-none`} />
              <span className="text-zinc-600 text-sm">–</span>
              <input type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="120000"
                title="Ixtiyoriy: narx oralig'i"
                className={`w-24 px-2.5 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm text-center placeholder-zinc-600 outline-none`} />
              <span className="text-zinc-500 text-sm shrink-0">so'm /</span>
              <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)}
                className={`flex-1 min-w-[70px] px-2 py-2.5 bg-zinc-800 border border-zinc-700 ${ring} rounded-xl text-white text-sm outline-none`}>
                {ALL_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {priceStr && <p className="text-xs text-zinc-500 mt-1.5">💵 <span className="font-semibold text-zinc-300">{priceStr}</span></p>}
            {priceHint && (
              <div className="mt-2 rounded-xl border border-purple-800/40 bg-purple-950/20 px-3 py-2 text-purple-200 text-xs leading-relaxed">
                🤖 {priceHint}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="text-zinc-400 text-xs font-medium mb-1.5 block">Telefon raqam</label>
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="+998 90 123 45 67" className={inputCls} />
          </div>

          <button onClick={submit} disabled={!canSubmit}
            className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all
              disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed
              ${done ? 'bg-green-600' : isBuy ? 'bg-blue-700 hover:bg-blue-600 active:scale-95' : 'bg-emerald-700 hover:bg-emerald-600 active:scale-95'}`}>
            {done ? "✓ E'lon joylashtirildi!" : posting ? 'Joylanmoqda…' : isBuy ? "🛒 Xarid e'lonini joylash" : "💰 Sotuv e'lonini joylash"}
          </button>
        </div>
      </div>
    </div>
  );
}
