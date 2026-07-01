/**
 * AIStrip.tsx — AI market analysis banner above the ads grid
 *
 * Sends two things to the API:
 *   system — teaches Groq the Reuters/Bloomberg style (once, as a style guide)
 *   prompt — the actual ad data to analyze in that style
 *
 * Caching: localStorage per (tab, category), valid 1 hour.
 * Manual ↻ bypasses cache.
 */

import { useState, useEffect, useRef } from 'react';
import type { Ad, Category } from '../lib/bozorData';
import { CATEGORIES } from '../lib/bozorData';

interface Props {
  tab:  'buy' | 'sell';
  cat:  Category;
  ads:  Ad[];
}

// ── Style guide — teaches Groq HOW to write, not what to say ─────────────────
// Based on Reuters/Bloomberg commodity brief format:
//   1. Specific product + price figure in first sentence
//   2. Cause → effect in second sentence
//   3. One clear actionable conclusion in third sentence
//   No generic disclaimers. No filler. Numbers required.

const ANALYST_SYSTEM = `Siz O'zbekiston ulgurji bozori bo'yicha mutaxassis analitiksiz — Reuters va Bloomberg tovar bozori tahlilchilari kabi yozasiz.

Yozish qoidalari (BU QOIDALARDAN HECH QACHON CHETGA CHIQMA):
1. Birinchi jumlada: aniq mahsulot nomi va narq raqamini keltir (masalan: "Armitura d12 narxi 9 200 so'm/kg")
2. Ikkinchi jumlada: sabab-natija bog'liqligini ko'rsat ("narx barqaror, chunki qurilish mavsumi...")
3. Uchinchi jumlada: xaridor yoki sotuvchi uchun BITTA aniq xulosa ber
4. Jami 3 jumla. Ortiqcha narsa yozma.
5. Hech qachon "tahlil qiling", "qaror qabul qilishdan oldin tekshiring" kabi bo'sh gaplar yozma.
6. Professional O'zbek tilida yoz — moliyaviy yangiliklar uslubida.

YOMON MISOL (bunday YOZMA):
"Bozorda ba'zi tovarlar arzonlashmoqda, boshqalari esa taqchil. Shuning uchun qaror qabul qilishdan oldin bozor holatini yaxshiroq tahlil qilish maqsadga muvofiq."

YAXSHI MISOL (mana SHUNDAY yoz):
"Sement M400 Samarqand omborlarida 950 so'm/kg bilan taklif etilmoqda — bu fevralga nisbatan 3% past, ishlab chiqarish ortishi baho bosimini kamaytirdi. Armitura (d12) esa 9 200 so'm/kg atrofida barqaror, yozgi qurilish mavsumi talabni ushlab turibdi. Xaridorlar uchun hozir qurilish materiallari olish foydali — kuz boshida narx oshishi kutilmoqda."`;

// ── Cache helpers ─────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function cacheGet(tab: string, cat: string): string | null {
  try {
    const raw = localStorage.getItem(`ai_bozor_v2_${tab}_${cat}`);
    if (!raw) return null;
    const { text, ts } = JSON.parse(raw) as { text: string; ts: number };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return text;
  } catch { return null; }
}

function cacheSet(tab: string, cat: string, text: string) {
  try {
    localStorage.setItem(`ai_bozor_v2_${tab}_${cat}`, JSON.stringify({ text, ts: Date.now() }));
  } catch { /* storage full — ignore */ }
}

// A real brief is a full sentence. A token-truncated fragment is short and
// ends mid-word/number (e.g. "...Namanganda 75") — reject those.
function isComplete(text: string): boolean {
  return text.length >= 60 && /[.!?…»)"']$/.test(text.trim());
}

// ── Prompt builder — passes real ad data for analysis ────────────────────────

function buildPrompt(tab: 'buy' | 'sell', catLabel: string, ads: Ad[]): string {
  const today = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Prioritise ads that have prices — more useful for analysis
  const withPrice    = ads.filter(a => a.price).slice(0, 6);
  const withoutPrice = ads.filter(a => !a.price).slice(0, 4);
  const topAds       = [...withPrice, ...withoutPrice];

  const adLines = topAds.length > 0
    ? topAds.map(a =>
        `• ${a.product}: ${a.quantity}${a.price ? `, ${a.price}` : ''} — ${a.location}`
      ).join('\n')
    : '(e\'lonlar mavjud emas)';

  const role = tab === 'buy' ? 'XARID' : 'SOTUV';

  return `Bugun: ${today}
Kategoriya: ${catLabel}
Faol ${role} e'lonlari:
${adLines}

Ushbu ma'lumotlar asosida ${tab === 'buy' ? 'xaridorlar' : 'sotuvchilar'} uchun bozor tahlilini yoz. Yuqoridagi qoidalarga qat'iy amal qil.`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIStrip({ tab, cat, ads }: Props) {
  const [text, setText]             = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [fromCache, setFromCache]   = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  const lastCombo = useRef('');
  const catLabel  = CATEGORIES.find(c => c.id === cat)?.label ?? 'Umumiy bozor';

  useEffect(() => {
    let cancelled = false;

    const combo      = `${tab}-${cat}`;
    const isNewCombo = combo !== lastCombo.current;
    lastCombo.current = combo;

    // Cache check — skip only on manual refresh of the same combo
    const skipCache = !isNewCombo && forceRefresh > 0;
    if (!skipCache) {
      const cached = cacheGet(tab, cat);
      if (cached) {
        setText(cached);
        setLoading(false);
        setError(false);
        setFromCache(true);
        return;
      }
    }

    setLoading(true);
    setError(false);
    setText('');
    setFromCache(false);

    fetch('/api/analyse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: ANALYST_SYSTEM,
        prompt: buildPrompt(tab, catLabel, ads),
        maxTokens: 400,
      }),
      signal: AbortSignal.timeout(20_000),
    })
      .then(r => r.json())
      .then((data: { text?: string }) => {
        if (cancelled) return;
        const t = (data?.text ?? '').trim();
        // Reject obviously-truncated fragments (e.g. "Mol go'shti Namanganda 75")
        // rather than showing them — a valid brief is a full sentence.
        if (t && isComplete(t)) { setText(t); cacheSet(tab, cat, t); }
        else setError(true);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tab, cat, forceRefresh]);

  return (
    <div className="rounded-xl border border-purple-900/40 bg-purple-950/15 px-4 py-3 flex items-start gap-3">
      <span className="text-lg shrink-0 mt-0.5">🤖</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-wide">
            AI Tahlil · {tab === 'buy' ? 'Xaridorlar' : 'Sotuvchilar'} · {catLabel}
          </p>
          {fromCache && !loading && (
            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded-full border border-zinc-700">
              keshdan
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-3 bg-zinc-800 rounded-full animate-pulse w-full" />
            <div className="h-3 bg-zinc-800 rounded-full animate-pulse w-[85%]" />
            <div className="h-3 bg-zinc-800 rounded-full animate-pulse w-[60%]" />
          </div>
        ) : error ? (
          <p className="text-zinc-500 text-sm">
            Tahlil yuklanmadi.{' '}
            <button
              onClick={() => setForceRefresh(n => n + 1)}
              className="text-purple-400 hover:text-purple-300 underline transition-colors"
            >
              Qayta urinish
            </button>
          </p>
        ) : (
          <p className="text-zinc-200 text-sm leading-relaxed">{text}</p>
        )}
      </div>

      {!loading && (
        <button
          onClick={() => setForceRefresh(n => n + 1)}
          title="Yangi tahlil"
          className="shrink-0 text-zinc-700 hover:text-purple-400 text-base transition-colors mt-0.5"
        >
          ↻
        </button>
      )}
    </div>
  );
}
