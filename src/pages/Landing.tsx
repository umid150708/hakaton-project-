import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    n: '1',
    emoji: '💬',
    title: 'Suhbat',
    desc: "10 ta savol, oddiy o'zbek tilida",
  },
  {
    n: '2',
    emoji: '🧠',
    title: 'AI tahlil',
    desc: "Sun'iy intellekt biznesingizni bank ko'zi bilan ko'radi",
  },
  {
    n: '3',
    emoji: '📄',
    title: 'Tayyor reja',
    desc: 'PDF reja, kredit balli va bank tavsiyasi',
  },
];

const STATS = [
  { value: '90%',  label: "KOKlar kredit ololmaydi" },
  { value: '$6B',  label: 'Kredit kamomadi' },
  { value: '2026', label: "Yangi AI scoring tizimi", accent: true },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-sm">
            B
          </div>
          <span className="font-semibold text-white">BiznesPlan AI</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:block">
          Savdo-sanoat palatasi hamkori
        </span>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-14 text-center max-w-2xl mx-auto w-full">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950 border border-emerald-800/60 rounded-full text-emerald-400 text-xs mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          O'zbek tilida &nbsp;·&nbsp; Bepul sinab ko'ring
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.15] mb-5">
          10 daqiqada<br />
          <span className="text-emerald-400">bankka tayyor</span> biznes-reja
        </h1>

        <p className="text-slate-400 text-base md:text-lg mb-10 max-w-lg leading-relaxed">
          Savollarga javob bering — AI professional biznes-reja,
          kredit balli va qaysi bankka borish kerakligini ko'rsatadi.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-sm">
          {STATS.map(s => (
            <div key={s.value} className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 text-center">
              <div className={`text-xl font-bold ${s.accent ? 'text-emerald-400' : 'text-white'}`}>
                {s.value}
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => navigate('/interview')}
          className="group w-full max-w-sm py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2"
        >
          Boshlash
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <div className="flex items-center gap-4 mt-4 text-xs text-slate-600">
          <span>Ro'yxatdan o'tish shart emas</span>
          <span>·</span>
          <button
            onClick={() => navigate('/?demo=1')}
            className="text-slate-500 hover:text-emerald-400 transition-colors"
          >
            Namunani ko'rish →
          </button>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-5 mt-14 w-full text-left">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{step.emoji}</span>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-slate-800 hidden sm:block" />
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {step.n}-qadam
              </p>
              <p className="text-sm font-semibold text-white">{step.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center text-slate-700 text-xs py-4 border-t border-slate-900 px-6">
        O'zbekiston Savdo-sanoat palatasi hamkori &nbsp;·&nbsp; World Bank FINGROW dasturi
      </footer>

    </div>
  );
}
