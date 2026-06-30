import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '📊',
    title: "Real bozor narxlari",
    desc: "OLX.uz dan jonli narxlar. Bug'doy uni, go'sht, sement — hamma narsa haqiqiy.",
  },
  {
    icon: '🏦',
    title: "7 mezonli kredit balli",
    desc: "Tajriba, garov, to'lov qobiliyati va bozor narxlariga moslik — 100 ballik tizim.",
  },
  {
    icon: '📄',
    title: "Bank tayyor hujjat",
    desc: "PDF reja, 3 ta bank tavsiyasi va \"bankga borishdan oldin\" tekshiruv ro'yxati.",
  },
];

const PROOF = [
  { value: '18',    label: 'biznes turi qamrab olingan',  unit: 'ta' },
  { value: '38',    label: "OLX narx kategoriyasi",       unit: 'ta' },
  { value: '100',   label: 'kredit tayyorgarlik balli',   unit: 'ball' },
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
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">
            Problem 14 + 15 · Savdo-sanoat palatasi
          </span>
          <button
            onClick={() => navigate('/?demo=1')}
            className="text-xs px-3 py-1.5 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            Demo →
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12 max-w-2xl mx-auto w-full">

        {/* ── OLX badge — lead with the differentiator ── */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950 border border-emerald-800/60 rounded-full text-emerald-400 text-xs mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          OLX.uz narxlari bilan ishlaydi &nbsp;·&nbsp; Bepul
        </div>

        {/* ── Headline ── */}
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.15] mb-4 text-center">
          Real narxlar asosida<br />
          <span className="text-emerald-400">kredit balli</span> va reja
        </h1>

        <p className="text-slate-400 text-base md:text-lg mb-3 max-w-lg leading-relaxed text-center">
          10 savolga javob bering — tizim OLX.uz'dan joriy bozor narxlarini oladi,
          daromadingizni tekshiradi va bankka tayyor hujjat tayyorlaydi.
        </p>

        {/* ── Problem statement ── */}
        <p className="text-slate-600 text-sm mb-10 text-center max-w-md">
          O'zbekistonda KOKlarning 90% kredit ololmaydi — asosan hujjat va tayyorgarlik yetishmasligi sababli.
        </p>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-sm">
          {PROOF.map(s => (
            <div key={s.value} className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 text-center">
              <div className="text-xl font-bold text-emerald-400">
                {s.value}
                <span className="text-sm font-normal text-slate-500 ml-0.5">{s.unit}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Primary CTA ── */}
        <button
          onClick={() => navigate('/interview')}
          className="group w-full max-w-sm py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 mb-4"
        >
          Boshlash — 10 daqiqa
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <p className="text-xs text-slate-600 mb-14 text-center">
          Ro'yxatdan o'tish shart emas &nbsp;·&nbsp; Internet bo'lmasa ham ishlaydi
        </p>

        {/* ── Feature cards ── */}
        <div className="w-full grid grid-cols-1 gap-3 mb-14">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-slate-900 rounded-xl p-4 border border-slate-800"
            >
              <span className="text-2xl mt-0.5 shrink-0">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── How it works ── */}
        <div className="w-full border-t border-slate-800 pt-10">
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-6 text-center">Qanday ishlaydi</p>
          <div className="space-y-4">
            {[
              { n: '1', text: "10 ta savolga o'zbek tilida javob bering", sub: "Biznes turi, daromad, kredit miqdori, garov..." },
              { n: '2', text: "Tizim OLX.uz'dan joriy narxlarni oladi", sub: "Bug'doy uni, non, go'sht, sement — real narxlar real vaqtda" },
              { n: '3', text: "AI kredit ballini hisoblaydi", sub: "Daromadingiz bozor narxlariga mosmi? 7 mezon." },
              { n: '4', text: "Bank tayyor PDF siz uchun", sub: "Biznes-reja + 3 bank tavsiyasi + hujjatlar ro'yxati" },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 mt-0.5">
                  {step.n}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{step.text}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer className="text-center text-slate-700 text-xs py-4 border-t border-slate-900 px-6">
        O'zbekiston Savdo-sanoat palatasi hamkori &nbsp;·&nbsp; Hackathon 2026 &nbsp;·&nbsp; Problem 14 + 15
      </footer>

    </div>
  );
}
