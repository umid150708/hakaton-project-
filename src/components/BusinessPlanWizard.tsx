/**
 * BusinessPlanWizard.tsx — Full-screen "Biznes reja" flow.
 *
 * Prefilled by the user's profile, asks a handful of targeted questions, then
 * generates a structured plan (gemini) and offers a PDF download.
 */

import { useState } from 'react';
import { IconX, IconFileDownload, IconRefresh, IconSparkles } from '@tabler/icons-react';
import { useAuth } from '../lib/auth';
import { generatePlan, type PlanAnswers, type BusinessPlan } from '../lib/businessPlan';
import { downloadPlanPdf } from '../lib/pdfExport';

const FUNDING = ['O\'z mablag\'im', 'Bank krediti', 'Grant / subsidiya', 'Aralash'];

export default function BusinessPlanWizard({ onClose }: { onClose: () => void }) {
  const user = useAuth();
  const [step, setStep]       = useState<'form' | 'loading' | 'done' | 'error'>('form');
  const [plan, setPlan]       = useState<BusinessPlan | null>(null);
  const [answers, setAnswers] = useState<PlanAnswers>({
    idea: '', investment: '', funding: FUNDING[1], market: '', goal: '', extra: '',
  });

  const set = (k: keyof PlanAnswers) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setAnswers(a => ({ ...a, [k]: e.target.value }));

  const canGen = answers.idea.trim().length > 3 && answers.investment.trim() !== '' && step !== 'loading';

  const run = async () => {
    setStep('loading');
    try { setPlan(await generatePlan(answers)); setStep('done'); }
    catch { setStep('error'); }
  };

  const download = () => {
    if (!plan) return;
    downloadPlanPdf(plan, {
      owner: user?.name,
      business: user?.businessName,
      date: new Date().toLocaleDateString('uz-UZ'),
    });
  };

  const inputCls = 'w-full px-3 py-2.5 bg-elevated border border-line-strong focus:border-brand rounded-xl text-ink text-sm placeholder:text-faint outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 bg-page flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-line px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconSparkles size={18} className="text-brand" />
          <p className="text-ink font-semibold text-sm">Biznes reja tuzish</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors btn-icon"><IconX size={18} /></button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {step === 'form' && (
            <div className="space-y-4">
              <p className="text-muted text-sm">
                AI sizning profilingiz va quyidagi javoblar asosida to'liq biznes-reja tuzadi va PDF qilib beradi.
              </p>

              <Field label="Biznes g'oyasi" req hint="Nima biznes ochmoqchisiz?">
                <textarea value={answers.idea} onChange={set('idea')} rows={2}
                  placeholder="Masalan: Chorsu bozorida ulgurji un savdosi va yetkazib berish xizmati"
                  className={inputCls + ' resize-none'} />
              </Field>

              <Field label="Boshlang'ich investitsiya" req hint="Qancha mablag' kerak (so'm)?">
                <input value={answers.investment} onChange={set('investment')} placeholder="50 000 000" className={inputCls} />
              </Field>

              <Field label="Mablag' manbai">
                <select value={answers.funding} onChange={set('funding')} className={inputCls}>
                  {FUNDING.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>

              <Field label="Maqsadli mijozlar" hint="Kim sizning mijozingiz?">
                <input value={answers.market} onChange={set('market')} placeholder="Novvoyxonalar, restoranlar, chakana do'konlar" className={inputCls} />
              </Field>

              <Field label="1 yillik maqsad">
                <input value={answers.goal} onChange={set('goal')} placeholder="Oylik 200 mln so'm aylanma, 5 doimiy mijoz" className={inputCls} />
              </Field>

              <Field label="Qo'shimcha (ixtiyoriy)">
                <textarea value={answers.extra} onChange={set('extra')} rows={2}
                  placeholder="AI bilishi kerak bo'lgan boshqa narsalar" className={inputCls + ' resize-none'} />
              </Field>

              <button onClick={run} disabled={!canGen}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 bg-brand hover:bg-brand-hover text-brand-ink disabled:bg-elevated disabled:text-faint btn-cta">
                ✨ Biznes reja yaratish
              </button>
              {!user && <p className="text-faint text-xs text-center">Maslahat: profilni to'ldirsangiz, reja aniqroq bo'ladi.</p>}
            </div>
          )}

          {step === 'loading' && (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
              <p className="text-ink font-medium">Biznes reja tayyorlanmoqda…</p>
              <p className="text-faint text-sm mt-1">Bu 15-30 soniya olishi mumkin</p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-24 text-center">
              <p className="text-ink font-medium">Rejani tuzib bo'lmadi</p>
              <p className="text-faint text-sm mt-1">Qaytadan urinib ko'ring</p>
              <button onClick={() => setStep('form')} className="mt-4 px-4 py-2 rounded-xl bg-elevated hover:bg-elevated text-ink text-sm font-semibold btn-soft">← Orqaga</button>
            </div>
          )}

          {step === 'done' && plan && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 sticky top-0 bg-page py-2 -mt-2 z-10">
                <button onClick={download} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink text-sm font-bold transition-colors btn-cta">
                  <IconFileDownload size={17} /> PDF yuklab olish
                </button>
                <button onClick={run} title="Qayta yaratish" className="px-3 py-3 rounded-xl bg-elevated hover:bg-elevated text-muted transition-colors btn-icon"><IconRefresh size={17} /></button>
              </div>

              <div className="bg-surface border border-line rounded-2xl p-5">
                <h1 className="text-ink text-lg font-bold mb-4">{plan.title}</h1>
                {plan.sections.map((s, i) => (
                  <div key={i} className="mb-5 last:mb-0">
                    <h2 className="text-brand text-sm font-semibold mb-1.5">{s.heading}</h2>
                    <div className="text-muted text-sm leading-relaxed whitespace-pre-line">{s.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, req, children }: { label: string; hint?: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-muted text-xs font-medium mb-1.5 block">
        {label} {req && <span className="text-red-400">*</span>}
        {hint && <span className="text-faint font-normal"> — {hint}</span>}
      </label>
      {children}
    </div>
  );
}
