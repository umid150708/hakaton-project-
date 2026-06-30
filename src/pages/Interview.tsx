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

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  id: string;
}

interface HistoryItem {
  role: 'user' | 'model';
  content: string;
}

const WELCOME_MESSAGE =
  "Salom! Men O'zbekiston tadbirkorlari uchun AI maslahatchiман. 👋\n\nQuyidagi mavzularda yordam bera olaman:\n• 🏦 Bankdan kredit olish (hujjatlar, talablar, eng mos bank)\n• ♿ Nogironligi bo'lgan tadbirkorlar uchun imtiyozlar\n• 🧾 Soliq rejimlari (Patent, SST, QQS)\n• 📋 Davlat dasturlari va qo'llab-quvvatlash\n• 💼 Biznes bo'yicha umumiy savollar\n\nSavolingizni yozing — javob beraman!";

const QUICK_QUESTIONS = [
  "Kredit olish uchun qanday hujjatlar kerak?",
  "Nogironligim bor, qanday imtiyozlar bor?",
  "Patent va SST qaysi biri foydali?",
  "Garovsiz kredit olish mumkinmi?",
  "YaTT bo'lib ro'yxatdan o'tsam solig'im qancha?",
];

export default function ChatBot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: WELCOME_MESSAGE, id: 'welcome' },
  ]);
  const [history, setHistory]   = useState<HistoryItem[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
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

    const newHistory: HistoryItem[] = [
      ...history,
      { role: 'user', content: trimmed },
    ];

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const botText = data.message || "Javob olinmadi. Qaytadan urinib ko'ring.";

      const botMsg: ChatMessage = {
        role: 'bot',
        text: botText,
        id: Date.now().toString() + '_bot',
      };
      setMessages(prev => [...prev, botMsg]);
      setHistory([...newHistory, { role: 'model', content: botText }]);
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

  // Render bot text: newlines → <br>, **bold**
  const formatText = (text: string) => {
    return text.split('\n').map((line, i, arr) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
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
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-white text-xl leading-none"
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
                    : 'bg-slate-800 text-slate-100 rounded-tl-sm'
                }`}
              >
                {formatText(msg.text)}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Typing dots */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Quick question chips (only on first message) ── */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-600 text-xs mb-2">Tez savollar:</p>
            <div className="flex gap-2 flex-wrap">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded-full transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="border-t border-slate-800 bg-slate-950 px-4 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Savolingizni yozing..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 focus:border-emerald-600 rounded-xl text-white text-sm placeholder-slate-500 outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-colors"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
              : <span className="text-lg">➤</span>
            }
          </button>
        </form>
        <p className="text-center text-slate-700 text-xs mt-2">
          Savdo-sanoat palatasi · soliq.uz · lex.uz · Ijtimoiy himoya milliy agentligi
        </p>
      </div>
    </div>
  );
}
