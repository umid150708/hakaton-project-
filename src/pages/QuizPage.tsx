import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLevelById } from '../data/learningContent';
import { saveQuizScore, getQuizBestScore, useProgress } from '../lib/learnProgress';
import { S } from '../lib/learnStrings';
import { PASS_THRESHOLD } from '../data/learningContent';
import ThemeToggle from '../components/ThemeToggle';

type Phase = 'quiz' | 'result';

export default function QuizPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const progress = useProgress();

  const level = getLevelById(Number(levelId));

  const [phase, setPhase] = useState<Phase>('quiz');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ chosen: number; correct: number }[]>([]);

  if (!level) {
    return (
      <div className="min-h-screen bg-page text-ink flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Test topilmadi.</p>
          <button onClick={() => navigate('/oqitish')} className="btn-soft mt-4 text-brand text-sm">← Orqaga</button>
        </div>
      </div>
    );
  }

  const questions = level.quiz.questions;
  const q = questions[current];
  const isLast = current === questions.length - 1;

  // Result calculations
  const score = answers.length > 0
    ? Math.round((answers.filter(a => a.chosen === a.correct).length / questions.length) * 100)
    : 0;
  const passed = score >= PASS_THRESHOLD;
  const prevBest = getQuizBestScore(level.id);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setRevealed(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    const next = [...answers, { chosen: selected, correct: q.correctIndex }];
    setAnswers(next);
    setRevealed(false);
    setSelected(null);

    if (isLast) {
      const finalScore = Math.round(
        (next.filter(a => a.chosen === a.correct).length / questions.length) * 100
      );
      saveQuizScore(level.id, finalScore);
      setPhase('result');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handleRetake = () => {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setPhase('quiz');
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = answers.filter(a => a.chosen === a.correct).length;
    const isNewBest = prevBest === null || score > prevBest;

    return (
      <div className="min-h-screen bg-page text-ink flex flex-col">
        <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Link to={`/oqitish`} className="btn-icon text-faint hover:text-ink text-xl">←</Link>
            <p className="text-ink font-semibold text-sm flex-1">{S.quizTitle} — {level.title}</p>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 flex flex-col items-center justify-center gap-6">
          {/* Score circle */}
          <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
            passed ? 'border-brand bg-brand-soft' : 'border-red-500/60 bg-red-950/30'
          }`}>
            <p className={`text-4xl font-black ${passed ? 'text-brand' : 'text-red-400'}`}>{score}%</p>
            <p className="text-muted text-xs">{correctCount}/{questions.length}</p>
          </div>

          {/* Result message */}
          <div className="text-center max-w-sm">
            {passed ? (
              <>
                <p className="text-2xl font-black text-ink mb-2">🎉 Tabriklaymiz!</p>
                <p className="text-brand font-semibold text-sm mb-1">
                  {S.quizPassed2}
                </p>
                {isNewBest && score > (prevBest ?? 0) && prevBest !== null && (
                  <p className="text-faint text-xs">Yangi rekord: {score}% (oldingi: {prevBest}%)</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xl font-black text-ink mb-2">Yana bir urinish!</p>
                <p className="text-gold text-sm">
                  {S.quizFailed.replace('{score}', String(score)).replace('{pass}', String(PASS_THRESHOLD))}
                </p>
              </>
            )}
          </div>

          {/* Badge earned */}
          {passed && progress.badges.includes(String(level.id)) && (
            <div className="bg-brand-soft border border-brand rounded-2xl px-6 py-4 text-center">
              <p className="text-2xl mb-1">🏅</p>
              <p className="text-brand font-semibold text-sm">{level.title} nishoni qo'lga kiritildi!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            {!passed && (
              <button
                onClick={handleRetake}
                className="btn-cta flex-1 py-3 bg-brand hover:bg-brand-hover text-brand-ink font-bold rounded-xl transition-all"
              >
                {S.retakeQuiz}
              </button>
            )}
            <Link
              to="/oqitish"
              className="btn-soft flex-1 py-3 bg-elevated hover:bg-elevated text-ink font-semibold rounded-xl transition-all text-center"
            >
              {passed ? "O'quv yo'liga qaytish →" : S.backToLevel}
            </Link>
          </div>

          {/* Answer review */}
          <div className="w-full max-w-2xl mt-4 space-y-3">
            <p className="text-xs text-faint uppercase tracking-widest font-medium">Javoblar tahlili</p>
            {questions.map((qq, i) => {
              const a = answers[i];
              const wasCorrect = a?.chosen === qq.correctIndex;
              return (
                <div key={qq.id} className={`rounded-xl border p-4 ${wasCorrect ? 'border-brand bg-brand-soft' : 'border-red-800/40 bg-red-950/10'}`}>
                  <p className="text-ink text-sm font-medium mb-2">{i + 1}. {qq.prompt}</p>
                  <p className="text-xs mb-1">
                    <span className={wasCorrect ? 'text-brand' : 'text-red-400'}>
                      {wasCorrect ? '✓ To\'g\'ri' : '✗ Noto\'g\'ri'}
                    </span>
                    {!wasCorrect && a && (
                      <span className="text-faint"> · Siz: "{qq.options[a.chosen]}" · To'g'ri: "{qq.options[qq.correctIndex]}"</span>
                    )}
                  </p>
                  <p className="text-faint text-xs leading-relaxed">{qq.explanation}</p>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ── Quiz question screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to="/oqitish" className="btn-icon text-faint hover:text-ink text-xl">←</Link>
          <div className="flex-1">
            <p className="text-muted text-xs">{level.title} — {S.quizTitle}</p>
            <p className="text-ink font-semibold text-sm">
              {S.quizQuestion.replace('{current}', String(current + 1)).replace('{total}', String(questions.length))}
            </p>
          </div>
          <ThemeToggle />
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-2">
          <div className="h-1 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Question */}
        <div className="bg-surface border border-line rounded-2xl p-6">
          <p className="text-ink font-semibold text-base leading-relaxed">{q.prompt}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let style = 'border-line-strong bg-surface text-ink hover:border-line-strong hover:bg-elevated';
            if (!revealed) {
              if (selected === i) style = 'border-brand bg-brand-soft text-ink';
            } else {
              if (i === q.correctIndex) style = 'border-brand bg-brand-soft text-brand';
              else if (selected === i && i !== q.correctIndex) style = 'border-red-500 bg-red-950/30 text-red-300';
              else style = 'border-line bg-surface text-faint';
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={revealed}
                className={`card-tap w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all ${style}`}
              >
                <span className="text-faint mr-3">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback after reveal */}
        {revealed && (
          <div className={`rounded-xl p-4 border ${
            selected === q.correctIndex
              ? 'bg-brand-soft border-brand'
              : 'bg-red-950/20 border-red-700/40'
          }`}>
            <p className={`font-semibold text-sm mb-2 ${selected === q.correctIndex ? 'text-brand' : 'text-red-400'}`}>
              {selected === q.correctIndex ? S.correct : S.wrong}
            </p>
            <p className="text-muted text-xs leading-relaxed">
              <span className="text-faint">{S.explanation}: </span>
              {q.explanation}
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="mt-auto">
          {!revealed ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="btn-cta w-full py-3.5 bg-brand hover:bg-brand-hover disabled:bg-elevated disabled:text-faint text-brand-ink font-bold rounded-2xl transition-all"
            >
              {S.quizSubmit}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-cta w-full py-3.5 bg-brand hover:bg-brand-hover text-brand-ink font-bold rounded-2xl transition-all"
            >
              {isLast ? S.quizFinish : S.quizNext}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
