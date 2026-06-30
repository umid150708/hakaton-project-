/**
 * Interview.tsx — AI Business Advisory Chatbot
 *
 * A conversational chatbot that helps entrepreneurs with:
 *  - How to get credit from banks
 *  - Disability benefits and tax incentives
 *  - Tax regime advice
 *  - General business guidance
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

// ─── Quick reply chips (content-aware) ────────────────────────────────────────

interface QuickReplyRule {
  pattern: RegExp;
  replies: string[];
}

const QUICK_REPLY_RULES: QuickReplyRule[] = [
  {
    pattern: /nima\s*(bilan)?\s*yordam|qanday\s*savol|nimani\s*bilmoqchi|qanday\s*maslahat/i,
    replies: ["Kredit olish haqida", "Soliq imtiyozlari", "Nogironlik imtiyozlari", "Biznes maslahat"],
  },
  {
    pattern: /biznes(ingiz)?\s*nima|qanday\s*biznes|faoliyat|soha/i,
    replies: ["Novvoyxona", "Sabzavot do'koni", "Kafe / oshxona", "Tikuvchilik", "Qurilish"],
  },
  {
    pattern: /qaysi\s*viloyat|qayerda|mintaqa|shahar/i,
    replies: ["Toshkent", "Samarqand", "Andijon", "Farg'ona", "Jizzax", "Buxoro"],
  },
  {
    pattern: /kredit|bank|qarz|ssuda|moliya/i,
    replies: ["Qanday hujjat kerak?", "Garovsiz kredit bormi?", "Qaysi bank yaxshi?", "Foiz stavkasi qancha?"],
  },
  {
    pattern: /nogironlik|imtiyoz|guruh|TIEK|pensiya/i,
    replies: ["Soliq yengilliklari", "Pensiya miqdori", "Garovsiz mikrokreditlar", "Qanday ariza beraman?"],
  },
  {
    pattern: /soliq|patent|SST|QQS|INPS/i,
    replies: ["Patent foydali mi?", "SST qancha foiz?", "QQS qachon kerak?", "Xodimlar solig'i"],
  },
  {
    pattern: /garov|kafolat|ko['']chmas/i,
    replies: ["Garovsiz kredit bormi?", "Uy garov sifatida", "Avtomobil garov", "Kafil kerakmi?"],
  },
  {
    pattern: /hujjat|ariza|ro['']yxat|kerak/i,
    replies: ["Kredit uchun hujjatlar", "Soliq uchun hujjatlar", "INSON markazi", "Soliq inspeksiyasi"],
  },
];

// Initial suggestions shown at start
const INITIAL_SUGGESTIONS = [
  "Kredit olish haqida maslahat",
  "Nogironlik imtiyozlari",
  "Soliq rejimi tanlash",
  "Biznesni rivojlantirish",
];

function detectQuickReplies(lastBotMessage: string): string[] {
  if (!lastBotMessage) return INITIAL_SUGGESTIONS;
  for (const rule of QUICK_REPLY_RULES) {
    if (rule.pattern.test(lastBotMessage)) {
      return rule.replies;
    }
  }
  return [];
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Interview() {
  const navigate = useNavigate();

  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [history, setHistory]     = useState<HistoryItem[]>([]);
  const [input, setInput]         = useState('');
  const [botTyping, setBotTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [{ role: 'user', content: 'Salom' }],
        }),
      });
      const data = await res.json();
      const opening = data.message || "Assalomu alaykum! Men sizga kredit olish, soliq imtiyozlari, nogironlik yengilliklari va biznes masalalari bo'yicha maslahat bera olaman. Qanday yordam kerak?";
      addBotMessage(opening);
      setHistory([
        { role: 'user', content: 'Salom' },
        { role: 'model', content: opening },
      ]);
    } catch {
      const fallback = "Assalomu alaykum! Biznesingiz bo'yicha maslahat kerakmi? Kredit, soliq, imtiyozlar — istalgan savolingizga javob beraman.";
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
    if (!userText || botTyping) return;

    setInput('');

    // Add user message to chat
    const userMsg: ChatMessage = { role: 'user', text: userText, id: `user-${Date.now()}` };
    setMessages(prev => [...prev, userMsg]);

    const newHistory: HistoryItem[] = [
      ...history,
      { role: 'user', content: userText },
    ];
    setHistory(newHistory);
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
      const message = data.message || "Kechirasiz, javob berishda muammo bo'ldi.";

      addBotMessage(message);
      setHistory(prev => [...prev, { role: 'model', content: message }]);
    } catch {
      const fallback = "Kechirasiz, biroz muammo bo'ldi. Iltimos, qaytadan yozing.";
      addBotMessage(fallback);
      setHistory(prev => [...prev, { role: 'model', content: fallback }]);
    } finally {
      setBotTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Determine which quick replies to show based on last bot message content
  const botMessages = messages.filter(m => m.role === 'bot');
  const lastBotMsg = botMessages.length > 0 ? botMessages[botMessages.length - 1].text : '';
  const quickReplies = !botTyping ? detectQuickReplies(lastBotMsg) : [];

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
          <p className="text-slate-500 text-xs">Tadbirkor maslahatchi</p>
        </div>

        <button
          onClick={() => navigate('/bozor')}
          className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
        >
          📊 Bozor
        </button>
      </header>

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
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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
            placeholder="Savolingizni yozing..."
            rows={1}
            disabled={botTyping}
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
            disabled={!input.trim() || botTyping}
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
