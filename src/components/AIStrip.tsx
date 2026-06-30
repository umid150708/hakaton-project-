import { useState } from 'react';
import type { Category } from '../lib/bozorData';
import { CATEGORIES } from '../lib/bozorData';

interface Props {
  tab: 'buy' | 'sell';
  cat: Category;
}

export default function AIStrip({ tab, cat }: Props) {
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  const catLabel = CATEGORIES.find(c => c.id === cat)?.label ?? 'umumiy bozor';

  const analyze = async () => {
    if (loading) return;
    setOpen(true);
    setLoading(true);
    setText('');

    const scope = cat === 'all' ? "O'zbekiston ulgurji bozori" : `"${catLabel}" kategoriyasi`;
    const prompt = tab === 'buy'
      ? `O'zbek tilida 2-3 jumlada: ${scope} bo'yicha xaridorlar uchun hozirgi narx holati. Qaysi tovarlar arzonlashmoqda yoki taqchil? Hozir sotib olish foydali?`
      : `O'zbek tilida 2-3 jumlada: ${scope} bo'yicha sotuvchilar uchun hozirgi narx holati. Qaysi tovarlar qimmatlashmoqda? Hozir sotish foydali?`;

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(20_000),
      });
      setText((await res.json())?.text ?? 'Tahlil yuklanmadi.');
    } catch {
      setText('Tahlil yuklanmadi. Internet aloqasini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const preview = loading
    ? 'Tahlil qilinmoqda...'
    : open && text
      ? text.slice(0, 65) + '...'
      : `${tab === 'buy' ? 'Xaridorlar' : 'Sotuvchilar'} uchun — ${catLabel}`;

  return (
    <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 overflow-hidden">
      <button
        onClick={open ? () => setOpen(false) : analyze}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-900/15 transition-colors text-left"
      >
        <span className="text-xl shrink-0">🤖</span>
        <div className="flex-1 min-w-0">
          <p className="text-purple-300 text-sm font-semibold">AI Bozor Tahlili</p>
          <p className="text-slate-500 text-xs truncate">{preview}</p>
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
          <button onClick={analyze} className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors">
            ↻ Yangilash
          </button>
        </div>
      )}
    </div>
  );
}
