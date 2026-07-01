import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAuth, updateProfile, PLAN_NAMES,
  BIZ_TYPE_LABELS, REG_TYPE_LABELS, COLLATERAL_LABELS,
  type BizType, type RegType, type Collateral, type YearsInBiz,
} from '../lib/auth';
import { loadUserAds, CATEGORIES, type Ad } from '../lib/bozorData';

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', "Farg'ona",
  'Andijon', 'Namangan', 'Buxoro', 'Nukus', 'Qarshi', 'Jizzax',
  'Navoiy', 'Sirdaryo', 'Xorazm', 'Termiz', 'Urganch', "Qo'qon",
];

export default function Profile() {
  const navigate = useNavigate();
  const user     = useAuth();

  // View (Instagram-style) is the default; editing is behind the "Tahrirlash" button.
  const [mode, setMode] = useState<'view' | 'edit'>(
    () => (typeof window !== 'undefined' && window.location.hash === '#edit') ? 'edit' : 'view'
  );

  const [name,         setName]         = useState('');
  const [location,     setLocation]     = useState('');
  const [disability,   setDisability]   = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bizType,      setBizType]      = useState<BizType | ''>('');
  const [regType,      setRegType]      = useState<RegType | ''>('');
  const [yearsInBiz,   setYearsInBiz]   = useState<YearsInBiz | ''>('');
  const [employees,    setEmployees]    = useState('');
  const [revenueBand,  setRevenueBand]  = useState('');
  const [collateral,   setCollateral]   = useState<Collateral | ''>('');
  const [bio,          setBio]          = useState('');
  const [saved,        setSaved]        = useState(false);

  // The user's own marketplace listings — the "posts" of this profile.
  const [userAds] = useState<Ad[]>(loadUserAds);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setLocation(user.location ?? '');
    setDisability(user.disability ?? '');
    setBusinessName(user.businessName ?? '');
    setBizType(user.bizType ?? '');
    setRegType(user.regType ?? '');
    setYearsInBiz(user.yearsInBiz ?? '');
    setEmployees(user.employees ?? '');
    setRevenueBand(user.revenueBand ?? '');
    setCollateral(user.collateral ?? '');
    setBio(user.bio ?? '');
  }, [user?.id]);

  const filled = [name, location, disability, businessName, bizType, regType, yearsInBiz, employees, revenueBand, collateral].filter(Boolean).length;
  const pct    = Math.round((filled / 10) * 100);

  const handleSave = () => {
    updateProfile({
      name,
      location:     location || undefined,
      disability:   (disability as 'I' | 'II' | 'III') || undefined,
      bizType:      (bizType as BizType) || undefined,
      revenueBand:  (revenueBand as UserRevenue) || undefined,
      employees:    (employees as UserEmployees) || undefined,
      businessName: businessName || undefined,
      regType:      (regType as RegType) || undefined,
      yearsInBiz:   (yearsInBiz as YearsInBiz) || undefined,
      collateral:   (collateral as Collateral) || undefined,
      bio:          bio || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setMode('view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-400 text-sm">Profilni ko'rish uchun hisobingizga kiring.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-emerald-400 text-sm hover:text-emerald-300">← Bosh sahifa</button>
        </div>
      </div>
    );
  }

  const initial = (businessName || name || user.email || 'U').charAt(0).toUpperCase();
  const handle  = user.email?.split('@')[0] || name?.trim().split(' ')[0]?.toLowerCase() || 'foydalanuvchi';

  // One-line summary under the name: activity · reg · region.
  const metaBits = [
    bizType && BIZ_TYPE_LABELS[bizType as BizType],
    regType && (regType as string).toUpperCase(),
    location,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* ── Nav bar ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/80">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => (mode === 'edit' ? setMode('view') : navigate(-1))}
            className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
            <span className="text-lg leading-none">‹</span> {mode === 'edit' ? 'Bekor qilish' : 'Orqaga'}
          </button>
          <p className="text-white font-semibold text-sm">{mode === 'edit' ? 'Profilni tahrirlash' : 'Profil'}</p>
          {mode === 'edit'
            ? <button onClick={handleSave}
                className={`text-sm font-semibold transition-colors ${saved ? 'text-emerald-400' : 'text-emerald-500 hover:text-emerald-400'}`}>
                {saved ? '✓ Saqlandi' : 'Saqlash'}
              </button>
            : <button onClick={() => setMode('edit')} className="text-zinc-400 hover:text-white text-sm">Tahrirlash</button>}
        </div>
      </header>

      {mode === 'view' ? (
        // ═══════════════════════ INSTAGRAM-STYLE VIEW ═══════════════════════
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Header: avatar + identity ── */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-12 pb-8 border-b border-zinc-800">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 text-4xl sm:text-6xl font-black shrink-0 shadow-lg shadow-emerald-900/30">
              {initial}
            </div>

            <div className="flex-1 min-w-0 w-full">
              {/* Handle + actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-white text-xl font-normal truncate">{handle}</h1>
                  {user.plan !== 'free' && (
                    <span title="Tasdiqlangan tarif" className="text-emerald-400 text-sm">✔︎</span>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <button onClick={() => setMode('edit')}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
                    Profilni tahrirlash
                  </button>
                  <button onClick={() => navigate('/bozor')}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
                    + E'lon
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-around sm:justify-start sm:gap-10 mb-5">
                <Stat n={userAds.length}          label="e'lon" />
                <Stat n={user.dealContactsUsed}   label="bitim" />
                <Stat n={`${pct}%`}               label="profil" highlight={pct >= 80} />
              </div>

              {/* Name + business + bio */}
              <div className="text-center sm:text-left space-y-0.5">
                <p className="text-white text-sm font-semibold">{name || 'Ismsiz'}</p>
                {businessName && <p className="text-zinc-200 text-sm">🏢 {businessName}</p>}
                {metaBits.length > 0 && <p className="text-zinc-500 text-sm">{metaBits.join(' · ')}</p>}
                {bio && <p className="text-zinc-400 text-sm whitespace-pre-line pt-1.5 leading-relaxed">{bio}</p>}
                <p className="text-zinc-600 text-xs pt-1.5">
                  {PLAN_NAMES[user.plan]} tarif · {user.email || user.phone}
                </p>
              </div>
            </div>
          </div>

          {/* ── Completeness nudge ── */}
          {pct < 100 && (
            <button onClick={() => setMode('edit')}
              className="mt-6 w-full text-left bg-zinc-900 border border-zinc-800 hover:border-emerald-700 rounded-2xl px-5 py-4 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-200 text-sm font-medium">
                  Profilingizni to'ldiring — AI aniqroq maslahat beradi
                </p>
                <span className="text-emerald-400 text-sm font-bold shrink-0 ml-3">{pct}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </button>
          )}

          {/* ── Business info "highlights" ── */}
          {infoCards().length > 0 && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {infoCards().map(c => (
                <div key={c.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 flex flex-col gap-1">
                  <span className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center text-sm`}>{c.icon}</span>
                  <p className="text-zinc-500 text-[11px] mt-1">{c.label}</p>
                  <p className="text-white text-sm font-semibold leading-tight">{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab bar ── */}
          <div className="mt-8 border-t border-zinc-800 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-3 border-t-2 border-white -mt-px text-white text-xs font-semibold tracking-widest uppercase">
              <span>▦</span> E'lonlarim
            </div>
          </div>

          {/* ── Listings grid (the "posts") ── */}
          {userAds.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-700 flex items-center justify-center mx-auto mb-4 text-2xl">📦</div>
              <p className="text-white font-semibold">Hali e'lon yo'q</p>
              <p className="text-zinc-500 text-sm mt-1">Birinchi e'loningizni joylang — bozorda ko'rinasiz</p>
              <button onClick={() => navigate('/bozor')}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                Bozorga o'tish →
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {userAds.map(ad => (
                <button key={ad.id} onClick={() => navigate('/bozor')}
                  className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-3.5 flex flex-col justify-between text-left transition-colors overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{CATEGORIES.find(c => c.id === ad.category)?.icon ?? '📦'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      ad.type === 'buy' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {ad.type === 'buy' ? 'Olaman' : 'Sotaman'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{ad.product}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{ad.quantity}</p>
                    {ad.price && <p className="text-emerald-400 text-xs font-semibold mt-0.5 truncate">{ad.price}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

      ) : (
        // ═══════════════════════ EDIT FORM ═══════════════════════
        <div className="max-w-xl mx-auto px-4 py-5 space-y-6">

          {/* Completeness */}
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-zinc-300 text-sm font-medium">Profil to'ldirilgani</p>
              <p className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 40 ? 'text-yellow-400' : 'text-zinc-500'}`}>{pct}%</p>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-zinc-600'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className="text-zinc-600 text-xs mt-2">To'liq profil = aniqroq AI maslahat</p>
          </div>

          {/* Personal */}
          <Section title="Shaxsiy ma'lumot">
            <Group>
              <InputRow icon="👤" iconBg="bg-red-500/90" label="Ism familiya">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Aziz Karimov" className={inputCls} />
              </InputRow>
              <Divider />
              <SelectRow icon="📍" iconBg="bg-blue-500/90" label="Joylashuv">
                <select value={location} onChange={e => setLocation(e.target.value)} className={selectCls}>
                  <option value="">Tanlang</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </SelectRow>
            </Group>
          </Section>

          {/* Disability */}
          <Section title="Imtiyozlar" hint="Nogironlik bo'lsa — soliq va kredit imtiyozlari bor">
            <Group>
              <ChipRow icon="♿" iconBg="bg-purple-500/90" label="Nogironlik guruhi"
                options={[{ value: '', label: "Yo'q" }, { value: 'I', label: 'I' }, { value: 'II', label: 'II' }, { value: 'III', label: 'III' }]}
                value={disability} onChange={setDisability} />
            </Group>
          </Section>

          {/* Business */}
          <Section title="Biznesingiz">
            <Group>
              <InputRow icon="🏢" iconBg="bg-orange-500/90" label="Biznes nomi">
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Karimov Savdo" className={inputCls} />
              </InputRow>
              <Divider />
              <SelectRow icon="🏷️" iconBg="bg-emerald-500/90" label="Faoliyat turi">
                <select value={bizType} onChange={e => setBizType(e.target.value as BizType)} className={selectCls}>
                  <option value="">Tanlang</option>
                  {Object.entries(BIZ_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </SelectRow>
              <Divider />
              <SelectRow icon="📋" iconBg="bg-sky-500/90" label="Ro'yxat shakli">
                <select value={regType} onChange={e => setRegType(e.target.value as RegType)} className={selectCls}>
                  <option value="">Tanlang</option>
                  {Object.entries(REG_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </SelectRow>
            </Group>
          </Section>

          {/* Scale */}
          <Section title="Biznes ko'lami">
            <Group>
              <ChipRow icon="📅" iconBg="bg-pink-500/90" label="Biznes yoshi"
                options={[{ value: '<1', label: '<1' }, { value: '1-3', label: '1–3' }, { value: '3-5', label: '3–5' }, { value: '5+', label: '5+' }]}
                value={yearsInBiz} onChange={v => setYearsInBiz(v as YearsInBiz)} />
              <Divider />
              <ChipRow icon="👥" iconBg="bg-teal-500/90" label="Xodimlar"
                options={[{ value: '0', label: "O'zim" }, { value: '1-5', label: '1–5' }, { value: '5-20', label: '5–20' }, { value: '20+', label: '20+' }]}
                value={employees} onChange={setEmployees} />
              <Divider />
              <ChipRow icon="💰" iconBg="bg-amber-500/90" label="Yillik daromad"
                options={[{ value: '<500mln', label: '<500mln' }, { value: '500mln-1mlrd', label: '0.5–1mlrd' }, { value: '>1mlrd', label: '1mlrd+' }]}
                value={revenueBand} onChange={setRevenueBand} />
              <Divider />
              <SelectRow icon="🏦" iconBg="bg-indigo-500/90" label="Kredit garovi">
                <select value={collateral} onChange={e => setCollateral(e.target.value as Collateral)} className={selectCls}>
                  <option value="">Tanlang</option>
                  {Object.entries(COLLATERAL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </SelectRow>
            </Group>
          </Section>

          {/* Bio */}
          <Section title="Qo'shimcha" hint="AI bilishi kerak bo'lgan boshqa narsalar">
            <Group>
              <div className="p-4">
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                  placeholder="Masalan: do'konim Chorsu yaqinida, kiyim-kechak sotamiz. Kapitalbank'dan kredit olganman, muddat tugayapti. Yangi ombor ochmoqchiman..."
                  className="w-full bg-transparent text-white text-sm placeholder-zinc-600 outline-none resize-none leading-relaxed" />
              </div>
            </Group>
          </Section>

          {/* Big save */}
          <button onClick={handleSave}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 ${saved ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
            {saved ? '✓ Saqlandi — AI endi profilingizni biladi' : 'Profilni saqlash'}
          </button>

          <p className="text-zinc-700 text-xs text-center">
            Ma'lumotlaringiz faqat AI maslahatini yaxshilash uchun ishlatiladi
          </p>
        </div>
      )}
    </div>
  );

  // ── Build the business-info highlight cards from filled fields ──
  function infoCards(): { icon: string; bg: string; label: string; value: string }[] {
    const cards: { icon: string; bg: string; label: string; value: string }[] = [];
    if (bizType)     cards.push({ icon: '🏷️', bg: 'bg-emerald-500/90', label: 'Faoliyat',  value: BIZ_TYPE_LABELS[bizType as BizType] });
    if (regType)     cards.push({ icon: '📋', bg: 'bg-sky-500/90',     label: 'Shakl',     value: REG_TYPE_LABELS[regType as RegType] });
    if (yearsInBiz)  cards.push({ icon: '📅', bg: 'bg-pink-500/90',    label: 'Tajriba',   value: `${yearsInBiz} yil` });
    if (employees)   cards.push({ icon: '👥', bg: 'bg-teal-500/90',    label: 'Xodimlar',  value: employees === '0' ? "O'zim" : `${employees} kishi` });
    if (revenueBand) cards.push({ icon: '💰', bg: 'bg-amber-500/90',   label: 'Daromad',   value: revenueBand });
    if (collateral && collateral !== 'none') cards.push({ icon: '🏦', bg: 'bg-indigo-500/90', label: 'Garov', value: COLLATERAL_LABELS[collateral as Collateral] });
    if (disability)  cards.push({ icon: '♿', bg: 'bg-purple-500/90',  label: 'Nogironlik', value: `${disability} guruh` });
    return cards;
  }
}

// Inline type aliases (unions live in auth.ts)
type UserRevenue   = '<500mln' | '500mln-1mlrd' | '>1mlrd';
type UserEmployees = '0' | '1-5' | '5-20' | '20+';

const inputCls  = 'w-full bg-transparent text-white text-sm text-right placeholder-zinc-600 outline-none';
const selectCls = 'bg-transparent text-white text-sm text-right outline-none appearance-none cursor-pointer max-w-[180px] [&>option]:bg-zinc-900';

// ── Instagram stat cell ────────────────────────────────────────────────────────

function Stat({ n, label, highlight }: { n: number | string; label: string; highlight?: boolean }) {
  return (
    <div className="text-center sm:text-left">
      <span className={`text-base font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{n}</span>{' '}
      <span className="text-zinc-500 text-sm">{label}</span>
    </div>
  );
}

// ── iOS-style building blocks (edit form) ──────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide px-4 mb-2">{title}</p>
      {children}
      {hint && <p className="text-zinc-600 text-xs px-4 mt-2">{hint}</p>}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">{children}</div>;
}

function Divider() {
  return <div className="h-px bg-zinc-800 ml-[52px]" />;
}

function RowShell({ icon, iconBg, label, children }: { icon: string; iconBg: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
      <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center text-sm shrink-0`}>{icon}</span>
      <span className="text-white text-sm font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end min-w-0">{children}</div>
    </div>
  );
}

function InputRow(props: { icon: string; iconBg: string; label: string; children: React.ReactNode }) {
  return <RowShell {...props} />;
}

function SelectRow({ icon, iconBg, label, children }: { icon: string; iconBg: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
      <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center text-sm shrink-0`}>{icon}</span>
      <span className="text-white text-sm font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end items-center gap-1 min-w-0">
        {children}
        <span className="text-zinc-600 text-xs shrink-0">▾</span>
      </div>
    </div>
  );
}

function ChipRow({ icon, iconBg, label, options, value, onChange }: {
  icon: string; iconBg: string; label: string;
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 min-h-[52px]">
      <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center text-sm shrink-0`}>{icon}</span>
      <span className="text-white text-sm font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end gap-1.5 flex-wrap">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              value === o.value ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
