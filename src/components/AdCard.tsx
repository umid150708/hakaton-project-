import type { Ad } from '../lib/bozorData';
import { CATEGORIES } from '../lib/bozorData';

function CatBadge({ cat }: { cat: Ad['category'] }) {
  const c = CATEGORIES.find(x => x.id === cat);
  if (!c || cat === 'all') return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-elevated border border-line-strong/60 text-muted font-medium">
      {c.icon} {c.label}
    </span>
  );
}

interface Props {
  ad: Ad;
  onOpen: () => void;
}

export default function AdCard({ ad, onOpen }: Props) {
  const isBuy = ad.type === 'buy';

  return (
    <div className={`group relative flex flex-col bg-surface rounded-2xl border transition-all duration-200 overflow-hidden
      ${isBuy
        ? 'border-line card-buy hover:-translate-y-0.5'
        : 'border-line card-sell hover:-translate-y-0.5'
      }`}
    >
      {/* Top accent line */}
      <div className={`h-0.5 w-full ${isBuy ? 'bg-gradient-to-r from-blue-600/60 to-transparent' : 'bg-gradient-to-r from-emerald-600/60 to-transparent'}`} />

      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Header: product + date/new badge */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-ink font-semibold text-sm leading-snug flex-1 tracking-tight">{ad.product}</p>
          {ad.sample
            ? <span className="text-faint text-[10px] shrink-0 font-medium tabular-nums">{ad.date}</span>
            : <span className="text-[10px] px-2 py-0.5 bg-gold-soft text-gold rounded-full border border-line-strong font-bold shrink-0 tracking-wide">YO'Q</span>
          }
        </div>

        {/* Category */}
        <CatBadge cat={ad.category} />

        {/* Details */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-sm shrink-0">📦</span>
            <span className={`text-sm font-bold ${isBuy ? 'text-sky' : 'text-brand'}`}>
              {ad.quantity}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm shrink-0">📍</span>
            <span className="text-muted text-sm">{ad.location}</span>
          </div>
          {ad.price && (
            <div className="flex items-center gap-2.5">
              <span className="text-sm shrink-0">💵</span>
              <span className={`text-sm font-bold ${isBuy ? 'text-sky' : 'text-brand'}`}>
                {ad.price}
              </span>
            </div>
          )}
        </div>

        {/* Details button — opens deal terms; contact stays hidden until unlocked */}
        {ad.contact && (
          <button
            onClick={onOpen}
            className={`mt-1 w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 btn-soft
              ${isBuy
                ? 'bg-sky/10 hover:bg-sky/20 text-sky border border-sky/40 hover:border-sky/60'
                : 'bg-brand-soft hover:bg-emerald-900/80 text-brand border border-brand hover:border-emerald-700'
              }`}
          >
            📋 Batafsil
          </button>
        )}
      </div>
    </div>
  );
}
