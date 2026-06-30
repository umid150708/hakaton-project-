import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '../stores/appStore';
import { computeScore } from '../lib/scoring';
import { assessDataQuality } from '../lib/answerQuality';
import { detectCategory } from '../lib/categoryMap';
import PriceTable from '../components/PriceTable';
import RevenueCheck from '../components/RevenueCheck';
import type { AIResult } from '../lib/schema';
import type { ScoreResult } from '../lib/scoring';

// ---- Sub-components ----

function ScoreGauge({ score }: { score: ScoreResult }) {
  const colorMap = { red: '#ef4444', amber: '#f59e0b', green: '#10b981' };
  const color = colorMap[score.color];
  const data = [{ value: score.total, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="100%"
            innerRadius="70%" outerRadius="100%"
            startAngle={180} endAngle={0}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#1e293b' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-4xl font-bold text-white">{score.total}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      <span className="mt-2 px-4 py-1 rounded-full text-sm font-bold" style={{ color, backgroundColor: color + '20', border: `1px solid ${color}40` }}>
        {score.band}
      </span>
    </div>
  );
}

function ScoreBreakdown({ score }: { score: ScoreResult }) {
  const colorMap = { red: '#ef4444', amber: '#f59e0b', green: '#10b981' };
  return (
    <div className="space-y-3">
      {score.breakdown.map((comp) => (
        <div key={comp.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-300 font-medium">{comp.label}</span>
            <span className="text-slate-400">{comp.points} / {comp.max}</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(comp.points / comp.max) * 100}%`,
                backgroundColor: comp.points / comp.max >= 0.7
                  ? colorMap.green
                  : comp.points / comp.max >= 0.4
                  ? colorMap.amber
                  : colorMap.red,
              }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-1">{comp.note}</p>
        </div>
      ))}
    </div>
  );
}

function PlanSection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-slate-900 hover:bg-slate-800 transition-colors"
      >
        <span className="text-white font-medium text-sm">{title}</span>
        <span className="text-slate-500 text-lg">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 py-4 bg-slate-950 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}

function ScoreRecommendations({ score, facts }: { score: ScoreResult; facts: AIResult['facts'] }) {
  const issues = assessDataQuality(facts);
  const weakComponents = score.breakdown.filter(c => c.points / c.max < 0.6);

  // Nothing to show for high scorers with clean data
  if (score.total >= 70 && issues.length === 0) return null;

  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <span className="text-lg">
          {score.color === 'red' ? '🔴' : score.color === 'amber' ? '🟡' : '🟢'}
        </span>
        <div>
          <h2 className="text-white font-semibold text-sm">Ball nima uchun shunday chiqdi?</h2>
          <p className="text-slate-500 text-xs mt-0.5">Qanday qilib oshirish mumkin</p>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {/* Per-component personalized advice */}
        {weakComponents.map(comp => {
          const pct = comp.points / comp.max;
          const color = pct === 0 ? '#ef4444' : '#f59e0b';
          return (
            <div key={comp.label} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold"
                  style={{ backgroundColor: color + '20', color }}
                >
                  {pct === 0 ? '!' : '↑'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white text-sm font-medium">{comp.label}</span>
                    <span className="text-xs" style={{ color }}>{comp.points}/{comp.max} ball</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{comp.note}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Data quality issues */}
        {issues.map(issue => (
          <div key={issue.field} className="px-5 py-4">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 font-bold"
                style={{
                  backgroundColor: issue.severity === 'error' ? '#ef444420' : '#f59e0b20',
                  color: issue.severity === 'error' ? '#ef4444' : '#f59e0b',
                }}
              >
                {issue.severity === 'error' ? '✕' : '!'}
              </div>
              <div className="flex-1">
                <span className="text-white text-sm font-medium">{issue.label}</span>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{issue.message}</p>
                <p className="text-emerald-500 text-xs mt-1 leading-relaxed">→ {issue.fix}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Action CTA */}
        <div className="px-5 py-4 bg-slate-950/40">
          <p className="text-slate-500 text-xs leading-relaxed">
            {score.color === 'red'
              ? '💡 Intervyuni qayta o\'tib, aniq raqamlar va to\'liq javoblar bering — ball sezilarli oshadi.'
              : '💡 Yuqoridagi 1–2 ta zaif tomonni kuchaytirsangiz, kredit olish imkoniyatingiz oshadi.'}
          </p>
        </div>
      </div>
    </section>
  );
}

// ---- Main Result Page ----

export default function Result() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';
  const { result, prices, revenueCheck, reset } = useAppStore();
  const resultRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  if (!result) {
    navigate('/');
    return null;
  }

  const score = computeScore(result.facts, revenueCheck ?? undefined);
  const category = detectCategory(result.facts.business_type);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { exportToPDF } = await import('../lib/pdfExport');
      await exportToPDF(
        result,
        score,
        Object.keys(prices).length > 0 ? prices : undefined,
        revenueCheck ?? undefined,
      );
    } catch (e) {
      console.error('PDF export failed:', e);
      alert('PDF yaratishda xatolik. Keyinroq urinib ko\'ring.');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    reset();
    navigate('/');
  };

  const colorMap = { red: '#ef4444', amber: '#f59e0b', green: '#10b981' };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Demo badge */}
      {isDemo && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1 bg-amber-900 border border-amber-700 rounded-full text-amber-300 text-xs">
          Demo rejimi
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs">Biznes-reja tayyor</p>
          <h1 className="text-white font-bold">{result.facts.business_type} · {result.facts.region}</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {exporting ? 'Yuklanmoqda...' : '⬇ PDF yuklash'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
          >
            Yangi reja
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8" ref={resultRef}>

        {/* Score section */}
        <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-slate-400 text-xs uppercase tracking-wider mb-6">Kredit tayyorgarlik balli</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <ScoreGauge score={score} />
            <div className="flex-1">
              <p className="text-sm mb-4" style={{ color: colorMap[score.color] }}>
                {score.advice}
              </p>
              <ScoreBreakdown score={score} />
            </div>
          </div>
        </section>

        {/* Personalized score recommendations */}
        <ScoreRecommendations score={score} facts={result.facts} />

        {/* Revenue analysis — only shown when status ≠ ok */}
        {revenueCheck && (
          <RevenueCheck result={revenueCheck} />
        )}

        {/* Business plan */}
        <section>
          <h2 className="text-slate-400 text-xs uppercase tracking-wider mb-4">Biznes-reja bo'limlari</h2>
          <div className="space-y-2">
            <PlanSection title="Rezyume (Executive Summary)" content={result.business_plan.executive_summary} />
            <PlanSection title="Bozor tahlili" content={result.business_plan.market_analysis} />
            <PlanSection title="Marketing va ishlab chiqarish rejasi" content={result.business_plan.marketing_production_plan} />
            <PlanSection title="Moliyaviy prognoz (3 yil)" content={result.business_plan.financial_forecast} />
            <PlanSection title="Risklar va yechimlar" content={result.business_plan.risk_assessment} />
          </div>
        </section>

        {/* Market prices — shown when price data was fetched */}
        {Object.keys(prices).length > 0 && revenueCheck && (
          <PriceTable
            prices={prices}
            revenueCheck={revenueCheck}
            category={category}
          />
        )}

        {/* Bank recommendations */}
        <section>
          <h2 className="text-slate-400 text-xs uppercase tracking-wider mb-4">Bank tavsiyalari</h2>
          <div className="space-y-3">
            {result.bank_recommendations.map((rec, i) => (
              <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  {i === 0 && <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-xs rounded-full border border-emerald-800">Tavsiya #1</span>}
                  <h3 className="text-white font-semibold">{rec.bank}</h3>
                </div>
                <p className="text-slate-300 text-sm mb-3">{rec.why_fit}</p>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Talab qilinadigan hujjatlar:</p>
                  <p className="text-slate-300 text-xs whitespace-pre-line">{rec.likely_requirements}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-slate-400 text-xs uppercase tracking-wider mb-4">Bankga borishdan oldin tayyorlang</h2>
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
            {result.readiness_checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 border border-slate-600 rounded flex items-center justify-center text-xs text-slate-500 bg-slate-800">
                  {i + 1}
                </div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-slate-700 text-xs py-4">
          BiznesPlan AI tomonidan tayyorlandi · O'zbekiston Savdo-sanoat palatasi hamkori
        </div>
      </div>
    </div>
  );
}
