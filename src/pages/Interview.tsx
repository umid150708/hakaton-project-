import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../lib/questions';
import { useAppStore } from '../stores/appStore';
import { AIResultSchema } from '../lib/schema';
import { DEMO_FIXTURE } from '../lib/demoFixture';

const LOADING_MESSAGES = [
  "Biznesingiz tahlil qilinmoqda...",
  "Bank talablari solishtirilmoqda...",
  "Moliyaviy prognoz hisoblanmoqda...",
  "Biznes-reja tuzilmoqda...",
  "Kredit tayyorgarlik tekshirilmoqda...",
];

export default function Interview() {
  const navigate = useNavigate();
  const { setAnswer, setResult, setStatus, setError, answers } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;
  const progress = ((currentIndex) / QUESTIONS.length) * 100;

  useEffect(() => {
    textareaRef.current?.focus();
  }, [currentIndex]);

  // Rotate loading messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleNext = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setAnswer(currentIndex, currentQuestion.text, trimmed);
    setInputValue('');

    if (!isLast) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Save final answer
    setAnswer(currentIndex, currentQuestion.text, trimmed);

    const allAnswers = [
      ...answers,
      { question: currentQuestion.text, answer: trimmed },
    ].filter(Boolean);

    setIsLoading(true);
    setErrorMsg('');
    setStatus('loading');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: allAnswers }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Server xatosi: ${response.status}`);
      }

      const rawJson = await response.text();
      const parsed = JSON.parse(rawJson);
      const result = AIResultSchema.parse(parsed);

      setResult(result);
      navigate('/result');
    } catch (err: unknown) {
      console.error('API error:', err);
      if (err instanceof Error) {
        // Check if it's a Zod validation error (schema mismatch)
        if (err.message.includes('parse') || err.message.includes('validation')) {
          console.error('Schema validation failed. Falling back to demo.');
          console.error('Details:', err.message);
        }
      }
      // Fallback to demo on any error — ensures the demo always works
      setResult(DEMO_FIXTURE);
      navigate('/result?demo=1');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLast) handleSubmit();
      else handleNext();
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8" />
        <p className="text-white text-xl font-semibold mb-3">{LOADING_MESSAGES[loadingMsg]}</p>
        <p className="text-slate-500 text-sm">~20–30 soniya</p>
        <div className="mt-8 flex gap-2">
          {LOADING_MESSAGES.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === loadingMsg ? 'bg-emerald-400' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <span className="text-slate-500 text-sm">BiznesPlan AI</span>
        <span className="text-slate-400 text-sm font-medium">
          {currentIndex + 1} / {QUESTIONS.length}
        </span>
      </header>

      {/* Main question area */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-2xl mx-auto w-full">
        {/* Previous answers preview */}
        {currentIndex > 0 && (
          <div className="w-full mb-6 space-y-2 max-h-32 overflow-y-auto">
            {answers.slice(Math.max(0, currentIndex - 2), currentIndex).map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-slate-600 shrink-0">{a?.question?.slice(0, 25)}...</span>
                <span className="text-slate-400 truncate">{a?.answer}</span>
              </div>
            ))}
          </div>
        )}

        {/* Current question */}
        <div className="w-full bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-4">
          <p className="text-slate-400 text-xs mb-3 uppercase tracking-wider">
            Savol {currentIndex + 1}
          </p>
          <h2 className="text-white text-xl font-semibold mb-5">
            {currentQuestion.text}
          </h2>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentQuestion.placeholder}
            rows={3}
            className="w-full bg-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-emerald-500 text-base"
          />

          {errorMsg && (
            <div className="mt-3 p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
              {errorMsg}
            </div>
          )}
        </div>

        <button
          onClick={isLast ? handleSubmit : handleNext}
          disabled={!inputValue.trim()}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-colors text-base"
        >
          {isLast ? 'Biznes-reja yaratish →' : 'Keyingi →'}
        </button>

        <p className="text-slate-700 text-xs mt-3">Enter — keyingi • Shift+Enter — yangi qator</p>
      </main>
    </div>
  );
}
