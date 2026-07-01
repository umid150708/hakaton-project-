import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLessonById, getLevelById, track } from '../data/learningContent';
import {
  completeLesson,
  isLessonComplete,
  useProgress,
  getLevelProgress,
  getQuizBestScore,
} from '../lib/learnProgress';
import { S } from '../lib/learnStrings';
import { PASS_THRESHOLD } from '../data/learningContent';
import ThemeToggle from '../components/ThemeToggle';

export default function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const progress = useProgress();

  const lesson = getLessonById(lessonId ?? '');
  if (!lesson) {
    return (
      <div className="min-h-screen bg-page text-ink flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Dars topilmadi.</p>
          <button onClick={() => navigate('/oqitish')} className="mt-4 text-brand text-sm">← Orqaga</button>
        </div>
      </div>
    );
  }

  const level = getLevelById(lesson.levelId);
  const done = isLessonComplete(lesson.id);
  const levelPct = getLevelProgress(lesson.levelId);
  const allLessonsDone = levelPct === 100;
  const quizBest = getQuizBestScore(lesson.levelId);
  const quizPassed = (quizBest ?? 0) >= PASS_THRESHOLD;

  // Find next lesson in the same or next level
  const allLessons = track.levels.flatMap(lv => lv.lessons.map(ls => ({ ...ls, levelId: lv.id })));
  const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
  const nextLesson = allLessons[currentIdx + 1] ?? null;

  const handleComplete = () => {
    completeLesson(lesson.id);
  };

  const handleAskAI = () => {
    navigate('/interview', { state: { seedMessage: `${lesson.title} haqida savol: ` } });
  };

  const isTodo = lesson.videoId === 'TODO_VIDEO_ID';

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/oqitish" className="text-faint hover:text-ink text-xl leading-none">{S.backToRoadmap}</Link>
          <div className="flex-1 min-w-0">
            <p className="text-muted text-xs truncate">Daraja {lesson.levelId} · {level?.title}</p>
            <p className="text-ink font-semibold text-sm truncate">{lesson.title}</p>
          </div>
          {done && (
            <span className="text-brand text-xs font-medium shrink-0">✓ Bajarildi</span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ── Meta row (duration + XP) ── */}
        <div className="flex items-center gap-3 text-xs text-faint">
          <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
          <span>{lesson.durationNote}</span>
          <span className="text-faint">·</span>
          <span className="text-brand">+{lesson.xp} XP</span>
        </div>

        {/* ── Summary / lead paragraph ── */}
        <div className="bg-surface border border-line rounded-2xl p-5">
          <p className="text-muted text-base leading-relaxed">{lesson.summary}</p>
        </div>

        {/* ── Written lesson (Khan Academy style) — always present ── */}
        <article className="bg-surface border border-line rounded-2xl p-6 space-y-6">
          {lesson.body.map((section, i) => (
            <section key={i} className="space-y-3">
              <h2 className="text-ink font-bold text-lg tracking-tight flex items-center gap-2">
                <span className="text-brand text-sm font-black">{String(i + 1).padStart(2, '0')}</span>
                {section.heading}
              </h2>
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-muted text-sm leading-relaxed">{p}</p>
              ))}
            </section>
          ))}
        </article>

        {/* ── Video (optional — only when a verified video exists) ── */}
        {!isTodo && (
          <div className="space-y-2">
            <p className="text-xs text-faint font-medium uppercase tracking-wider">{S.videoOptional}</p>
            <div className="rounded-2xl overflow-hidden bg-surface border border-line aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-faint">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{S.channel}:</span>
              <a
                href={lesson.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-ink underline underline-offset-2 transition-colors"
              >
                {lesson.channel}
              </a>
            </div>
          </div>
        )}

        {/* ── Key takeaways ── */}
        <div className="bg-surface border border-line rounded-2xl p-5">
          <p className="text-ink font-semibold text-sm mb-4">{S.keyTakeaways}</p>
          <ul className="space-y-3">
            {lesson.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-brand-soft text-brand flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-muted leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Sources / citations ── */}
        <div className="bg-surface/60 border border-line rounded-2xl p-5">
          <p className="text-ink font-semibold text-sm mb-1">{S.sources}</p>
          <p className="text-faint text-xs mb-4">{S.sourcesNote}</p>
          <ul className="space-y-2">
            {lesson.sources.map((src, i) => (
              <li key={i} className="flex gap-2.5 text-sm items-start">
                <span className="text-faint shrink-0 mt-0.5">↗</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-brand underline underline-offset-2 decoration-zinc-700 transition-colors leading-relaxed"
                >
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Tool CTA (if applicable) ── */}
        {lesson.toolLink && lesson.toolCta && (
          <div className="bg-surface border border-line-strong rounded-2xl p-5 flex items-center gap-4">
            <span className="text-2xl shrink-0">🛠️</span>
            <div className="flex-1">
              <p className="text-xs text-faint mb-1">{S.practiceTitle}</p>
              <p className="text-ink text-sm font-medium">{lesson.toolCta}</p>
            </div>
            <Link
              to={lesson.toolLink}
              className="shrink-0 px-4 py-2 bg-elevated hover:bg-elevated text-brand text-xs font-semibold rounded-xl transition-colors"
            >
              Ochish →
            </Link>
          </div>
        )}

        {/* ── AI advisor button ── */}
        <button
          onClick={handleAskAI}
          className="w-full flex items-center gap-3 bg-surface hover:bg-elevated border border-line-strong hover:border-brand text-ink rounded-2xl px-5 py-4 transition-all text-left"
        >
          <span className="w-9 h-9 bg-brand rounded-full flex items-center justify-center text-sm shrink-0">🤖</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{S.askAI}</p>
            <p className="text-faint text-xs">{lesson.title} haqida savol bering</p>
          </div>
          <span className="text-faint text-lg">→</span>
        </button>

        {/* ── Mark complete ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!done ? (
            <button
              onClick={handleComplete}
              className="flex-1 py-3.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-2xl transition-all active:scale-95 text-sm"
            >
              {S.markComplete.replace('{xp}', String(lesson.xp))}
            </button>
          ) : (
            <div className="flex-1 py-3.5 bg-elevated text-brand font-semibold rounded-2xl text-sm text-center">
              {S.alreadyComplete}
            </div>
          )}

          {nextLesson && nextLesson.levelId === lesson.levelId && (
            <Link
              to={`/oqitish/dars/${nextLesson.id}`}
              className="flex-1 py-3.5 bg-elevated hover:bg-elevated text-ink font-semibold rounded-2xl transition-all text-sm text-center"
            >
              {S.nextLesson}
            </Link>
          )}
        </div>

        {/* ── Quiz CTA when all lessons in this level are done ── */}
        {allLessonsDone && !quizPassed && (
          <Link
            to={`/oqitish/test/${lesson.levelId}`}
            className="block w-full py-3.5 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold rounded-2xl transition-all text-center text-sm"
          >
            {S.quizCta}
          </Link>
        )}
        {quizPassed && (
          <div className="text-center text-brand text-sm font-medium py-2">
            {S.quizPassed} — Daraja {lesson.levelId + 1} ochildi 🎉
          </div>
        )}
      </main>
    </div>
  );
}
