/**
 * RevenueCheck — full revenue analysis section for the Result page.
 *
 * More detailed than the compact verdict inside PriceTable:
 *   • Visual stated-vs-estimated comparison bar
 *   • Bank red-flag warnings (what they will actually verify)
 *   • Specific action items tailored to the verdict
 *
 * Placed between the score gauge and the business plan sections.
 * Hidden when status is 'ok' and nothing needs attention.
 */

import type { RevenueCheckResult } from '../lib/revenueCheck';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtM(n: number): string {
  if (n <= 0) return '—';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mlrd so'm`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} mln so'm`;
  return `${n.toLocaleString('ru')} so'm`;
}

// ─── Status config ────────────────────────────────────────────────────────────

interface StatusConfig {
  color: string;
  bg: string;
  border: string;
  icon: string;
  headline: string;
  bankWarning: string;
  actions: string[];
}

function getConfig(result: RevenueCheckResult): StatusConfig {
  switch (result.status) {
    case 'too_low':
      return {
        color:  '#f59e0b',
        bg:     '#f59e0b0d',
        border: '#f59e0b30',
        icon:   '⚠️',
        headline: "Daromad juda past ko'rinadi",
        bankWarning:
          "Bank oylik daromadingizni bank ko'chirmasidan va soliq hisobotidan tekshiradi. " +
          "Agar real daromadingiz ko'rsatilganidan ko'p bo'lsa — buni hujjatlar bilan isbotlang.",
        actions: [
          "Raqamni qayta tekshiring: so'm bilan yozdingizmi?",
          "So'nggi 3 oy bank ko'chirmangizni tayyorlab qo'ying",
          "Naqd pul tushumi bo'lsa — ularni alohida hujjatlashtiring",
          "Intervyuni qayta o'ting va real daromadni kiriting",
        ],
      };

    case 'too_high':
      return {
        color:  '#ef4444',
        bg:     '#ef44440d',
        border: '#ef444430',
        icon:   '🚨',
        headline: "Daromad realistik emas ko'rinadi",
        bankWarning:
          "Bank kredit mutaxassisi bunday daromad raqamini ko'rganda darhol tekshirish so'raydi. " +
          "Asossiz yuqori daromad — ariza rad etilishining eng keng tarqalgan sababi.",
        actions: [
          "Real oylik tushumingizni hisoblang: narx × miqdor × ish kunlari",
          "Bank ko'chirmasi bilan tasdiqlab bo'lmaydigan raqam qo'ymang",
          "Faqat soliqqa tortilgan, rasmiy daromadni ko'rsating",
          "Intervyuni qayta o'ting va haqiqiy daromadni kiriting",
        ],
      };

    case 'ok_high':
      return {
        color:  '#f59e0b',
        bg:     '#f59e0b0d',
        border: '#f59e0b30',
        icon:   '💡',
        headline: "Daromad chegaradan biroz yuqori — hujjat tayyorlang",
        bankWarning:
          "Bu raqam imkonsiz emas, lekin bank tasdiqlash so'raydi. " +
          "Hujjatsiz yuqori daromad ko'rsatish kredit olish imkoniyatingizni kamaytiradi.",
        actions: [
          "So'nggi 6 oy bank ko'chirmalarini yig'ib qo'ying",
          "Kassoviy hisobotlar yoki cheklar to'plang",
          "Yirik mijozlar bilan shartnomalar bo'lsa — ularni ko'rsating",
          "Soliq deklaratsiyangiz daromadni qo'llab-quvvatlashini tekshiring",
        ],
      };

    case 'ok':
    default:
      return {
        color:  '#10b981',
        bg:     '#10b9810d',
        border: '#10b98130',
        icon:   '✅',
        headline: "Daromad realistik ko'rinadi",
        bankWarning:
          "Daromad bu turdagi biznes uchun kutilgan diapazonida. " +
          "Bankga borishdan oldin uni hujjatlar bilan tasdiqlashga tayyor bo'ling.",
        actions: [
          "3–6 oy bank ko'chirmalarini tayyorlab qo'ying",
          "Soliq to'lov kvitansiyalarini yig'ib qo'ying",
          "Agar doimiy mijozlar bo'lsa — shartnomalar qo'shimcha ball beradi",
        ],
      };
  }
}

// ─── Comparison bar ───────────────────────────────────────────────────────────

function ComparisonBar({ result }: { result: RevenueCheckResult }) {
  if (result.estimated_min_uzs <= 0) return null;

  const { stated_uzs, estimated_min_uzs, estimated_max_uzs } = result;

  // Scale all values against the display max (biggest of max_estimate or stated)
  const displayMax = Math.max(stated_uzs, estimated_max_uzs) * 1.1;
  if (displayMax <= 0) return null;

  const statedPct    = Math.min(100, (stated_uzs / displayMax) * 100);
  const estMinPct    = (estimated_min_uzs / displayMax) * 100;
  const estMaxPct    = Math.min(100, (estimated_max_uzs / displayMax) * 100);

  const isOk = result.status === 'ok' || result.status === 'ok_high';
  const statedColor = isOk ? '#10b981' : result.status === 'too_low' ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-3 my-4">
      {/* Stated bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">Siz ko'rsatgan</span>
          <span className="font-medium" style={{ color: statedColor }}>{fmtM(stated_uzs)}/oy</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${statedPct}%`, backgroundColor: statedColor }}
          />
        </div>
      </div>

      {/* Estimated range bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400">Taxminiy diapazon</span>
          <span className="text-slate-300">
            {fmtM(estimated_min_uzs)} – {fmtM(estimated_max_uzs)}/oy
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative">
          {/* range fill */}
          <div
            className="absolute top-0 h-full rounded-full bg-emerald-600/40"
            style={{
              left:  `${estMinPct}%`,
              width: `${Math.max(2, estMaxPct - estMinPct)}%`,
            }}
          />
          {/* min marker */}
          <div
            className="absolute top-0 w-0.5 h-full bg-emerald-500 opacity-70"
            style={{ left: `${estMinPct}%` }}
          />
          {/* max marker */}
          <div
            className="absolute top-0 w-0.5 h-full bg-emerald-500 opacity-70"
            style={{ left: `${Math.min(99.5, estMaxPct)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>Min</span>
          <span>Max</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RevenueCheckProps {
  result: RevenueCheckResult;
  /** Pass false to hide even on 'ok' status (e.g. if PriceTable already shows it) */
  showWhenOk?: boolean;
  className?: string;
}

export default function RevenueCheck({
  result,
  showWhenOk = false,
  className = '',
}: RevenueCheckProps) {
  // Only hide 'ok' when showWhenOk is false; always show warnings
  if (result.status === 'ok' && !showWhenOk) return null;
  if (result.status === 'unverifiable') return null;

  const cfg = getConfig(result);

  return (
    <section
      className={`rounded-2xl border overflow-hidden ${className}`}
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center gap-3"
        style={{ borderColor: cfg.border }}
      >
        <span className="text-xl leading-none">{cfg.icon}</span>
        <div>
          <h2 className="text-white font-semibold text-sm">{cfg.headline}</h2>
          <p className="text-xs mt-0.5" style={{ color: cfg.color + 'cc' }}>
            Daromad bozor narxlari asosida baholandi
          </p>
        </div>
        <div
          className="ml-auto px-2.5 py-1 rounded-full text-xs font-bold border shrink-0"
          style={{ color: cfg.color, borderColor: cfg.border, backgroundColor: cfg.color + '20' }}
        >
          {result.ratio.toFixed(1)}×
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Comparison bars */}
        <ComparisonBar result={result} />

        {/* Bank warning */}
        <div className="bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1 font-medium">🏦 Bank nima tekshiradi?</p>
          <p className="text-slate-300 text-xs leading-relaxed">{cfg.bankWarning}</p>
        </div>

        {/* Action items */}
        <div>
          <p className="text-xs font-medium text-slate-400 mb-2">Nima qilish kerak:</p>
          <ul className="space-y-2">
            {cfg.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                >
                  {i + 1}
                </span>
                <span className="text-slate-300 text-xs leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Basis note */}
        {result.basis !== 'none' && (
          <p className="text-slate-700 text-xs">
            {result.basis === 'price_data'
              ? `Baho ulgurji bozor narxlari asosida: "${result.price_used}"`
              : 'Baho sohaviy benchmarklar asosida'}
          </p>
        )}

      </div>
    </section>
  );
}
