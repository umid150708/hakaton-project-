import { useNavigate, Link } from 'react-router-dom';
import AuthButton from '../components/AuthButton';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* ── Fixed nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-zinc-950 text-sm">B</div>
            <span className="font-bold text-white tracking-tight">BiznesPlan AI</span>
          </div>

          {/* Links */}
          <div className="hidden lg:flex items-center gap-7">
            <Link to="/bozor"     className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">B2B Bozor</Link>
            <Link to="/interview" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">AI Maslahat</Link>
            <Link to="/pricing"   className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">Narxlar</Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2.5">
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 px-6 overflow-hidden">
        {/* Dot grid */}
        <div className="dot-grid absolute inset-0" />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(16,185,129,0.10),transparent)]" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-full text-xs text-zinc-400 mb-10 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Xakaton 2026 · Muammo 14 + 15 · O'zbekiston
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Ulgurji savdoni<br />
            <span className="gradient-text">yangi darajaga oling</span>
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Chorsu, Ipodrom va butun O'zbekiston bo'yicha xaridorlar va sotuvchilarni
            birlashtiruvchi B2B platforma — vositachisiz, tezkor, AI yordamida.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/bozor"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-950 text-base active:scale-95">
              Bozorga kirish →
            </Link>
            <button onClick={() => navigate('/interview')}
              className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl border border-zinc-700 hover:border-zinc-500 transition-all text-base">
              AI Maslahat
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-zinc-800/70 bg-zinc-900/40">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-zinc-800/70 px-6">
          {[
            { value: '40+',  label: "Faol e'lonlar" },
            { value: '8',    label: 'Kategoriya'    },
            { value: 'AI',   label: 'Bozor tahlili' },
          ].map(s => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-3xl md:text-4xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two product cards — asymmetric 3:2 ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* B2B Bozor — big (3/5) */}
          <Link to="/bozor"
            className="group lg:col-span-3 relative flex flex-col bg-zinc-900 hover:bg-zinc-800/70 border border-zinc-800 rounded-3xl p-8 transition-all overflow-hidden">
            {/* Subtle blue tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/25 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col flex-1">
              <div className="flex items-start justify-between mb-8">
                <span className="text-4xl">🏪</span>
                <span className="text-[11px] text-zinc-500 border border-zinc-700/60 rounded-full px-3 py-1 font-medium">Muammo 14</span>
              </div>

              <h2 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight">B2B Bozor</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                O'zbekistonning yirik ulgurji bozorlarini raqamli formatga olib kiramiz.
                E'lon joylashtiring, kontakt toping — vositachisiz va tezkor.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                  { icon: '🛒', text: "Xarid va sotuv e'lonlari" },
                  { icon: '🗂️', text: '8 ta kategoriya filtri'  },
                  { icon: '🤖', text: 'AI bozor tahlili'         },
                  { icon: '📞', text: 'Bevosita aloqa'           },
                ].map(f => (
                  <div key={f.text} className="flex items-center gap-2 bg-zinc-800/60 rounded-xl px-3 py-2.5">
                    <span className="text-base shrink-0">{f.icon}</span>
                    <span className="text-zinc-400 text-xs font-medium">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Bozorga kirish <span className="text-base">→</span>
              </div>
            </div>
          </Link>

          {/* AI Maslahat — smaller (2/5) */}
          <div onClick={() => navigate('/interview')}
            className="group lg:col-span-2 relative flex flex-col bg-zinc-900 hover:bg-zinc-800/70 border border-zinc-800 rounded-3xl p-8 transition-all cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/25 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col flex-1">
              <div className="flex items-start justify-between mb-8">
                <span className="text-4xl">🤖</span>
                <span className="text-[11px] text-zinc-500 border border-zinc-700/60 rounded-full px-3 py-1 font-medium">Muammo 15</span>
              </div>

              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">AI Maslahatchi</h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                Kredit, soliq imtiyozlari va nogironlik yengilliklari bo'yicha Gemini AI yordamida maslahat oling.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Kredit va bank hujjatlari',
                  'Nogironlik imtiyozlari (I/II/III)',
                  'Soliq rejimlari (patent/SST)',
                  'Davlat dasturlari va yordam',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-zinc-400 text-xs">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Maslahat olish — bepul <span className="text-base">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-zinc-600 uppercase tracking-widest text-center mb-12 font-medium">Qanday ishlaydi</p>

          <div className="grid sm:grid-cols-2 gap-12">

            {/* B2B steps */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800/60 flex items-center justify-center text-xs font-bold text-blue-400">14</div>
                <h3 className="text-white font-bold tracking-tight">B2B Bozor</h3>
              </div>
              <div className="space-y-8">
                {[
                  { n: '01', title: "Xarid yoki sotuv bo'limini oching", desc: "Xaridorlar 🛒 yoki Sotuvchilar 💰 — kerakli tomonni tanlang" },
                  { n: '02', title: "E'lon joylashtiring",               desc: "Mahsulot, miqdor, o'lchov birligi, joylashuv va narxni kiriting" },
                  { n: '03', title: "To'g'ridan-to'g'ri bog'laning",     desc: "Kontaktni ko'ring, vositachisiz muloqot qiling va bitimni yoping" },
                ].map(s => (
                  <div key={s.n} className="flex gap-5">
                    <span className="text-3xl font-black text-zinc-800 shrink-0 leading-none mt-0.5 select-none">{s.n}</span>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1.5 tracking-tight">{s.title}</p>
                      <p className="text-zinc-500 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI steps */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-xs font-bold text-emerald-400">15</div>
                <h3 className="text-white font-bold tracking-tight">AI Maslahatchi</h3>
              </div>
              <div className="space-y-8">
                {[
                  { n: '01', title: "Savolingizni erkin yozing",     desc: "Kredit, soliq, imtiyoz yoki biznes — istalgan mavzuda" },
                  { n: '02', title: "AI tahlil qiladi",              desc: "O'zbek qonunlari, bank talablari va davlat dasturlarini biladi" },
                  { n: '03', title: "Aniq maslahat oling",           desc: "Hujjatlar, muddatlar, miqdorlar — batafsil va aniq" },
                ].map(s => (
                  <div key={s.n} className="flex gap-5">
                    <span className="text-3xl font-black text-zinc-800 shrink-0 leading-none mt-0.5 select-none">{s.n}</span>
                    <div>
                      <p className="text-white font-semibold text-sm mb-1.5 tracking-tight">{s.title}</p>
                      <p className="text-zinc-500 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI knowledge areas ── */}
      <section className="py-16 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-zinc-600 uppercase tracking-widest text-center mb-10 font-medium">AI maslahatchi nimalarni biladi</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: '🏦', title: 'Kredit olish',           body: "Bank talablari, hujjatlar ro'yxati, garovsiz mikrokreditlar (PQ-4862)" },
              { icon: '♿', title: 'Nogironlik imtiyozlari', body: "Soliq yengilliklari, pensiya, bepul xizmatlar — I/II/III guruh bo'yicha" },
              { icon: '🧾', title: 'Soliq rejimlari',       body: "Patent va SST farqi, QQS hisob-kitobi, ish haqi soliqlari" },
              { icon: '📋', title: 'Davlat dasturlari',     body: "INSON markazi, 1140 ishonch raqami, garovsiz kredit dasturlari" },
            ].map(m => (
              <div key={m.title} className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                <span className="text-2xl mb-4 block">{m.icon}</span>
                <p className="text-white text-sm font-bold mb-2 tracking-tight">{m.title}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data sources ── */}
      <section className="py-12 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-zinc-700 uppercase tracking-widest mb-8 font-medium">Ma'lumot manbalari</p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {[
              { name: 'Lex.uz',    color: 'text-amber-500'  },
              { name: 'Soliq.uz',  color: 'text-emerald-500'},
              { name: 'Stat.uz',   color: 'text-blue-500'   },
            ].map(p => (
              <span key={p.name} className={`font-bold text-sm ${p.color} opacity-50 hover:opacity-100 transition-opacity cursor-default`}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/50 px-6 py-6 mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-zinc-950 text-xs">B</div>
            <span className="text-zinc-600 text-sm font-medium">BiznesPlan AI · 2026</span>
          </div>
          <Link to="/pricing" className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors font-medium">
            Narxlar →
          </Link>
        </div>
      </footer>

    </div>
  );
}
