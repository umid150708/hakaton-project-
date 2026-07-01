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
import { IconChartBar, IconSwords, IconBuildingSkyscraper, IconArrowRight, type Icon } from '@tabler/icons-react';
import { getUser, useAuth } from '../lib/auth';
import { learnFromMessage, profileSummary } from '../lib/profile';
import {
  ANALYSIS_META, analysisSystem, buildAnalysisPrompt, canAnalyse, type AnalysisType,
} from '../lib/analysis';

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
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-zinc-500 hover:text-white text-xl leading-none"
          >←</button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Biznes Maslahatchi AI</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                <p className="text-emerald-400 text-xs">Onlayn</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/bozor')}
            className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
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
                <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">🤖</div>
                <div className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-zinc-800 bg-emerald-950/20 flex items-center gap-2">
                    <IconChartBar size={15} className="text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">{msg.title}</span>
                  </div>
                  <div className="px-4 py-3 text-sm text-zinc-100 leading-relaxed [&_strong]:text-white [&_strong]:font-semibold">
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
                  <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-sm'
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
                  }`}
                >
                  {formatText(msg.text)}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                    👤
                  </div>
                )}
              </div>
            )
          ))}

          {/* Typing dots */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
            <p className="text-zinc-600 text-xs">AI bozor tahlili:</p>
            {!ready && (
              <button onClick={() => navigate('/profile')}
                className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 text-xs transition-colors">
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
                  className="flex flex-col gap-1 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-700 text-left transition-colors disabled:opacity-50">
                  <Ic size={18} className="text-emerald-400" />
                  <span className="text-white text-xs font-semibold leading-tight">{m.label}</span>
                  <span className="text-zinc-500 text-[11px] leading-tight">{m.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick question chips (always visible) ── */}
      <div className="px-4 pb-2 pt-3">
        <div className="max-w-2xl mx-auto">
          <p className="text-zinc-600 text-xs mb-2">Tez savollar:</p>
          <div className="flex gap-2 flex-wrap">
            {chips.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs rounded-full transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Input ── */}
      <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Savolingizni yozing..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-emerald-600 rounded-xl text-white text-sm placeholder-zinc-500 outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
              : <span className="text-lg">➤</span>
            }
          </button>
        </form>
        <p className="text-center text-zinc-700 text-xs mt-2">
          Savdo-sanoat palatasi · soliq.uz · lex.uz · Ijtimoiy himoya milliy agentligi
        </p>
      </div>
    </div>
  );
}
