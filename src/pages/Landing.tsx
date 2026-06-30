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
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-400 border border-slate-700">
            Muammo 14 + 15
          </span>
          <button
            onClick={() => navigate('/?demo=1')}
            className="text-xs px-3 py-1.5 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-emerald-600 transition-colors"
          >
            Demo →
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-10 pb-16 max-w-2xl mx-auto w-full">

        {/* ── Hero ── */}
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">O'zbekiston KOK platformasi</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3 text-center">
          Tadbirkorlar uchun<br />
          <span className="text-emerald-400">ikkita muhim vosita</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10 text-center max-w-md leading-relaxed">
          Bozor narxlarini tahlil qiling va kredit olishga tayyor bo'ling —
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

          {/* Problem 15 — Kredit tayyorgarlik */}
          <div
            onClick={() => navigate('/interview')}
            className="group relative flex flex-col bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-700 rounded-2xl p-6 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-xs rounded-full border border-emerald-900 font-medium">
                Muammo 15
              </span>
              <span className="text-2xl">🏦</span>
            </div>
            <h2 className="text-white font-bold text-lg mb-2 leading-tight">
              Kredit Tayyorgarlik
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
              10 savolga javob bering — AI biznes-reja, kredit balli, soliq hisob-kitobi
              va bankka tayyor PDF chiqaradi.
            </p>
            <div className="space-y-1.5 mb-5">
              {[
                'AI biznes-reja (o\'zbek tilida)',
                'Kredit tayyorgarlik balli (0–100)',
                'Soliq rejimi tavsiyasi (patent/SST)',
                'Kredit kalkulyatori (18/22/26%)',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-500">✓</span>{f}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Boshlash — bepul →
              </span>
              <span className="text-xs text-slate-600">~5 daqiqa</span>
            </div>
          </div>
        </div>

        {/* ── Demo shortcut ── */}
        <button
          onClick={() => navigate('/?demo=1')}
          className="w-full py-3 border border-slate-800 hover:border-slate-600 text-slate-500 hover:text-slate-300 text-sm rounded-2xl transition-colors mb-10"
        >
          Kredit natijasi namunasini ko'rish →
        </button>

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
                Kredit Tayyorgarlik
              </p>
              <div className="space-y-3">
                {[
                  { n: '1', t: '10 savolga javob bering', s: "O'zbek tilida, oddiy chat suhbati" },
                  { n: '2', t: 'AI tahlil qiladi', s: 'Gemini AI bozor narxlari va moliyaviy ko\'rsatkichlarni tahlil qiladi' },
                  { n: '3', t: 'Natija va PDF', s: 'Ball, biznes-reja, soliq, kredit jadvali, bank tavsiyasi' },
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

        {/* ── Monetization ── */}
        <div className="w-full border-t border-slate-800 pt-8 mb-10">
          <p className="text-xs text-slate-600 uppercase tracking-wider text-center mb-6">Biznes modeli</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'B2C', title: 'Tadbirkorlar', body: "Bepul oddiy hisobot · Pullig'i: bank murojaat xati + PDF" },
              { label: 'B2B', title: 'Banklar va MFI', body: "Kredit arizalarini oldindan filtrlash API" },
              { label: 'Gov', title: "Savdo-sanoat palatasi", body: "KOK rivojlanish platformasi uchun tahlil" },
              { label: 'SaaS', title: "Bozor ma'muriyati", body: "Narx monitoring — Chorsu, Ipodrom va boshqalar" },
            ].map(m => (
              <div key={m.label} className="bg-slate-900 rounded-xl p-3.5 border border-slate-800">
                <div className="inline-block px-2 py-0.5 bg-emerald-950 text-emerald-400 text-xs rounded-full font-bold mb-2">{m.label}</div>
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
              { name: "O'zdon", role: 'Ulgurji don narxlari', color: 'text-amber-400' },
              { name: 'Chorsu', role: 'Mintaqaviy bozorlar', color: 'text-emerald-400' },
            ].map(p => (
              <div key={p.name} className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                <p className={`font-bold text-sm ${p.color}`}>{p.name}</p>
                <p className="text-slate-500 text-xs mt-1 leading-tight">{p.role}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="text-center text-slate-700 text-xs py-4 border-t border-slate-900 px-6">
        BiznesPlan AI · Xakaton 2026 · Muammo 14 + 15 · biznesplan-ai.vercel.app
      </footer>

    </div>
  );
}
