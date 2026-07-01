/**
 * Interview.tsx — AI Business Advisor Chatbot
 *
 * A conversational chatbot that helps Uzbekistan entrepreneurs with:
 *  - Getting bank credit (documents, requirements, best bank)
 *  - Disability benefits & tax incentives
 *  - Tax regime advice (Patent vs SST)
 *  - Government programs
 *  - General business questions
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChartBar, IconSwords, IconBuildingSkyscraper, IconArrowRight, IconFileText, type Icon } from '@tabler/icons-react';
import { getUser, useAuth } from '../lib/auth';
import { learnFromMessage, profileSummary } from '../lib/profile';
import {
  ANALYSIS_META, analysisSystem, buildAnalysisPrompt, canAnalyse, type AnalysisType,
} from '../lib/analysis';
import BusinessPlanWizard from '../components/BusinessPlanWizard';
import ThemeToggle from '../components/ThemeToggle';

const ANALYSIS_ICON: Record<AnalysisType, Icon> = {
  bozor:   IconChartBar,
  raqobat: IconSwords,
  sanoat:  IconBuildingSkyscraper,
};

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  id: string;
  kind?: 'analysis';   // rendered as a full-width titled card
  title?: string;
}

interface HistoryItem {
  role: 'user' | 'model';
  content: string;
}

const WELCOME_MESSAGE =
  "Salom! Men O'zbekiston tadbirkorlari uchun AI maslahatchiман. 👋\n\nQuyidagi mavzularda yordam bera olaman:\n• 🏦 Bankdan kredit olish (hujjatlar, talablar, eng mos bank)\n• ♿ Nogironligi bo'lgan tadbirkorlar uchun imtiyozlar\n• 🧾 Soliq rejimlari (Patent, SST, QQS)\n• 📋 Davlat dasturlari va qo'llab-quvvatlash\n• 💼 Biznes bo'yicha umumiy savollar\n\nSavolingizni yozing — javob beraman!";

const DEFAULT_CHIPS = [
  "Kredit olish uchun qanday hujjatlar kerak?",
  "Nogironligim bor, qanday imtiyozlar bor?",
  "Patent va SST qaysi biri foydali?",
  "Garovsiz kredit olish mumkinmi?",
  "YaTT bo'lib ro'yxatdan o'tsam solig'im qancha?",
];

// Detect what follow-up chips to show based on bot's last message
function detectChips(botText: string): string[] {
  const t = botText.toLowerCase();

  // Disability group
  if (t.includes('guruhingiz') || t.includes('guruh — i') || t.includes('i, ii yoki iii') || t.includes('i, ii yoki'))
    return ['I guruh', 'II guruh', 'III guruh', 'Bilmayman'];

  // Collateral / garov
  if (t.includes('garovingiz') || t.includes('garov bormi') || (t.includes('garov') && (t.includes('bormi') || t.includes('bor yoki') || t.includes('mavjudmi') || t.includes('avtomobil'))))
    return ["Ha, ko'chmas mulkim bor", "Ha, avtomobilim bor", "Yo'q, garovsiz kerak"];

  // Credit amount
  if (t.includes('qancha miqdor') || t.includes('kredit miqdori') || t.includes('necha million') || t.includes('qancha kerak'))
    return ['30–100 mln so\'m', '100–500 mln so\'m', '500 mln – 1 mlrd so\'m', '1 mlrd+ so\'m'];

  // Annual income / tax regime
  if (t.includes('daromadingiz') || t.includes('yillik daromad') || t.includes('500mln') || t.includes('500 mln'))
    return ['500 mln dan kam', '500 mln – 1 mlrd', '1 mlrd dan ko\'p', 'Bilmayman'];

  // YaTT registration
  if (t.includes('yatt sifatida') || t.includes("ro'yxatdan o'tganmisiz") || t.includes('yakka tadbirkor'))
    return ["Ha, YaTT sifatida ro'yxatdanman", "Yo'q, hali yo'q", "Qanday ro'yxatdan o'taman?"];

  // Which bank
  if (t.includes('qaysi bank') || t.includes('bank tanlash') || t.includes('qaysi bankka'))
    return ['Mikrokreditbank', 'Kapitalbank', 'Aloqabank', 'Bilmayman, tavsiya bering'];

  // Location
  if (t.includes('viloyatingiz') || t.includes('qayerda') || (t.includes('shahar') && t.includes('qaysi')))
    return ['Toshkent', 'Samarqand', "Farg'ona", 'Boshqa viloyat'];

  // Business type
  if (t.includes('faoliyat turi') || t.includes('biznes turi') || t.includes('nima bilan shug\'ul'))
    return ['Savdo (do\'kon)', 'Ishlab chiqarish', 'Xizmat ko\'rsatish', 'Qishloq xo\'jaligi'];

  // Work experience / staj
  if (t.includes('ish staji') || (t.includes('staj') && !t.includes('staj bilan')))
    return ["Ha, ish stajim bor", "Yo'q, stajim yetarli emas", "Bilmayman"];

  // Employees
  if (t.includes('xodim') || t.includes('ishchilar soni'))
    return ['Faqat o\'zim', '1–5 xodim', '5–20 xodim', '20+ xodim'];

  // Yes/No follow-ups
  if (t.includes('bormi?') || t.includes('bormi —') || t.includes('bormisiz'))
    return ["Ha, bor", "Yo'q, yo'q", "Bilmayman"];

  return DEFAULT_CHIPS;
}

export default function ChatBot() {
  const navigate = useNavigate();
  const user     = useAuth();
  const ready    = canAnalyse(user);   // have enough profile for a tailored analysis?
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: WELCOME_MESSAGE, id: 'welcome' },
  ]);
  const [history, setHistory]   = useState<HistoryItem[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [chips, setChips]       = useState<string[]>(DEFAULT_CHIPS);
  const [showPlan, setShowPlan] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: trimmed, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Learn facts about the user from this message (disability, location, etc.)
    learnFromMessage(trimmed);

    const newHistory: HistoryItem[] = [
      ...history,
      { role: 'user', content: trimmed },
    ];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory, profile: profileSummary(getUser()) }),
        signal: AbortSignal.timeout(30_000),
      });

      const data = await res.json();
      // Server always returns a message (even on error it returns friendly fallback)
      const botText = data.message || "Javob olinmadi. Qaytadan urinib ko'ring.";

      const botMsg: ChatMessage = {
        role: 'bot',
        text: botText,
        id: Date.now().toString() + '_bot',
      };
      setMessages(prev => [...prev, botMsg]);
      setHistory([...newHistory, { role: 'model', content: botText }]);
      setChips(detectChips(botText));
    } catch (err) {
      const errText = String(err).includes('timeout')
        ? "Ulanish vaqti tugadi. Qaytadan urinib ko'ring."
        : "Xatolik yuz berdi. Internet aloqasini tekshiring.";
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: errText, id: Date.now().toString() + '_err' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Run one of the three structured analyses on the signed-in user's profile.
  const runAnalysis = async (type: AnalysisType) => {
    if (loading) return;
    const u    = getUser();
    const meta = ANALYSIS_META[type];

    // Always echo the chosen analysis as a user message.
    setMessages(prev => [...prev, { role: 'user', text: meta.label, id: Date.now().toString() }]);

    // Need at least the business type to tailor the analysis.
    if (!canAnalyse(u)) {
      setMessages(prev => [...prev, {
        role: 'bot',
        id: Date.now().toString() + '_np',
        text: "Aniq tahlil uchun avval profilingizni to'ldiring — kamida **biznes turingizni** kiriting. Shunda tahlil aynan sizning biznesingizga moslanadi.\n\nProfil → yuqoridagi hisobingiz orqali.",
      }]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system:    analysisSystem(type),
          prompt:    buildAnalysisPrompt(type, u),
          maxTokens: 1200,
        }),
        signal: AbortSignal.timeout(35_000),
      });
      const data = await res.json();
      const text = (data?.text ?? '').trim() || "Tahlil olinmadi. Qaytadan urinib ko'ring.";
      setMessages(prev => [...prev, {
        role: 'bot', id: Date.now().toString() + '_an', text, kind: 'analysis', title: meta.label,
      }]);
    } catch (err) {
      const errText = String(err).includes('timeout')
        ? "Tahlil vaqti tugadi. Qaytadan urinib ko'ring."
        : "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
      setMessages(prev => [...prev, { role: 'bot', id: Date.now().toString() + '_ae', text: errText }]);
    } finally {
      setLoading(false);
    }
  };

  // Render bot text: strip markdown headers, render bullets, bold, newlines
  const formatText = (text: string) => {
    return text.split('\n').map((line, i, arr) => {
      // Strip ### ## # headers — render as plain bold text
      const headerMatch = line.match(/^#{1,3}\s+(.+)/);
      if (headerMatch) {
        return (
          <span key={i}>
            <strong>{headerMatch[1]}</strong>
            {i < arr.length - 1 && <br />}
          </span>
        );
      }

      // Convert "* text" or "- text" bullets → "• text"
      const bulletLine = line.replace(/^\s*[\*\-]\s+/, '• ');

      // Bold: **text**
      const parts = bulletLine.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : part
      );

      return (
        <span key={i}>
          {parts}
          {i < arr.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-faint hover:text-ink text-xl leading-none btn-icon"
          >←</button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-ink font-semibold text-sm leading-tight">Bozorboy Maslahatchi</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-brand rounded-full" />
                <p className="text-brand text-xs">Onlayn</p>
              </div>
            </div>
          </div>
          <ThemeToggle />
          <button
            onClick={() => setShowPlan(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand hover:bg-brand-hover text-brand-ink text-xs font-semibold rounded-lg transition-colors btn-cta"
          >
            <IconFileText size={14} /> Biznes reja
          </button>
          <button
            onClick={() => navigate('/bozor')}
            className="hidden sm:block px-3 py-1.5 bg-sky hover:bg-sky/90 text-white text-xs font-medium rounded-lg transition-colors btn-cta"
          >
            Bozor narxlari →
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {messages.map(msg => (
            msg.kind === 'analysis' ? (
              // Full-width titled analysis card
              <div key={msg.id} className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>
                <div className="flex-1 min-w-0 bg-surface border border-line rounded-2xl rounded-tl-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-line bg-brand-soft flex items-center gap-2">
                    <IconChartBar size={15} className="text-brand" />
                    <span className="text-brand text-xs font-semibold uppercase tracking-wide">{msg.title}</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-ink leading-relaxed [&_strong]:text-ink [&_strong]:font-semibold">
                    {formatText(msg.text)}
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand text-brand-ink rounded-tr-sm'
                      : 'bg-elevated text-ink rounded-tl-sm'
                  }`}
                >
                  {formatText(msg.text)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-elevated rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                    👤
                  </div>
                )}
              </div>
            )
          ))}

          {/* Typing dots */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-elevated px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── AI analysis modes ── */}
      <div className="px-4 pt-2">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <p className="text-faint text-xs">AI bozor tahlili:</p>
            {!ready && (
              <button onClick={() => navigate('/profile')}
                className="flex items-center gap-1 text-brand hover:text-brand text-xs transition-colors link-quiet">
                Profilni to'ldiring <IconArrowRight size={13} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(ANALYSIS_META) as AnalysisType[]).map(t => {
              const m  = ANALYSIS_META[t];
              const Ic = ANALYSIS_ICON[t];
              return (
                <button key={t} onClick={() => runAnalysis(t)} disabled={loading}
                  className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface border border-line hover:border-brand text-left transition-colors disabled:opacity-50 card-tap">
                  <Ic size={18} className="text-brand" />
                  <span className="text-ink text-xs font-semibold leading-tight">{m.label}</span>
                  <span className="text-faint text-[11px] leading-tight">{m.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick question chips (always visible) ── */}
      <div className="px-4 pb-2 pt-3">
        <div className="max-w-2xl mx-auto">
          <p className="text-faint text-xs mb-2">Tez savollar:</p>
          <div className="flex gap-2 flex-wrap">
            {chips.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="px-3 py-1.5 bg-elevated hover:bg-elevated border border-line-strong text-muted text-xs rounded-full transition-colors disabled:opacity-50 btn-soft"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Input ── */}
      <div className="border-t border-line bg-page px-4 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Savolingizni yozing..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-elevated border border-line-strong focus:border-brand rounded-xl text-ink text-sm placeholder:text-faint outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-brand hover:bg-brand-hover disabled:bg-elevated disabled:text-faint text-brand-ink rounded-xl transition-colors btn-icon"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
              : <span className="text-lg">➤</span>
            }
          </button>
        </form>
        <p className="text-center text-faint text-xs mt-2">
          Savdo-sanoat palatasi · soliq.uz · lex.uz · Ijtimoiy himoya milliy agentligi
        </p>
      </div>

      {showPlan && <BusinessPlanWizard onClose={() => setShowPlan(false)} />}
    </div>
  );
}
