import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAuth, updateProfile, PLAN_NAMES,
  BIZ_TYPE_LABELS, REG_TYPE_LABELS, COLLATERAL_LABELS,
  type BizType, type RegType, type Collateral, type YearsInBiz,
} from '../lib/auth';

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', "Farg'ona",
  'Andijon', 'Namangan', 'Buxoro', 'Nukus', 'Qarshi', 'Jizzax',
  'Navoiy', 'Sirdaryo', 'Xorazm', 'Termiz', 'Urganch', "Qo'qon",
];

export default function Profile() {
  const navigate = useNavigate();
  const user     = useAuth();

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
    setTimeout(() => setSaved(false), 2500);
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

  const initial = (name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">

      {/* ── Nav bar ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/80">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
            <span className="text-lg leading-none">‹</span> Orqaga
          </button>
          <p className="text-white font-semibold text-sm">Profil</p>
          <button onClick={handleSave}
            className={`text-sm font-semibold transition-colors ${saved ? 'text-emerald-400' : 'text-emerald-500 hover:text-emerald-400'}`}>
            {saved ? '✓ Saqlandi' : 'Saqlash'}
          </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-6">

        {/* ── Hero profile card ── */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 text-2xl font-black shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-lg font-bold truncate">{name || 'Ismsiz'}</p>
            <p className="text-zinc-500 text-sm truncate">{user.email || user.phone}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[11px] font-medium">
              {PLAN_NAMES[user.plan]} tarif
            </span>
          </div>
        </div>

        {/* ── Completeness ── */}
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

        {/* ── Personal ── */}
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

        {/* ── Disability ── */}
        <Section title="Imtiyozlar" hint="Nogironlik bo'lsa — soliq va kredit imtiyozlari bor">
          <Group>
            <ChipRow icon="♿" iconBg="bg-purple-500/90" label="Nogironlik guruhi"
              options={[{ value: '', label: "Yo'q" }, { value: 'I', label: 'I' }, { value: 'II', label: 'II' }, { value: 'III', label: 'III' }]}
              value={disability} onChange={setDisability} />
          </Group>
        </Section>

        {/* ── Business ── */}
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

        {/* ── Scale ── */}
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

        {/* ── Bio ── */}
        <Section title="Qo'shimcha" hint="AI bilishi kerak bo'lgan boshqa narsalar">
          <Group>
            <div className="p-4">
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                placeholder="Masalan: do'konim Chorsu yaqinida, kiyim-kechak sotamiz. Kapitalbank'dan kredit olganman, muddat tugayapti. Yangi ombor ochmoqchiman..."
                className="w-full bg-transparent text-white text-sm placeholder-zinc-600 outline-none resize-none leading-relaxed" />
            </div>
          </Group>
        </Section>

        {/* ── Big save ── */}
        <button onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 ${saved ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
          {saved ? '✓ Saqlandi — AI endi profilingizni biladi' : 'Profilni saqlash'}
        </button>

        <p className="text-zinc-700 text-xs text-center">
          Ma'lumotlaringiz faqat AI maslahatini yaxshilash uchun ishlatiladi
        </p>
      </div>
    </div>
  );
}

// Inline type aliases (unions live in auth.ts)
type UserRevenue   = '<500mln' | '500mln-1mlrd' | '>1mlrd';
type UserEmployees = '0' | '1-5' | '5-20' | '20+';

const inputCls  = 'w-full bg-transparent text-white text-sm text-right placeholder-zinc-600 outline-none';
const selectCls = 'bg-transparent text-white text-sm text-right outline-none appearance-none cursor-pointer max-w-[180px] [&>option]:bg-zinc-900';

// ── iOS-style building blocks ─────────────────────────────────────────────────

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
