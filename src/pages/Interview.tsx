import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../lib/questions';
import { useAppStore } from '../stores/appStore';
import { AIResultSchema } from '../lib/schema';
import { extractFacts } from '../lib/extractFacts';
import { buildTemplatePlan } from '../lib/templatePlan';

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatMsg =
  | { role: 'bot'; text: string; key: string }
  | { role: 'user'; text: string; qIndex: number; key: string };

// ─── Loading stages ───────────────────────────────────────────────────────────

const STAGES = [
  { pct: 12,  msg: "Javoblaringiz tahlil qilinmoqda..." },
  { pct: 28,  msg: "Biznes profili tuzilmoqda..." },
  { pct: 48,  msg: "Bank talablari solishtirilmoqda..." },
  { pct: 65,  msg: "Moliyaviy prognoz hisoblanmoqda..." },
  { pct: 80,  msg: "Biznes-reja yozilmoqda..." },
  { pct: 93,  msg: "Kredit tayyorgarlik tekshirilmoqda..." },
  { pct: 99,  msg: "Deyarli tayyor..." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2 msg-bot">
      <BotAvatar />
      <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" />
        <span className="typing-dot w-2 h-2 rounded-full bg-slate-400 inline-block" />
      </div>
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center text-sm shrink-0 mb-0.5">
      🤖
    </div>
  );
}

function LoadingScreen({ stage }: { stage: number }) {
  const s = STAGES[Math.min(stage, STAGES.length - 1)];
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      {/* Progress bar */}
      <div className="w-full max-w-xs mb-12">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Tahlil qilinmoqda</span>
          <span className="text-emerald-400 font-medium">{s.pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${s.pct}%` }}
          />
        </div>
      </div>

      {/* Animated icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl">
          🏦
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-500 border-t-transparent animate-spin opacity-40" />
      </div>

      <p className="text-white text-lg font-semibold text-center mb-2 slide-up">{s.msg}</p>
      <p className="text-slate-500 text-sm">~25–35 soniya</p>

      {/* Stage dots */}
      <div className="flex gap-2 mt-10">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i <= stage ? '20px' : '6px',
              height: '6px',
              backgroundColor: i <= stage ? '#10b981' : '#1e293b',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Interview() {
  const navigate = useNavigate();
  const { setAnswer, setResult, setStatus, answers } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([
    { role: 'bot', text: QUESTIONS[0].text, key: 'bot-0' },
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentQ = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;
  const progress = (currentIndex / QUESTIONS.length) * 100;
  const trimmedInput = inputValue.trim();
  const canSubmit = trimmedInput.length >= 2;

  // Focus input when question changes
  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentIndex]);

  // Scroll to bottom on new chat messages or typing indicator
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, showTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 130) + 'px';
  }, [inputValue]);

  // Rotate loading stages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStage(s => Math.min(s + 1, STAGES.length - 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // ── Handle sending an answer ──────────────────────────────────────────────

  const sendAnswer = useCallback(async (answer: string) => {
    const text = answer.trim();
    if (!text || text.length < 2) return;

    // Add user bubble
    setChat(c => [...c, { role: 'user', text, qIndex: currentIndex, key: `user-${currentIndex}` }]);
    setAnswer(currentIndex, currentQ.text, text);
    setInputValue('');

    if (!isLast) {
      // Show typing indicator briefly, then next question
      setShowTyping(true);
      await new Promise(r => setTimeout(r, 600));
      setShowTyping(false);
      const next = QUESTIONS[currentIndex + 1];
      setChat(c => [...c, { role: 'bot', text: next.text, key: `bot-${currentIndex + 1}` }]);
      setCurrentIndex(i => i + 1);
    } else {
      await submitToAPI(text);
    }
  }, [currentIndex, currentQ, isLast]);

  // ── Submit all answers ────────────────────────────────────────────────────

  const submitToAPI = async (finalAnswer: string) => {
    const allAnswers = QUESTIONS.map((q, i) => {
      if (i === currentIndex) return { question: q.text, answer: finalAnswer };
      const stored = answers[i];
      return stored ? { question: q.text, answer: stored.answer } : null;
    }).filter(Boolean) as { question: string; answer: string }[];

    setIsLoading(true);
    setLoadingStage(0);
    setStatus('loading');

    // ── Step 1: Extract facts from actual answers (client-side, instant) ──
    const facts = extractFacts(allAnswers);

    // ── Step 2: Try the AI API for richer narrative ──
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90_000);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: allAnswers }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const raw = await res.text();
      const result = AIResultSchema.parse(JSON.parse(raw));
      setResult(result);
      navigate('/result');
      return;
    } catch (err) {
      console.warn('API unavailable — using client-side plan generation:', err);
    }

    // ── Step 3: Fallback — build plan from extracted facts (always real data) ──
    const result = buildTemplatePlan(facts);
    setResult(result);
    navigate('/result'); // no ?demo=1 — this is based on THEIR answers
  };

  // ── Go back to previous question ──────────────────────────────────────────

  const goBack = () => {
    if (currentIndex === 0) {
      navigate('/');
      return;
    }
    // Remove the last user bubble and current bot bubble from chat
    setChat(c => c.slice(0, -2));
    // Restore previous answer in textarea
    const prev = answers[currentIndex - 1];
    setInputValue(prev?.answer ?? '');
    setCurrentIndex(i => i - 1);
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) sendAnswer(inputValue);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingScreen stage={loadingStage} />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800/60">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto w-full">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm py-1 px-2 -ml-2 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentIndex === 0 ? 'Bosh sahifa' : 'Orqaga'}
          </button>

          <div className="text-center">
            <p className="text-white text-sm font-semibold leading-none">BiznesPlan AI</p>
            <p className="text-slate-500 text-xs mt-0.5">Kredit tayyorgarlik</p>
          </div>

          <div className="text-right min-w-[48px]">
            <span className="text-emerald-400 font-bold text-sm">{currentIndex + 1}</span>
            <span className="text-slate-600 text-sm"> / {QUESTIONS.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* ── Chat history ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {chat.map(msg => (
            msg.role === 'bot' ? (
              <div key={msg.key} className="flex justify-start items-end gap-2.5 msg-bot">
                <BotAvatar />
                <div className="max-w-[80%] bg-slate-800 text-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={msg.key} className="flex justify-end items-end gap-2.5 msg-user">
                <div className="max-w-[80%] bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                  {msg.text}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm shrink-0 mb-0.5">
                  👤
                </div>
              </div>
            )
          ))}

          {/* Typing indicator */}
          {showTyping && <TypingIndicator />}
        </div>

        <div ref={chatEndRef} className="h-4" />
      </div>

      {/* ── Input area ── */}
      <div className="border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 max-w-2xl mx-auto w-full">

        {/* Example hint — clickable */}
        <button
          onClick={() => {
            setInputValue(currentQ.example);
            textareaRef.current?.focus();
          }}
          className="flex items-center gap-2 mb-3 text-xs text-slate-500 hover:text-emerald-400 transition-colors group"
        >
          <span className="text-amber-500">💡</span>
          <span className="group-hover:underline">
            Namuna: <span className="text-slate-400 group-hover:text-emerald-400">{currentQ.example}</span>
          </span>
        </button>

        {/* Textarea + send */}
        <div className="flex gap-3 items-end">
          <div
            className="flex-1 bg-slate-800 rounded-2xl border transition-colors"
            style={{ borderColor: trimmedInput.length >= 2 ? '#10b981' : '#334155' }}
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentQ.placeholder}
              rows={1}
              className="w-full bg-transparent text-white placeholder-slate-500 rounded-2xl px-4 py-3 resize-none outline-none text-sm leading-relaxed"
              style={{ maxHeight: '130px', overflowY: 'auto' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={() => sendAnswer(inputValue)}
            disabled={!canSubmit}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canSubmit ? '#10b981' : '#1e293b',
              color: canSubmit ? '#0f172a' : '#475569',
            }}
          >
            {isLast ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>

        {/* Hint text */}
        <p className="text-slate-700 text-xs mt-2.5 text-center">
          Enter — yuborish &nbsp;·&nbsp; Shift+Enter — yangi qator
        </p>
      </div>

    </div>
  );
}
