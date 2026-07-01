import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, updateProfile, BIZ_TYPE_LABELS, REG_TYPE_LABELS, COLLATERAL_LABELS, type BizType, type RegType, type Collateral, type YearsInBiz } from '../lib/auth';

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', "Farg'ona",
  'Andijon', 'Namangan', 'Buxoro', 'Nukus', 'Qarshi', 'Jizzax',
  'Navoiy', 'Sirdaryo', 'Xorazm', 'Termiz', 'Urganch', "Qo'qon",
];

export default function Profile() {
  const navigate  = useNavigate();
  const user      = useAuth();

  const [name,         setName]         = useState('');
  const [location,     setLocation]     = useState('');
  const [disability,   setDisability]   = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bizType,      setBizType]      = useState<BizType>('savdo');
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
    setBizType(user.bizType ?? 'savdo');
    setRegType(user.regType ?? '');
    setYearsInBiz(user.yearsInBiz ?? '');
    setEmployees(user.employees ?? '');
    setRevenueBand(user.revenueBand ?? '');
    setCollateral(user.collateral ?? '');
    setBio(user.bio ?? '');
  }, [user?.id]);

  // Count how many key fields are filled
  const filled = [name, location, disability, businessName, bizType, regType, yearsInBiz, employees, revenueBand, collateral].filter(Boolean).length;
  const pct    = Math.round((filled / 10) * 100);

  const handleSave = () => {
    updateProfile({
      name,
      location:     location || undefined,
      disability:   (disability as UserProfile_disability) || undefined,
      bizType,
      revenueBand:  (revenueBand as any) || undefined,
      employees:    (employees as any) || undefined,
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white text-xl leading-none">←</button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Mening profilim</p>
            <p className="text-zinc-500 text-xs truncate">AI to'liq profil asosida aniq maslahat beradi</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 40 ? 'text-yellow-400' : 'text-zinc-500'}`}>{pct}%</p>
            <p className="text-zinc-600 text-[10px]">to'ldirilgan</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-zinc-600'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Section 1: Personal */}
        <Card title="👤 Siz haqingizda">
          <Field label="Ism familiya">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Aziz Karimov"
              className={input} />
          </Field>

          <Field label="Joylashuv">
            <select value={location} onChange={e => setLocation(e.target.value)} className={input}>
              <option value="">Tanlang...</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Nogironlik (imtiyozlar uchun)">
            <ChipGroup
              options={[{ value: '', label: "Yo'q" }, { value: 'I', label: 'I guruh' }, { value: 'II', label: 'II guruh' }, { value: 'III', label: 'III guruh' }]}
              value={disability}
              onChange={setDisability}
              cols={4}
            />
          </Field>
        </Card>

        {/* Section 2: Business */}
        <Card title="🏢 Biznesingiz">
          <Field label="Biznes nomi">
            <input value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="Karimov Savdo MChJ"
              className={input} />
          </Field>

          <Field label="Faoliyat turi">
            <ChipGroup
              options={Object.entries(BIZ_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              value={bizType}
              onChange={v => setBizType(v as BizType)}
              cols={2}
            />
          </Field>

          <Field label="Ro'yxatdan o'tish shakli">
            <ChipGroup
              options={Object.entries(REG_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              value={regType}
              onChange={v => setRegType(v as RegType)}
              cols={1}
            />
          </Field>

          <Field label="Biznes yoshi">
            <ChipGroup
              options={[{ value: '<1', label: '< 1 yil' }, { value: '1-3', label: '1–3 yil' }, { value: '3-5', label: '3–5 yil' }, { value: '5+', label: '5+ yil' }]}
              value={yearsInBiz}
              onChange={v => setYearsInBiz(v as YearsInBiz)}
              cols={4}
            />
          </Field>

          <Field label="Xodimlar soni">
            <ChipGroup
              options={[{ value: '0', label: "Faqat o'zim" }, { value: '1-5', label: '1–5' }, { value: '5-20', label: '5–20' }, { value: '20+', label: '20+' }]}
              value={employees}
              onChange={setEmployees}
              cols={4}
            />
          </Field>

          <Field label="Yillik daromad (taxminan)">
            <ChipGroup
              options={[{ value: '<500mln', label: '< 500 mln' }, { value: '500mln-1mlrd', label: '500 mln – 1 mlrd' }, { value: '>1mlrd', label: '1 mlrd +' }]}
              value={revenueBand}
              onChange={setRevenueBand}
              cols={3}
            />
          </Field>

          <Field label="Kredit uchun garov">
            <ChipGroup
              options={Object.entries(COLLATERAL_LABELS).map(([v, l]) => ({ value: v, label: l }))}
              value={collateral}
              onChange={v => setCollateral(v as Collateral)}
              cols={2}
            />
          </Field>
        </Card>

        {/* Section 3: Bio */}
        <Card title="💬 Qo'shimcha ma'lumot" subtitle="AI bilishi kerak bo'lgan boshqa narsalar (ixtiyoriy)">
          <textarea value={bio} onChange={e => setBio(e.target.value)}
            rows={4}
            placeholder="Masalan: do'konim Chorsu bozori yaqinida, asosan kiyim-kechak sotyapmiz. Yaqinda yangi omborxona ochishni rejalashtirmoqdamiz. Kapitalbank'dan kredit olgan edim, muddat tugayapti..."
            className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-emerald-500 rounded-xl text-white text-sm placeholder-zinc-500 outline-none transition-colors resize-none" />
        </Card>

        {/* Save */}
        <button onClick={handleSave}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${saved ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
          {saved ? '✓ Saqlandi — AI endi profilingizni biladi' : 'Profilni saqlash'}
        </button>

        <p className="text-zinc-700 text-xs text-center pb-8">
          Ma'lumotlaringiz faqat AI maslahatini yaxshilash uchun ishlatiladi
        </p>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

// Workaround: type alias inline since we can't import the union directly
type UserProfile_disability = 'I' | 'II' | 'III' | undefined;

const input = 'w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 focus:border-emerald-500 rounded-xl text-white text-sm placeholder-zinc-500 outline-none transition-colors';

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        {subtitle && <p className="text-zinc-600 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-zinc-400 text-xs font-medium mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function ChipGroup({ options, value, onChange, cols }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  cols: 1 | 2 | 3 | 4;
}) {
  const grid = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }[cols];
  return (
    <div className={`grid ${grid} gap-2`}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors ${
            value === o.value
              ? 'bg-emerald-700 border-emerald-600 text-white'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
