import { useState } from 'react';
import { CATEGORIES, UNIT_GROUPS, ALL_UNITS, FREQ_OPTIONS, saveUserAd, type Ad, type Category } from '../lib/bozorData';

interface Props {
  type: 'buy' | 'sell';
  onClose: () => void;
  onPost: (ad: Ad) => void;
}

export default function PostAdModal({ type, onClose, onPost }: Props) {
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
  const inputCls = `w-full px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`;

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
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur ${isBuy ? 'bg-blue-950/80' : 'bg-emerald-950/80'}`}>
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

          {/* Category */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-2 block">Kategoriya <span className="text-red-400">*</span></label>
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

          {/* Product */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Mahsulot nomi <span className="text-red-400">*</span></label>
            <input
              value={product} onChange={e => setProduct(e.target.value)} autoFocus
              placeholder={isBuy ? "Sement, un, armitura, go'sht..." : "Kartoshka, gazlama, yog'och..."}
              className={inputCls}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Miqdor <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              <input
                type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Raqam"
                className={`w-24 shrink-0 px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors`}
              />
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
            <input
              value={location} onChange={e => setLocation(e.target.value)}
              placeholder={isBuy ? 'Toshkent, Samarqand...' : 'Chorsu bozori, zavod, ombor...'}
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
                placeholder={isBuy ? 'Maks: 9 000' : 'Narx: 9 500'}
                className={`flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 ${ring} rounded-xl text-white text-sm placeholder-slate-500 outline-none`}
              />
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
            <input
              value={contact} onChange={e => setContact(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={inputCls}
            />
          </div>

          <button
            onClick={submit} disabled={!canSubmit}
            className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all
              disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
              ${done ? 'bg-green-600' : isBuy ? 'bg-blue-700 hover:bg-blue-600 active:scale-95' : 'bg-emerald-700 hover:bg-emerald-600 active:scale-95'}`}
          >
            {done
              ? "✓ E'lon muvaffaqiyatli joylashtirildi!"
              : isBuy ? "🛒 Xarid e'lonini joylash" : "💰 Sotuv e'lonini joylash"}
          </button>
        </div>
      </div>
    </div>
  );
}
