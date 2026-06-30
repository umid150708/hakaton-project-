import { useNavigate, Link } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Header ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-sm">B</div>
          <span className="font-semibold text-white">BiznesPlan AI</span>
        </div>
        <span className="hidden sm:block text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
          Muammo 14 + 15
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-10 pb-16 max-w-2xl mx-auto w-full">

        {/* ── Hero ── */}
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">O'zbekiston KOK platformasi</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3 text-center">
          Tadbirkorlar uchun<br />
          <span className="text-emerald-400">ikkita muhim vosita</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10 text-center max-w-md leading-relaxed">
          Bozor narxlarini tahlil qiling va kredit, imtiyozlar, soliq bo'yicha maslahat oling —
          ikkalasi bitta platformada, bepul.
        </p>

        {/* ── Two product cards ── */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">

          {/* Problem 14 — Bozor-Analitika */}
          <Link
            to="/bozor"
            className="group relative flex flex-col bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-700 rounded-2xl p-6 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-blue-950 text-blue-400 text-xs rounded-full border border-blue-900 font-medium">
                Muammo 14
              </span>
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-white font-bold text-lg mb-2 leading-tight">
              Bozor-Analitika
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
              Istalgan mahsulotning ulgurji narxini toping. Un, sement, go'sht, gazlama —
              qayerdan eng arzon sotib olish mumkinligini ko'ring.
            </p>
            <div className="space-y-1.5 mb-5">
              {[
                'Mahsulot qidirish va narx taqqoslash',
                'Eng arzon taklif va yetkazib beruvchi',
                'Narx o\'zgarish tendensiyasi',
                'Viloyat bo\'yicha filtrlash',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-500">✓</span>{f}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Narxlarni ko'rish →
              </span>
              <span className="text-xs text-slate-600">CBU · Ulgurji bozorlar</span>
            </div>
          </Link>

          {/* Problem 15 — AI Maslahatchi */}
          <div
            onClick={() => navigate('/interview')}
            className="group relative flex flex-col bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-700 rounded-2xl p-6 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-xs rounded-full border border-emerald-900 font-medium">
                Muammo 15
              </span>
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="text-white font-bold text-lg mb-2 leading-tight">
              AI Maslahatchi
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
              Kredit olish, soliq imtiyozlari, nogironlik yengilliklari va biznes
              masalalari bo'yicha AI maslahat oling.
            </p>
            <div className="space-y-1.5 mb-5">
              {[
                'Kredit olish jarayoni va hujjatlar',
                'Nogironlik imtiyozlari (I/II/III guruh)',
                'Soliq rejimi tavsiyasi (patent/SST)',
                'Davlat dasturlari va yordam',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-500">✓</span>{f}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Maslahat olish — bepul →
              </span>
              <span className="text-xs text-slate-600">Gemini AI</span>
            </div>
          </div>
        </div>

        {/* ── How it works (combined) ── */}
        <div className="w-full border-t border-slate-800 pt-8 mb-10">
          <p className="text-xs text-slate-600 uppercase tracking-wider text-center mb-6">Qanday ishlaydi</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Problem 14 steps */}
            <div>
              <p className="text-xs text-blue-400 font-medium mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 bg-blue-950 rounded-full flex items-center justify-center text-[10px]">14</span>
                Bozor-Analitika
              </p>
              <div className="space-y-3">
                {[
                  { n: '1', t: "Mahsulot kiriting", s: "'Un', 'sement', 'go'sht' — o'zbek yoki rus tilida" },
                  { n: '2', t: 'Narxlar yuklanadi', s: 'Ulgurji bozor ma\'lumotlari va CBU kurslari birlashtiriladi' },
                  { n: '3', t: "Eng arzonini tanlang", s: 'Yetkazib beruvchi, narx diapazoni va tendensiya' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-950 border border-blue-900 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <p className="text-white text-sm font-medium">{s.t}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{s.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem 15 steps */}
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-3 flex items-center gap-1.5">
                <span className="w-4 h-4 bg-emerald-950 rounded-full flex items-center justify-center text-[10px]">15</span>
                AI Maslahatchi
              </p>
              <div className="space-y-3">
                {[
                  { n: '1', t: 'Savolingizni yozing', s: "Kredit, soliq, imtiyoz — istalgan mavzu" },
                  { n: '2', t: 'AI tahlil qiladi', s: 'Gemini AI qonunlar va bank talablarini biladi' },
                  { n: '3', t: 'Aniq maslahat oling', s: 'Hujjatlar, muddatlar, miqdorlar — batafsil' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-900 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <p className="text-white text-sm font-medium">{s.t}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{s.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Key knowledge areas ── */}
        <div className="w-full border-t border-slate-800 pt-8 mb-10">
          <p className="text-xs text-slate-600 uppercase tracking-wider text-center mb-6">AI maslahatchi biladi</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏦', title: 'Kredit olish', body: "Bank talablari, hujjatlar, garovsiz mikrokreditlar (PQ-4862)" },
              { icon: '♿', title: 'Nogironlik imtiyozlari', body: "Soliq yengilliklari, pensiya, bepul xizmatlar (I/II/III guruh)" },
              { icon: '🧾', title: 'Soliq rejimlari', body: "Patent vs SST, QQS, ish haqi soliqlari" },
              { icon: '📋', title: 'Davlat dasturlari', body: "2026-yil AI scoring, Savdo-sanoat palatasi, INSON" },
            ].map(m => (
              <div key={m.title} className="bg-slate-900 rounded-xl p-3.5 border border-slate-800">
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="text-white text-sm font-medium mb-1">{m.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Partners ── */}
        <div className="w-full border-t border-slate-800 pt-8">
          <p className="text-xs text-slate-600 uppercase tracking-wider text-center mb-5">Ma'lumot manbalari</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { name: 'CBU.uz', role: 'Valyuta kurslari', color: 'text-blue-400' },
              { name: 'Lex.uz', role: 'Qonunlar bazasi', color: 'text-amber-400' },
              { name: 'Soliq.uz', role: 'Soliq ma\'lumotlari', color: 'text-emerald-400' },
            ].map(p => (
              <div key={p.name} className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                <p className={`font-bold text-sm ${p.color}`}>{p.name}</p>
                <p className="text-slate-500 text-xs mt-1 leading-tight">{p.role}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="text-center text-slate-700 text-xs py-4 border-t border-slate-900 px-6 flex items-center justify-center gap-4 flex-wrap">
        <span>BiznesPlan AI · Xakaton 2026 · Muammo 14 + 15</span>
        <Link to="/pricing" className="text-purple-600 hover:text-purple-400 transition-colors">Narxlar →</Link>
      </footer>

    </div>
  );
}
