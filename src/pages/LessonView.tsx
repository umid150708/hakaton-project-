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

export default function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const progress = useProgress();

  const lesson = getLessonById(lessonId ?? '');
  if (!lesson) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Dars topilmadi.</p>
          <button onClick={() => navigate('/oqitish')} className="mt-4 text-emerald-400 text-sm">← Orqaga</button>
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/oqitish" className="text-zinc-500 hover:text-white text-xl leading-none">{S.backToRoadmap}</Link>
          <div className="flex-1 min-w-0">
            <p className="text-zinc-400 text-xs truncate">Daraja {lesson.levelId} · {level?.title}</p>
            <p className="text-white font-semibold text-sm truncate">{lesson.title}</p>
          </div>
          {done && (
            <span className="text-emerald-400 text-xs font-medium shrink-0">✓ Bajarildi</span>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ── Video embed ── */}
        <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-video flex items-center justify-center">
          {isTodo ? (
            <div className="text-center p-8">
              <span className="text-4xl mb-4 block">🎬</span>
              <p className="text-white font-semibold text-base">{S.videoPlaceholder}</p>
              <p className="text-zinc-500 text-sm mt-2">{S.videoPlaceholderSub}</p>
              <p className="text-zinc-600 text-xs mt-3">
                {S.channel}: <span className="text-zinc-400">{lesson.channel}</span>
              </p>
            </div>
          ) : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}
        </div>

        {/* ── Channel attribution ── */}
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{S.channel}:</span>
          <a
            href={lesson.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
          >
            {lesson.channel}
          </a>
          <span className="text-zinc-700">·</span>
          <span>{lesson.durationNote}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-emerald-500">+{lesson.xp} XP</span>
        </div>

        {/* ── Summary ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-zinc-400 text-sm leading-relaxed">{lesson.summary}</p>
        </div>

        {/* ── Key takeaways ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-4">{S.keyTakeaways}</p>
          <ul className="space-y-3">
            {lesson.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-zinc-300 leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Tool CTA (if applicable) ── */}
        {lesson.toolLink && lesson.toolCta && (
          <div className="bg-zinc-900 border border-zinc-700/60 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-2xl shrink-0">🛠️</span>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-1">{S.practiceTitle}</p>
              <p className="text-zinc-200 text-sm font-medium">{lesson.toolCta}</p>
            </div>
            <Link
              to={lesson.toolLink}
              className="shrink-0 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold rounded-xl transition-colors"
            >
              Ochish →
            </Link>
          </div>
        )}

        {/* ── AI advisor button ── */}
        <button
          onClick={handleAskAI}
          className="w-full flex items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-700 text-white rounded-2xl px-5 py-4 transition-all text-left"
        >
          <span className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-sm shrink-0">🤖</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">{S.askAI}</p>
            <p className="text-zinc-500 text-xs">{lesson.title} haqida savol bering</p>
          </div>
          <span className="text-zinc-600 text-lg">→</span>
        </button>

        {/* ── Mark complete ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!done ? (
            <button
              onClick={handleComplete}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all active:scale-95 text-sm"
            >
              {S.markComplete.replace('{xp}', String(lesson.xp))}
            </button>
          ) : (
            <div className="flex-1 py-3.5 bg-zinc-800 text-emerald-400 font-semibold rounded-2xl text-sm text-center">
              {S.alreadyComplete}
            </div>
          )}

          {nextLesson && nextLesson.levelId === lesson.levelId && (
            <Link
              to={`/oqitish/dars/${nextLesson.id}`}
              className="flex-1 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-2xl transition-all text-sm text-center"
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
          <div className="text-center text-emerald-400 text-sm font-medium py-2">
            {S.quizPassed} — Daraja {lesson.levelId + 1} ochildi 🎉
          </div>
        )}
      </main>
    </div>
  );
}
