/**
 * Interview.tsx — Gemini-powered conversational business advisor
 *
 * Gemini drives the conversation naturally, asks follow-up questions,
 * and when it has enough info, outputs the full business plan JSON.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import type { StoredPrice } from '../stores/appStore';
import { AIResultSchema } from '../lib/schema';
import { detectCategory } from '../lib/categoryMap';
import { getFallbackPrices } from '../lib/pricesFallback';
import { checkRevenue } from '../lib/revenueCheck';
import type { PriceContext } from '../lib/templatePlan';
import { buildTemplatePlan } from '../lib/templatePlan';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  id: string;
}

interface HistoryItem {
  role: 'user' | 'model';
  content: string;
}

// ─── Loading stages ───────────────────────────────────────────────────────────

const STAGES = [
  { pct: 10, msg: "Suhbat tahlil qilinmoqda..." },
  { pct: 25, msg: "Joriy bozor narxlari yuklanmoqda..." },
  { pct: 42, msg: "Daromad bozor narxlari bilan solishtirilmoqda..." },
  { pct: 58, msg: "Bank talablari tekshirilmoqda..." },
  { pct: 73, msg: "Moliyaviy prognoz hisoblanmoqda..." },
  { pct: 87, msg: "Soliq rejimi aniqlanmoqda..." },
  { pct: 95, msg: "Biznes-reja yakunlanmoqda..." },
];

// ─── Quick reply chips ────────────────────────────────────────────────────────

const QUICK_REPLIES: Record<number, string[]> = {
  0: ["Novvoyxona", "Sabzavot do'koni", "Kafe / oshxona", "Qurilish", "Kiyim do'koni"],
  3: ["Toshkent", "Samarqand", "Andijon", "Namangan", "Farg'ona", "Buxoro", "Jizzax"],
  5: ["Yangi uskunalar", "Do'konni kengaytirish", "Tovar sotib olish", "Ta'mirlash"],
  7: ["Ha, kvartira bor", "Ha, avtomobil bor", "Yo'q, garovim yo'q"],
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function Interview() {
  const navigate = useNavigate();
  const { setResult, setPrices, setStatus, setError } = useAppStore();

  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [history, setHistory]       = useState<HistoryItem[]>([]);
  const [input, setInput]           = useState('');
  const [botTyping, setBotTyping]   = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage]           = useState(0);
  const [turnCount, setTurnCount]   = useState(0);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const stageTimer  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, botTyping]);

  // Start conversation on mount
  useEffect(() => {
    startConversation();
  }, []);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      role: 'bot',
      text,
      id: `bot-${Date.now()}`,
    }]);
  };

  const startConversation = async () => {
    setBotTyping(true);
    try {
      // Send empty first message to get the opening question from Gemini
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [{ role: 'user', content: 'Salom' }],
        }),
      });
      const data = await res.json();
      const opening = data.message || "Salom! Men sizning biznesingiz uchun kredit tayyorgarlik ballini hisoblayman va biznes-reja tuzaman. Avval aytib bering — biznesingiz nima bilan shug'ullanadi?";
      addBotMessage(opening);
      setHistory([
        { role: 'user', content: 'Salom' },
        { role: 'model', content: opening },
      ]);
    } catch {
      const fallback = "Salom! Biznesingiz haqida gaplashaylik. Qanday biznes bilan shug'ullanasiz?";
      addBotMessage(fallback);
      setHistory([
        { role: 'user', content: 'Salom' },
        { role: 'model', content: fallback },
      ]);
    } finally {
      setBotTyping(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || botTyping || processing) return;

    setInput('');

    // Add user message to chat
    const userMsg: ChatMessage = { role: 'user', text: userText, id: `user-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);

    const newHistory: HistoryItem[] = [
      ...history,
      { role: 'user', content: userText },
    ];
    setHistory(newHistory);
    setTurnCount(c => c + 1);
    setBotTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const { message, done, planJson } = data;

      // Show Gemini's reply
      if (message) {
        addBotMessage(message);
        setHistory(prev => [...prev, { role: 'model', content: message }]);
      }

      setBotTyping(false);

      if (done && planJson) {
        // Gemini finished collecting — process the plan
        await processPlan(planJson, newHistory);
      }

    } catch (err) {
      setBotTyping(false);
      // Fallback response
      const fallback = "Kechirasiz, biroz muammo bo'ldi. Iltimos, qaytadan yozing.";
      addBotMessage(fallback);
      setHistory(prev => [...prev, { role: 'model', content: fallback }]);
    }
  };

  const processPlan = async (planJson: string, convHistory: HistoryItem[]) => {
    setProcessing(true);
    setStatus('loading');

    // Start progress stages
    let stageIndex = 0;
    stageTimer.current = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, STAGES.length - 1);
      setStage(stageIndex);
    }, 2500);

    try {
      // Parse the plan JSON from Gemini
      let result = AIResultSchema.parse(JSON.parse(planJson));
      const facts = result.facts;

      // Load curated market prices for this business category
      const category = detectCategory(facts.business_type);
      let prices: Record<string, StoredPrice> = {};

      if (category.queries.length > 0) {
        prices = getFallbackPrices(category.queries) as Record<string, StoredPrice>;
      }

      // Price context for enriching the plan
      const priceCtx: PriceContext | undefined = Object.keys(prices).length > 0
        ? { prices, category, source: Object.values(prices)[0]?.source }
        : undefined;

      // If business plan sections are thin, enhance with template
      const hasPlan = result.business_plan.financial_forecast?.length > 50;
      if (!hasPlan && priceCtx) {
        const enriched = buildTemplatePlan(facts, priceCtx);
        result = { ...result, business_plan: enriched.business_plan };
      }

      // Revenue check
      const revenueCheck = checkRevenue(facts, prices, category);

      // Store everything
      setPrices(prices, revenueCheck);
      setResult(result);

      if (stageTimer.current) clearInterval(stageTimer.current);
      navigate('/result');

    } catch (err) {
      if (stageTimer.current) clearInterval(stageTimer.current);
      console.error('Plan processing failed:', err);

      // Try to parse partial JSON or fall back to conversation-based extraction
      try {
        // Build a basic plan from conversation using template
        const fallbackResult = buildTemplatePlan({
          business_type: extractFromConversation(convHistory, 'biznes') || 'Biznes',
          region: extractFromConversation(convHistory, 'viloyat') || "Toshkent",
          years_operating: 1,
          monthly_revenue_uzs: 10_000_000,
          loan_purpose: "Biznesni rivojlantirish",
          loan_amount_uzs: 50_000_000,
          loan_term_months: 24,
          has_collateral: false,
          collateral_type: "",
          employees: 2,
          main_competitors: "Bozordagi raqobatchilar",
          two_year_plan: "Biznesni kengaytirish",
        });
        setResult(fallbackResult);
        navigate('/result');
      } catch {
        setStatus('error');
        setError('Biznes reja yaratishda xatolik. Qayta urinib ko\'ring.');
        setProcessing(false);
      }
    }
  };

  // Simple keyword extractor from conversation history
  const extractFromConversation = (hist: HistoryItem[], keyword: string): string | null => {
    const userMessages = hist.filter(h => h.role === 'user').map(h => h.content).join(' ');
    if (keyword === 'biznes') {
      const match = userMessages.match(/\b(novvoy|do'kon|kafe|restoran|qurilish|ferma|tikuv)\w*/i);
      return match?.[0] ?? null;
    }
    if (keyword === 'viloyat') {
      const match = userMessages.match(/\b(toshkent|samarqand|andijon|namangan|farg'ona|buxoro|jizzax|qashqadaryo|surxondaryo|xorazm|navoiy)\b/i);
      return match?.[0] ?? null;
    }
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const progressPct = processing ? STAGES[stage]?.pct ?? 10 : 0;
  const progressMsg = processing ? STAGES[stage]?.msg ?? '' : '';

  // Determine which quick replies to show based on turn count
  const quickReplies = !processing && !botTyping && turnCount < 10
    ? (QUICK_REPLIES[turnCount] ?? [])
    : [];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">

      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <span>←</span>
          <span className="hidden sm:inline">Bosh sahifa</span>
        </button>

        <div className="text-center">
          <p className="text-white font-semibold text-sm">BiznesPlan AI</p>
          <p className="text-slate-500 text-xs">Kredit tayyorgarlik</p>
        </div>

        <div className="text-right">
          <p className="text-emerald-400 text-sm font-mono">{turnCount} / 10</p>
        </div>
      </header>

      {/* ── Processing overlay ── */}
      {processing && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-sm space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center">
              <span className="text-3xl animate-pulse">🤖</span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg mb-1">Biznes-reja tayyorlanmoqda</p>
              <p className="text-slate-400 text-sm">{progressMsg}</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-slate-600 text-xs">Bozor narxlari · Soliq tahlili · AI reja</p>
          </div>
        </div>
      )}

      {/* ── Chat messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            {msg.role === 'bot' && (
              <div className="w-9 h-9 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center text-lg shrink-0 mt-0.5">
                🤖
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-100 rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {botTyping && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center text-lg shrink-0">
              🤖
            </div>
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick reply chips ── */}
      {quickReplies.length > 0 && (
        <div className="shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto">
          {quickReplies.map(r => (
            <button
              key={r}
              onClick={() => sendMessage(r)}
              className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-600 text-slate-300 hover:text-white text-xs rounded-full transition-all"
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-800 bg-slate-950">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Javob yozing..."
            rows={1}
            disabled={botTyping || processing}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 focus:border-emerald-600 rounded-2xl text-white text-sm placeholder-slate-500 outline-none resize-none transition-colors disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || botTyping || processing}
            className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl flex items-center justify-center transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-slate-700 text-xs mt-1.5 text-center">Enter — yuborish · Shift+Enter — yangi qator</p>
      </div>
    </div>
  );
}
