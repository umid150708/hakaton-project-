import { useNavigate, Link } from 'react-router-dom';
import AuthButton from '../components/AuthButton';
import ThemeToggle from '../components/ThemeToggle';
import { Brand, Logo } from '../components/Logo';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">

      {/* ── Fixed nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-line bg-page/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Brand size={34} animated />

          {/* Links */}
          <div className="hidden lg:flex items-center gap-7">
            <Link to="/bozor"     className="link-quiet text-muted hover:text-ink text-sm font-medium">B2B Bozor</Link>
            <Link to="/interview" className="link-quiet text-muted hover:text-ink text-sm font-medium">AI Maslahat</Link>
            <Link to="/pricing"   className="link-quiet text-muted hover:text-ink text-sm font-medium">Narxlar</Link>
          </div>

          {/* Auth + theme */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 px-6 overflow-hidden">
        {/* Dot grid */}
        <div className="dot-grid absolute inset-0" />
        {/* Warm bozor glow — gold + emerald */}
        <div className="bozor-warm absolute inset-0" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="rise rise-1 inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-line rounded-full text-xs text-gold mb-10 font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            An'anaviy bozor · Raqamli platforma · O'zbekiston
          </div>

          {/* Headline */}
          <h1 className="rise rise-2 text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Butun O'zbekiston bozori —<br />
            <span className="gradient-text">bir platformada</span>
          </h1>

          <p className="rise rise-3 text-muted text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            Chorsu, Ipodrom va butun O'zbekiston bo'yicha xaridor va sotuvchini
            bevosita bog'laydi — vositachisiz, tezkor, <span className="text-gold font-semibold">Bozorboy</span> AI yordamida.
          </p>

          {/* CTAs */}
          <div className="rise rise-4 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/bozor" data-tap
              className="btn-cta px-8 py-4 bg-brand hover:bg-brand-hover text-brand-ink font-bold rounded-2xl text-base">
              Bozorga kirish →
            </Link>
            <button onClick={() => navigate('/interview')}
              className="btn-soft px-8 py-4 bg-surface hover:bg-elevated text-ink font-bold rounded-2xl border border-line-strong text-base">
              AI Maslahat
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-line bg-surface/50">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-[var(--line)] px-6">
          {[
            { value: '40+',  label: "Faol e'lonlar" },
            { value: '8',    label: 'Kategoriya'    },
            { value: 'AI',   label: 'Bozor tahlili' },
          ].map(s => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-3xl md:text-4xl font-black text-ink tracking-tight">{s.value}</p>
              <p className="text-faint text-xs font-medium mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two product cards — asymmetric 3:2 ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {/* B2B Bozor — big (3/5) */}
          <Link to="/bozor" data-tap
            className="card-tap card-buy group lg:col-span-3 relative flex flex-col bg-surface hover:bg-elevated border border-line rounded-3xl p-8 overflow-hidden">
            {/* Subtle brand tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-soft)] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col flex-1">
              <div className="flex items-start justify-between mb-8">
                <span className="text-4xl">🏪</span>
                <span className="text-[11px] text-faint border border-line rounded-full px-3 py-1 font-medium">Muammo 14</span>
              </div>

              <h2 className="text-2xl font-black text-ink mb-3 leading-tight tracking-tight">B2B Bozor</h2>
              <p className="text-muted text-sm leading-relaxed mb-8 flex-1">
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
                  <div key={f.text} className="flex items-center gap-2 bg-elevated rounded-xl px-3 py-2.5">
                    <span className="text-base shrink-0">{f.icon}</span>
                    <span className="text-muted text-xs font-medium">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-brand font-semibold text-sm group-hover:gap-3 transition-all">
                Bozorga kirish <span className="text-base">→</span>
              </div>
            </div>
          </Link>

          {/* AI Maslahat — smaller (2/5) */}
          <div onClick={() => navigate('/interview')} data-tap role="button"
            className="card-tap card-sell group lg:col-span-2 relative flex flex-col bg-surface hover:bg-elevated border border-line rounded-3xl p-8 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-soft)] via-transparent to-transparent pointer-events-none" />
            <div className="relative flex flex-col flex-1">
              <div className="flex items-start justify-between mb-8">
                <span className="text-4xl">🤖</span>
                <span className="text-[11px] text-faint border border-line rounded-full px-3 py-1 font-medium">Muammo 15</span>
              </div>

              <h2 className="text-2xl font-black text-ink mb-3 tracking-tight">AI Maslahatchi</h2>
              <p className="text-muted text-sm leading-relaxed mb-8 flex-1">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    <span className="text-muted text-xs">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-gold font-semibold text-sm group-hover:gap-3 transition-all">
                Maslahat olish — bepul <span className="text-base">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-faint uppercase tracking-widest text-center mb-12 font-medium">Qanday ishlaydi</p>

          <div className="grid sm:grid-cols-2 gap-12">

            {/* B2B steps */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-full bg-brand-soft border border-line flex items-center justify-center text-xs font-bold text-brand">14</div>
                <h3 className="text-ink font-bold tracking-tight">B2B Bozor</h3>
              </div>
              <div className="space-y-8">
                {[
                  { n: '01', title: "Xarid yoki sotuv bo'limini oching", desc: "Xaridorlar 🛒 yoki Sotuvchilar 💰 — kerakli tomonni tanlang" },
                  { n: '02', title: "E'lon joylashtiring",               desc: "Mahsulot, miqdor, o'lchov birligi, joylashuv va narxni kiriting" },
                  { n: '03', title: "To'g'ridan-to'g'ri bog'laning",     desc: "Kontaktni ko'ring, vositachisiz muloqot qiling va bitimni yoping" },
                ].map(s => (
                  <div key={s.n} className="flex gap-5">
                    <span className="text-3xl font-black text-line-strong shrink-0 leading-none mt-0.5 select-none">{s.n}</span>
                    <div>
                      <p className="text-ink font-semibold text-sm mb-1.5 tracking-tight">{s.title}</p>
                      <p className="text-muted text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI steps */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-full bg-gold-soft border border-line flex items-center justify-center text-xs font-bold text-gold">15</div>
                <h3 className="text-ink font-bold tracking-tight">AI Maslahatchi</h3>
              </div>
              <div className="space-y-8">
                {[
                  { n: '01', title: "Savolingizni erkin yozing",     desc: "Kredit, soliq, imtiyoz yoki biznes — istalgan mavzuda" },
                  { n: '02', title: "AI tahlil qiladi",              desc: "O'zbek qonunlari, bank talablari va davlat dasturlarini biladi" },
                  { n: '03', title: "Aniq maslahat oling",           desc: "Hujjatlar, muddatlar, miqdorlar — batafsil va aniq" },
                ].map(s => (
                  <div key={s.n} className="flex gap-5">
                    <span className="text-3xl font-black text-line-strong shrink-0 leading-none mt-0.5 select-none">{s.n}</span>
                    <div>
                      <p className="text-ink font-semibold text-sm mb-1.5 tracking-tight">{s.title}</p>
                      <p className="text-muted text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI knowledge areas ── */}
      <section className="py-16 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-faint uppercase tracking-widest text-center mb-10 font-medium">AI maslahatchi nimalarni biladi</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: '🏦', title: 'Kredit olish',           body: "Bank talablari, hujjatlar ro'yxati, garovsiz mikrokreditlar (PQ-4862)" },
              { icon: '♿', title: 'Nogironlik imtiyozlari', body: "Soliq yengilliklari, pensiya, bepul xizmatlar — I/II/III guruh bo'yicha" },
              { icon: '🧾', title: 'Soliq rejimlari',       body: "Patent va SST farqi, QQS hisob-kitobi, ish haqi soliqlari" },
              { icon: '📋', title: 'Davlat dasturlari',     body: "INSON markazi, 1140 ishonch raqami, garovsiz kredit dasturlari" },
            ].map(m => (
              <div key={m.title} className="card-tap bg-surface rounded-2xl p-5 border border-line hover:border-line-strong">
                <span className="text-2xl mb-4 block">{m.icon}</span>
                <p className="text-ink text-sm font-bold mb-2 tracking-tight">{m.title}</p>
                <p className="text-muted text-xs leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data sources ── */}
      <section className="py-12 px-6 border-t border-line">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-faint uppercase tracking-widest mb-8 font-medium">Ma'lumot manbalari</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { name: 'UzEx',     href: 'https://uzex.uz',   color: 'text-brand' },
              { name: 'Stat.uz',  href: 'https://stat.uz',   color: 'text-sky'   },
              { name: 'Lex.uz',   href: 'https://lex.uz',    color: 'text-gold'  },
              { name: 'Soliq.uz', href: 'https://soliq.uz',  color: 'text-brand' },
            ].map(p => (
              <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
                className={`font-bold text-sm ${p.color} opacity-70 hover:opacity-100 transition-opacity`}>
                {p.name}
              </a>
            ))}
          </div>
          <p className="text-faint text-xs mt-6 max-w-2xl mx-auto leading-relaxed">
            Yuqoridagi <span className="text-muted">o'rtacha ulgurji narxlar</span> — indikativ qiymatlar bo'lib,{' '}
            <a href="https://uzex.uz" target="_blank" rel="noopener noreferrer" className="text-brand hover:opacity-80">UzEx</a> birja
            kotirovkalari va <a href="https://stat.uz" target="_blank" rel="noopener noreferrer" className="text-sky hover:opacity-80">stat.uz</a>{' '}
            narx monitoringi asosida shakllantiriladi. Rasmiy jonli ma'lumot emas — bitim narxi tomonlar kelishuviga bog'liq.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="ikat-border mt-auto" />
      <footer className="border-t border-line px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-muted text-sm font-medium">Bozorboy · 2026</span>
          </div>
          <Link to="/pricing" className="link-quiet text-muted hover:text-ink text-sm font-medium">
            Narxlar →
          </Link>
        </div>
      </footer>

    </div>
  );
}
