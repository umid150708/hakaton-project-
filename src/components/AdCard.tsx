import type { Ad } from '../lib/bozorData';
import { CATEGORIES } from '../lib/bozorData';

function CatBadge({ cat }: { cat: Ad['category'] }) {
  const c = CATEGORIES.find(x => x.id === cat);
  if (!c || cat === 'all') return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-medium">
      {c.icon} {c.label}
    </span>
  );
}

interface Props {
  ad: Ad;
  onContact: () => void;
}

export default function AdCard({ ad, onContact }: Props) {
  const isBuy = ad.type === 'buy';
  const border = isBuy
    ? 'bg-slate-900 border-blue-900/50 hover:border-blue-600/60'
    : 'bg-slate-900 border-emerald-900/50 hover:border-emerald-600/60';
  const qtyColor  = isBuy ? 'text-blue-300'  : 'text-emerald-300';
  const priceColor = isBuy ? 'text-blue-400'  : 'text-emerald-400';
  const btnCls    = isBuy
    ? 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border-blue-800/50'
    : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border-emerald-800/50';

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${border}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-semibold text-sm leading-snug flex-1">{ad.product}</p>
        {ad.sample
          ? <span className="text-slate-700 text-[11px] shrink-0">{ad.date}</span>
          : <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 font-semibold shrink-0">YANGI</span>
        }
      </div>

      <CatBadge cat={ad.category} />

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">📦</span>
          <span className={`text-sm font-bold ${qtyColor}`}>{ad.quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base">📍</span>
          <span className="text-slate-300 text-sm">{ad.location}</span>
        </div>
        {ad.price && (
          <div className="flex items-center gap-2">
            <span className="text-base">💵</span>
            <span className={`text-sm font-bold ${priceColor}`}>{ad.price}</span>
          </div>
        )}
      </div>

      {/* Contact button */}
      {ad.contact && (
        <button
          onClick={onContact}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${btnCls}`}
        >
          📞 Aloqa qilish
        </button>
      )}
    </div>
  );
}
