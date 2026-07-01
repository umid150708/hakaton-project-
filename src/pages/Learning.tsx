import { Link, useNavigate } from 'react-router-dom';
import { track } from '../data/learningContent';
import {
  useProgress,
  isLevelUnlocked,
  getLevelProgress,
  hasBadge,
  getQuizBestScore,
  overallPercent,
  nextLesson,
  getProgress,
} from '../lib/learnProgress';
import { S } from '../lib/learnStrings';
import { PASS_THRESHOLD } from '../data/learningContent';

// Colour map keyed by accentColor string in content
const ACCENT: Record<string, { ring: string; bg: string; text: string; badge: string; icon: string }> = {
  emerald: { ring: 'ring-emerald-500/40', bg: 'bg-emerald-950/40', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: 'bg-emerald-500/20' },
  blue:    { ring: 'ring-blue-500/40',    bg: 'bg-blue-950/40',    text: 'text-blue-400',    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',       icon: 'bg-blue-500/20'    },
  violet:  { ring: 'ring-violet-500/40',  bg: 'bg-violet-950/40',  text: 'text-violet-400',  badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: 'bg-violet-500/20'  },
  amber:   { ring: 'ring-amber-500/40',   bg: 'bg-amber-950/40',   text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',   icon: 'bg-amber-500/20'   },
  rose:    { ring: 'ring-rose-500/40',    bg: 'bg-rose-950/40',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',       icon: 'bg-rose-500/20'    },
  sky:     { ring: 'ring-sky-500/40',     bg: 'bg-sky-950/40',     text: 'text-sky-400',     badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',         icon: 'bg-sky-500/20'     },
};

function ProgressRing({ pct, color, size = 48 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={5} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={5} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export default function Learning() {
  const navigate = useNavigate();
  const progress = useProgress(); // subscribe to reactive store
  const overall = overallPercent();
  const nextLessonId = nextLesson();
  const p = getProgress();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-zinc-500 hover:text-white text-xl leading-none">←</button>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{S.pageTitle}</p>
            <p className="text-zinc-500 text-xs">{S.pageSubtitle}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">

        {/* ── Progress dashboard ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: S.dashXp,       value: String(p.totalXp), icon: '⚡' },
            { label: S.dashBadges,   value: String(p.badges.length) + ' / ' + track.levels.length, icon: '🏅' },
            { label: S.dashComplete, value: overall + '%', icon: '📈' },
            {
              label: S.dashNext,
              value: nextLessonId
                ? (track.levels.flatMap(l => l.lessons).find(ls => ls.id === nextLessonId)?.title ?? '—').slice(0, 22) + '...'
                : 'Hammasi bajarildi!',
              icon: '▶',
              link: nextLessonId ? `/oqitish/dars/${nextLessonId}` : undefined,
            },
          ].map(d => (
            <div
              key={d.label}
              onClick={() => d.link && navigate(d.link)}
              className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 ${d.link ? 'cursor-pointer hover:border-zinc-700 transition-colors' : ''}`}
            >
              <p className="text-lg mb-1">{d.icon}</p>
              <p className="text-white font-bold text-base leading-tight">{d.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{d.label}</p>
            </div>
          ))}
        </div>

        {/* ── Overall progress bar ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white font-semibold text-sm">Umumiy taraqqiyot</p>
            <p className="text-emerald-400 font-bold text-sm">{overall}%</p>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
          <p className="text-zinc-500 text-xs mt-2">
            {p.completedLessons.length} / {track.levels.reduce((s, l) => s + l.lessons.length, 0)} dars bajarildi
          </p>
        </div>

        {/* ── Level roadmap ── */}
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium">O'quv yo'li — 6 ta daraja</p>

          {track.levels.map((level, idx) => {
            const unlocked = isLevelUnlocked(level.id);
            const pct = getLevelProgress(level.id);
            const badge = hasBadge(level.id);
            const bestScore = getQuizBestScore(level.id);
            const quizPassed = (bestScore ?? 0) >= PASS_THRESHOLD;
            const ac = ACCENT[level.accentColor] ?? ACCENT.emerald;
            const firstLesson = level.lessons[0];
            const allLessonsDone = pct === 100;

            return (
              <div key={level.id} className="relative">
                {/* Connector line between levels */}
                {idx < track.levels.length - 1 && (
                  <div className="absolute left-6 top-full h-4 w-0.5 bg-zinc-800 z-10" />
                )}

                <div className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
                  unlocked ? `border-zinc-800 hover:border-zinc-700 ring-1 ${ac.ring}` : 'border-zinc-800/50 opacity-60'
                }`}>

                  {/* Level header */}
                  <div className={`p-5 ${unlocked ? ac.bg : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* Icon + ring */}
                      <div className="relative shrink-0">
                        <ProgressRing
                          pct={unlocked ? pct : 0}
                          color={unlocked ? (pct === 100 ? '#34d399' : '#6ee7b7') : '#374151'}
                          size={52}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                          {unlocked ? level.icon : '🔒'}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-zinc-500 text-xs font-mono">Daraja {level.id}</span>
                          {badge && (
                            <span className={`text-[11px] border rounded-full px-2 py-0.5 font-medium ${ac.badge}`}>
                              🏅 Nishon qo'lga kiritildi
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-[11px] text-zinc-600 border border-zinc-700/50 rounded-full px-2 py-0.5">
                              {S.locked}
                            </span>
                          )}
                        </div>
                        <h2 className="text-white font-bold text-base leading-tight">{level.title}</h2>
                        <p className="text-zinc-400 text-xs mt-0.5">{level.subtitle}</p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                          <span>{level.lessons.length} {S.lessons}</span>
                          <span>⚡ {level.lessons.reduce((s, l) => s + l.xp, 0) + (quizPassed ? 100 : 0)} XP</span>
                          {bestScore !== null && (
                            <span className={quizPassed ? 'text-emerald-400' : 'text-amber-400'}>
                              Test: {bestScore}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      {unlocked && (
                        <div className="shrink-0 flex flex-col gap-2 items-end">
                          <Link
                            to={`/oqitish/dars/${firstLesson.id}`}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${ac.text} bg-zinc-800 hover:bg-zinc-700 transition-colors`}
                          >
                            {pct === 0 ? S.startLevel : pct === 100 ? S.reviewLevel : S.continueLevel}
                          </Link>
                          {allLessonsDone && !quizPassed && (
                            <Link
                              to={`/oqitish/test/${level.id}`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                            >
                              {S.quizAvailable}
                            </Link>
                          )}
                          {quizPassed && (
                            <Link
                              to={`/oqitish/test/${level.id}`}
                              className="text-xs font-medium px-3 py-1.5 rounded-xl text-emerald-400 bg-emerald-950/50 transition-colors"
                            >
                              {S.quizPassed}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lesson list (only when unlocked) */}
                  {unlocked && (
                    <div className="border-t border-zinc-800/60 divide-y divide-zinc-800/40">
                      {level.lessons.map(ls => {
                        const done = progress.completedLessons.includes(ls.id);
                        return (
                          <Link
                            key={ls.id}
                            to={`/oqitish/dars/${ls.id}`}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/40 transition-colors"
                          >
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                              done
                                ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                                : 'border-zinc-700 text-zinc-600'
                            }`}>
                              {done ? '✓' : ''}
                            </span>
                            <span className={`text-sm flex-1 leading-tight ${done ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                              {ls.title}
                            </span>
                            <span className="text-zinc-600 text-xs shrink-0">{ls.durationNote}</span>
                            <span className={`text-xs shrink-0 ${done ? 'text-emerald-400' : 'text-zinc-600'}`}>+{ls.xp} XP</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Locked placeholder */}
                  {!unlocked && (
                    <div className="border-t border-zinc-800/30 px-5 py-3">
                      <p className="text-zinc-600 text-xs">
                        🔒 Oldingi darajaning testini {PASS_THRESHOLD}% dan oshirib o'ting
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
