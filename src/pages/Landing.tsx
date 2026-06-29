import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-sm">B</div>
          <span className="font-semibold text-white">BiznesPlan AI</span>
        </div>
        <span className="text-xs text-slate-500">Savdo-sanoat palatasi hamkori</span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950 border border-emerald-800 rounded-full text-emerald-400 text-xs mb-8">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          O'zbek tilida • Bepul sinash mumkin
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
          10 daqiqada<br />
          <span className="text-emerald-400">bankka tayyor</span> biznes-reja
        </h1>

        <p className="text-slate-400 text-lg mb-10 max-w-xl">
          Savollarga o'zbek tilida javob bering — sun'iy intellekt professional
          biznes-reja va kredit tayyorgarlik hisobotini tayyorlaydi.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 w-full max-w-lg">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl font-bold text-white">90%</div>
            <div className="text-xs text-slate-500 mt-1">KOK kredit ololmaydi</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl font-bold text-white">$6B</div>
            <div className="text-xs text-slate-500 mt-1">Kredit kamomadi</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="text-2xl font-bold text-emerald-400">2026</div>
            <div className="text-xs text-slate-500 mt-1">Yangi AI scoring</div>
          </div>
        </div>

        <button
          onClick={() => navigate('/interview')}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-lg rounded-xl transition-colors w-full max-w-sm"
        >
          Boshlash →
        </button>

        <p className="text-slate-600 text-xs mt-4">Ro'yxatdan o'tish shart emas</p>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-6 mt-16 w-full max-w-lg text-left">
          {[
            { n: '1', title: 'Suhbat', desc: '10 ta savol, oddiy o\'zbek tilida' },
            { n: '2', title: 'Tahlil', desc: 'AI biznesingizni bank ko\'zi bilan ko\'radi' },
            { n: '3', title: 'Reja', desc: 'PDF, kredit balli, bank tavsiyasi' },
          ].map(step => (
            <div key={step.n} className="flex flex-col gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-emerald-400">{step.n}</div>
              <div className="text-sm font-semibold text-white">{step.title}</div>
              <div className="text-xs text-slate-500">{step.desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-slate-700 text-xs py-4 border-t border-slate-900">
        O'zbekiston Savdo-sanoat palatasi hamkori • World Bank FINGROW dasturi kontekstida ishlab chiqilgan
      </footer>
    </div>
  );
}
