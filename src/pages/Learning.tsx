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
import ThemeToggle from '../components/ThemeToggle';

// Colour map keyed by accentColor string in content
const ACCENT: Record<string, { ring: string; bg: string; text: string; badge: string; icon: string }> = {
  emerald: { ring: 'ring-[var(--line)]', bg: 'bg-brand-soft', text: 'text-brand', badge: 'bg-brand-soft text-brand border-brand', icon: 'bg-brand-soft' },
  blue:    { ring: 'ring-sky/40',        bg: 'bg-sky/10',     text: 'text-sky',   badge: 'bg-sky/10 text-sky border-sky/40',       icon: 'bg-sky/10'    },
  violet:  { ring: 'ring-[var(--line)]',  bg: 'bg-gold-soft',  text: 'text-gold',  badge: 'bg-gold-soft text-gold border-line-strong', icon: 'bg-gold-soft'  },
  amber:   { ring: 'ring-[var(--line)]',   bg: 'bg-gold-soft',   text: 'text-gold',   badge: 'bg-gold-soft text-gold border-line-strong',   icon: 'bg-gold-soft'   },
  rose:    { ring: 'ring-rose-500/40',    bg: 'bg-rose-950/40',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',       icon: 'bg-rose-500/20'    },
  sky:     { ring: 'ring-sky/40',     bg: 'bg-sky/10',     text: 'text-sky',     badge: 'bg-sky/10 text-sky border-sky/40',         icon: 'bg-sky/10'     },
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
    <div className="min-h-screen bg-page text-ink flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')} className="btn-icon text-faint hover:text-ink text-xl leading-none">←</button>
          <div className="flex-1">
            <p className="text-ink font-bold text-sm">{S.pageTitle}</p>
            <p className="text-faint text-xs">{S.pageSubtitle}</p>
          </div>
          <ThemeToggle />
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
              className={`bg-surface border border-line rounded-2xl p-4 ${d.link ? 'card-tap cursor-pointer hover:border-line-strong transition-colors' : ''}`}
            >
              <p className="text-lg mb-1">{d.icon}</p>
              <p className="text-ink font-bold text-base leading-tight">{d.value}</p>
              <p className="text-faint text-xs mt-0.5">{d.label}</p>
            </div>
          ))}
        </div>

        {/* ── Overall progress bar ── */}
        <div className="bg-surface border border-line rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-ink font-semibold text-sm">Umumiy taraqqiyot</p>
            <p className="text-brand font-bold text-sm">{overall}%</p>
          </div>
          <div className="h-2 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
          <p className="text-faint text-xs mt-2">
            {p.completedLessons.length} / {track.levels.reduce((s, l) => s + l.lessons.length, 0)} dars bajarildi
          </p>
        </div>

        {/* ── Level roadmap ── */}
        <div className="space-y-4">
          <p className="text-xs text-faint uppercase tracking-widest font-medium">O'quv yo'li — 6 ta daraja</p>

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
                  <div className="absolute left-6 top-full h-4 w-0.5 bg-elevated z-10" />
                )}

                <div className={`bg-surface border rounded-2xl overflow-hidden transition-all ${
                  unlocked ? `border-line hover:border-line-strong ring-1 ${ac.ring}` : 'border-line/50 opacity-60'
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
                          <span className="text-faint text-xs font-mono">Daraja {level.id}</span>
                          {badge && (
                            <span className={`text-[11px] border rounded-full px-2 py-0.5 font-medium ${ac.badge}`}>
                              🏅 Nishon qo'lga kiritildi
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-[11px] text-faint border border-line-strong rounded-full px-2 py-0.5">
                              {S.locked}
                            </span>
                          )}
                        </div>
                        <h2 className="text-ink font-bold text-base leading-tight">{level.title}</h2>
                        <p className="text-muted text-xs mt-0.5">{level.subtitle}</p>

                        <div className="flex items-center gap-4 mt-3 text-xs text-faint">
                          <span>{level.lessons.length} {S.lessons}</span>
                          <span>⚡ {level.lessons.reduce((s, l) => s + l.xp, 0) + (quizPassed ? 100 : 0)} XP</span>
                          {bestScore !== null && (
                            <span className={quizPassed ? 'text-brand' : 'text-gold'}>
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
                            className={`btn-soft text-xs font-semibold px-3 py-1.5 rounded-xl ${ac.text} bg-elevated hover:bg-elevated transition-colors`}
                          >
                            {pct === 0 ? S.startLevel : pct === 100 ? S.reviewLevel : S.continueLevel}
                          </Link>
                          {allLessonsDone && !quizPassed && (
                            <Link
                              to={`/oqitish/test/${level.id}`}
                              className="btn-cta text-xs font-semibold px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink transition-colors"
                            >
                              {S.quizAvailable}
                            </Link>
                          )}
                          {quizPassed && (
                            <Link
                              to={`/oqitish/test/${level.id}`}
                              className="btn-soft text-xs font-medium px-3 py-1.5 rounded-xl text-brand bg-brand-soft transition-colors"
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
                    <div className="border-t border-line divide-y divide-[var(--line)]">
                      {level.lessons.map(ls => {
                        const done = progress.completedLessons.includes(ls.id);
                        return (
                          <Link
                            key={ls.id}
                            to={`/oqitish/dars/${ls.id}`}
                            className="card-tap flex items-center gap-3 px-5 py-3 hover:bg-elevated transition-colors"
                          >
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                              done
                                ? 'bg-brand border-brand text-brand-ink'
                                : 'border-line-strong text-faint'
                            }`}>
                              {done ? '✓' : ''}
                            </span>
                            <span className={`text-sm flex-1 leading-tight ${done ? 'text-muted line-through' : 'text-ink'}`}>
                              {ls.title}
                            </span>
                            <span className="text-faint text-xs shrink-0">{ls.durationNote}</span>
                            <span className={`text-xs shrink-0 ${done ? 'text-brand' : 'text-faint'}`}>+{ls.xp} XP</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Locked placeholder */}
                  {!unlocked && (
                    <div className="border-t border-line px-5 py-3">
                      <p className="text-faint text-xs">
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
