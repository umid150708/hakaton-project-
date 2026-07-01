import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconRosetteDiscountCheck, IconEdit, IconPlus, IconMapPin, IconBuildingStore,
  IconBriefcase, IconClipboardText, IconCalendar, IconUsers, IconCoin,
  IconBuildingBank, IconWheelchair, IconLayoutGrid, IconPackage, IconUser,
  IconTag, IconWheat, IconMeat, IconCarrot, IconBuildingSkyscraper, IconBread,
  IconShirt, IconPlant2, IconChevronLeft, type Icon,
} from '@tabler/icons-react';
import {
  useAuth, updateProfile, PLAN_NAMES,
  BIZ_TYPE_LABELS, REG_TYPE_LABELS, COLLATERAL_LABELS,
  type BizType, type RegType, type Collateral, type YearsInBiz,
} from '../lib/auth';
import { loadUserAds, type Ad, type Category } from '../lib/bozorData';
import ThemeToggle from '../components/ThemeToggle';

const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Samarqand', "Farg'ona",
  'Andijon', 'Namangan', 'Buxoro', 'Nukus', 'Qarshi', 'Jizzax',
  'Navoiy', 'Sirdaryo', 'Xorazm', 'Termiz', 'Urganch', "Qo'qon",
];

// Category → line icon for the listings grid.
const CAT_ICON: Record<Category, Icon> = {
  all: IconPackage, grain: IconWheat, meat: IconMeat, veg: IconCarrot,
  build: IconBuildingSkyscraper, food: IconBread, textile: IconShirt,
  agri: IconPlant2, other: IconPackage,
};

export default function Profile() {
  const navigate = useNavigate();
  const user     = useAuth();

  // View (Instagram-style) is default; the form is behind "Tahrirlash".
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
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted text-sm">Profilni ko'rish uchun hisobingizga kiring.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-brand text-sm hover:text-brand link-quiet">← Bosh sahifa</button>
        </div>
      </div>
    );
  }

  const initial = (businessName || name || user.email || 'U').charAt(0).toUpperCase();
  const handle  = user.email?.split('@')[0] || name?.trim().split(' ')[0]?.toLowerCase() || 'foydalanuvchi';
  const metaBits = [bizType && BIZ_TYPE_LABELS[bizType as BizType], regType && (regType as string).toUpperCase()].filter(Boolean);

  return (
    <div className="min-h-screen bg-page text-ink pb-24">

      {/* ── Nav bar ── */}
      <header className="sticky top-0 z-40 bg-page/90 backdrop-blur border-b border-line">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => (mode === 'edit' ? setMode('view') : navigate(-1))}
            className="text-muted hover:text-ink flex items-center gap-1 text-sm btn-icon">
            <IconChevronLeft size={18} /> {mode === 'edit' ? 'Bekor qilish' : 'Orqaga'}
          </button>
          <p className="text-ink font-medium text-sm">{mode === 'edit' ? 'Profilni tahrirlash' : 'Profil'}</p>
          <div className="flex items-center gap-3">
            {mode === 'edit'
              ? <button onClick={handleSave}
                  className={`text-sm font-semibold transition-colors ${saved ? 'text-brand' : 'text-brand hover:text-brand'}`}>
                  {saved ? '✓ Saqlandi' : 'Saqlash'}
                </button>
              : <button onClick={() => setMode('edit')} className="text-muted hover:text-ink text-sm">Tahrirlash</button>}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {mode === 'view' ? (
        // ═══════════════════════ INSTAGRAM-STYLE VIEW ═══════════════════════
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-7">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 pb-6 border-b border-line">
            {/* Avatar with emerald ring */}
            <div className="w-[88px] h-[88px] sm:w-24 sm:h-24 rounded-full bg-brand flex items-center justify-center text-brand-ink text-4xl font-semibold shrink-0 ring-2 ring-brand ring-offset-4 ring-offset-[var(--page)]">
              {initial}
            </div>

            <div className="flex-1 min-w-0 w-full">
              {/* Name + actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start min-w-0">
                  <h1 className="text-ink text-xl font-medium truncate">{name || 'Ismsiz'}</h1>
                  {user.plan !== 'free' && <IconRosetteDiscountCheck size={19} className="text-brand shrink-0" />}
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start sm:ml-auto">
                  <button onClick={() => setMode('edit')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-brand-ink text-sm font-semibold transition-colors btn-cta">
                    <IconEdit size={15} /> Tahrirlash
                  </button>
                  <button onClick={() => navigate('/bozor')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-line hover:border-line-strong text-muted text-sm font-semibold transition-colors btn-soft">
                    <IconPlus size={15} /> E'lon
                  </button>
                </div>
              </div>

              {/* Handle · tarif · location */}
              <div className="flex items-center gap-2.5 mt-2 flex-wrap justify-center sm:justify-start">
                <span className="text-faint text-sm">@{handle}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${user.plan !== 'free' ? 'bg-brand-soft text-brand' : 'bg-elevated text-muted'}`}>
                  {PLAN_NAMES[user.plan]} tarif
                </span>
                {location && (
                  <span className="text-muted text-sm flex items-center gap-1"><IconMapPin size={14} /> {location}</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 justify-center sm:justify-start">
                <Stat n={userAds.length}        label="e'lon" />
                <Stat n={user.dealContactsUsed} label="bitim" />
                <Stat n={`${pct}%`}             label="profil" highlight={pct >= 80} />
              </div>

              {/* Business name + bio */}
              {(businessName || metaBits.length > 0 || bio) && (
                <div className="mt-4 text-center sm:text-left">
                  {businessName && (
                    <div className="text-muted text-sm font-medium flex items-center gap-1.5 justify-center sm:justify-start">
                      <IconBuildingStore size={15} className="text-faint" /> {businessName}
                      {metaBits.length > 0 && <span className="text-faint font-normal">· {metaBits.join(' · ')}</span>}
                    </div>
                  )}
                  {bio && <p className="text-muted text-sm leading-relaxed mt-1.5 whitespace-pre-line">{bio}</p>}
                </div>
              )}
            </div>
          </div>

          {/* ── Completeness nudge (only if incomplete) ── */}
          {pct < 100 && (
            <button onClick={() => setMode('edit')}
              className="mt-5 w-full flex items-center gap-3 bg-surface border border-line hover:border-brand rounded-xl px-4 py-3 transition-colors text-left btn-soft">
              <div className="flex-1">
                <p className="text-muted text-sm">Profilingizni to'ldiring — AI aniqroq maslahat beradi</p>
                <div className="h-1.5 bg-elevated rounded-full overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="text-brand text-sm font-semibold shrink-0">{pct}%</span>
            </button>
          )}

          {/* ── Business info chips ── */}
          {infoCards().length > 0 && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {infoCards().map(c => (
                <div key={c.label} className="bg-surface border border-line rounded-xl px-3.5 py-3">
                  <div className="flex items-center gap-1.5 text-faint text-xs">
                    <c.icon size={14} className={c.color} /> {c.label}
                  </div>
                  <p className="text-ink text-sm font-medium mt-1.5 leading-tight">{c.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab ── */}
          <div className="mt-6 border-t border-line">
            <div className="inline-flex items-center gap-1.5 py-3 -mt-px border-t-2 border-brand text-ink text-sm font-medium">
              <IconLayoutGrid size={16} /> E'lonlarim
            </div>
          </div>

          {/* ── Listings grid (the "posts") ── */}
          {userAds.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-line-strong flex items-center justify-center mx-auto mb-4 text-faint">
                <IconPackage size={28} />
              </div>
              <p className="text-ink font-medium">Hali e'lon yo'q</p>
              <p className="text-faint text-sm mt-1">Birinchi e'loningizni joylang — bozorda ko'rinasiz</p>
              <button onClick={() => navigate('/bozor')}
                className="mt-4 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-brand-ink text-sm font-semibold transition-colors btn-cta">
                Bozorga o'tish
              </button>
            </div>
          ) : (
            <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {userAds.map(ad => {
                const Cat = CAT_ICON[ad.category] ?? IconPackage;
                const isBuy = ad.type === 'buy';
                return (
                  <button key={ad.id} onClick={() => navigate('/bozor')}
                    className="aspect-square rounded-xl bg-surface border border-line hover:border-line-strong p-3.5 flex flex-col justify-between text-left transition-colors overflow-hidden card-tap">
                    <div className="flex items-center justify-between">
                      <Cat size={22} className="text-muted" />
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isBuy ? 'bg-sky/10 text-sky' : 'bg-brand-soft text-brand'}`}>
                        {isBuy ? 'Olaman' : 'Sotaman'}
                      </span>
                    </div>
                    <div>
                      <p className="text-ink text-sm font-medium leading-snug line-clamp-2">{ad.product}</p>
                      <p className="text-faint text-xs mt-0.5">{ad.quantity}</p>
                      {ad.price && <p className="text-brand text-xs font-medium mt-0.5 truncate">{ad.price}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      ) : (
        // ═══════════════════════ EDIT FORM ═══════════════════════
        <div className="max-w-xl mx-auto px-4 py-5 space-y-6">

          {/* Completeness */}
          <div className="bg-surface rounded-2xl border border-line px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm font-medium">Profil to'ldirilgani</p>
              <p className={`text-sm font-bold ${pct >= 80 ? 'text-brand' : pct >= 40 ? 'text-gold' : 'text-faint'}`}>{pct}%</p>
            </div>
            <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-brand' : pct >= 40 ? 'bg-gold' : 'bg-elevated'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className="text-faint text-xs mt-2">To'liq profil = aniqroq AI maslahat</p>
          </div>

          {/* Personal */}
          <Section title="Shaxsiy ma'lumot">
            <Group>
              <InputRow icon={IconUser} iconBg="bg-red-500/90" label="Ism familiya">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Aziz Karimov" className={inputCls} />
              </InputRow>
              <Divider />
              <SelectRow icon={IconMapPin} iconBg="bg-blue-500/90" label="Joylashuv">
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
              <ChipRow icon={IconWheelchair} iconBg="bg-purple-500/90" label="Nogironlik guruhi"
                options={[{ value: '', label: "Yo'q" }, { value: 'I', label: 'I' }, { value: 'II', label: 'II' }, { value: 'III', label: 'III' }]}
                value={disability} onChange={setDisability} />
            </Group>
          </Section>

          {/* Business */}
          <Section title="Biznesingiz">
            <Group>
              <InputRow icon={IconBuildingStore} iconBg="bg-orange-500/90" label="Biznes nomi">
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Karimov Savdo" className={inputCls} />
              </InputRow>
              <Divider />
              <SelectRow icon={IconTag} iconBg="bg-emerald-500/90" label="Faoliyat turi">
                <select value={bizType} onChange={e => setBizType(e.target.value as BizType)} className={selectCls}>
                  <option value="">Tanlang</option>
                  {Object.entries(BIZ_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </SelectRow>
              <Divider />
              <SelectRow icon={IconClipboardText} iconBg="bg-sky-500/90" label="Ro'yxat shakli">
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
              <ChipRow icon={IconCalendar} iconBg="bg-pink-500/90" label="Biznes yoshi"
                options={[{ value: '<1', label: '<1' }, { value: '1-3', label: '1–3' }, { value: '3-5', label: '3–5' }, { value: '5+', label: '5+' }]}
                value={yearsInBiz} onChange={v => setYearsInBiz(v as YearsInBiz)} />
              <Divider />
              <ChipRow icon={IconUsers} iconBg="bg-teal-500/90" label="Xodimlar"
                options={[{ value: '0', label: "O'zim" }, { value: '1-5', label: '1–5' }, { value: '5-20', label: '5–20' }, { value: '20+', label: '20+' }]}
                value={employees} onChange={setEmployees} />
              <Divider />
              <ChipRow icon={IconCoin} iconBg="bg-amber-500/90" label="Yillik daromad"
                options={[{ value: '<500mln', label: '<500mln' }, { value: '500mln-1mlrd', label: '0.5–1mlrd' }, { value: '>1mlrd', label: '1mlrd+' }]}
                value={revenueBand} onChange={setRevenueBand} />
              <Divider />
              <SelectRow icon={IconBuildingBank} iconBg="bg-indigo-500/90" label="Kredit garovi">
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
                  className="w-full bg-transparent text-ink text-sm placeholder:text-faint outline-none resize-none leading-relaxed" />
              </div>
            </Group>
          </Section>

          {/* Big save */}
          <button onClick={handleSave}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 btn-cta ${saved ? 'bg-brand-soft text-brand border border-brand' : 'bg-brand hover:bg-brand-hover text-brand-ink'}`}>
            {saved ? '✓ Saqlandi — AI endi profilingizni biladi' : 'Profilni saqlash'}
          </button>

          <p className="text-faint text-xs text-center">
            Ma'lumotlaringiz faqat AI maslahatini yaxshilash uchun ishlatiladi
          </p>
        </div>
      )}
    </div>
  );

  // ── Business-info chips from filled fields ──
  function infoCards(): { icon: Icon; color: string; label: string; value: string }[] {
    const cards: { icon: Icon; color: string; label: string; value: string }[] = [];
    if (bizType)     cards.push({ icon: IconBriefcase,      color: 'text-brand', label: 'Faoliyat',   value: BIZ_TYPE_LABELS[bizType as BizType] });
    if (regType)     cards.push({ icon: IconClipboardText,  color: 'text-sky',    label: 'Shakl',      value: REG_TYPE_LABELS[regType as RegType] });
    if (yearsInBiz)  cards.push({ icon: IconCalendar,       color: 'text-muted',    label: 'Tajriba',    value: `${yearsInBiz} yil` });
    if (employees)   cards.push({ icon: IconUsers,          color: 'text-muted',    label: 'Xodimlar',   value: employees === '0' ? "O'zim" : `${employees} kishi` });
    if (revenueBand) cards.push({ icon: IconCoin,           color: 'text-gold',   label: 'Daromad',    value: revenueBand });
    if (collateral && collateral !== 'none') cards.push({ icon: IconBuildingBank, color: 'text-muted', label: 'Garov', value: COLLATERAL_LABELS[collateral as Collateral] });
    if (disability)  cards.push({ icon: IconWheelchair,     color: 'text-gold',  label: 'Nogironlik', value: `${disability} guruh` });
    return cards;
  }
}

// Inline type aliases (unions live in auth.ts)
type UserRevenue   = '<500mln' | '500mln-1mlrd' | '>1mlrd';
type UserEmployees = '0' | '1-5' | '5-20' | '20+';

const inputCls  = 'w-full bg-transparent text-ink text-sm text-right placeholder:text-faint outline-none';
const selectCls = 'bg-transparent text-ink text-sm text-right outline-none appearance-none cursor-pointer max-w-[180px] [&>option]:bg-surface';

// ── Instagram stat cell ────────────────────────────────────────────────────────

function Stat({ n, label, highlight }: { n: number | string; label: string; highlight?: boolean }) {
  return (
    <div>
      <span className={`text-base font-semibold ${highlight ? 'text-brand' : 'text-ink'}`}>{n}</span>{' '}
      <span className="text-faint text-sm">{label}</span>
    </div>
  );
}

// ── iOS-style building blocks (edit form) ──────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-faint text-xs font-semibold px-4 mb-2">{title}</p>
      {children}
      {hint && <p className="text-faint text-xs px-4 mt-2">{hint}</p>}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="bg-surface rounded-2xl border border-line overflow-hidden">{children}</div>;
}

function Divider() {
  return <div className="h-px bg-elevated ml-[52px]" />;
}

function IconSquare({ icon: Ic, iconBg }: { icon: Icon; iconBg: string }) {
  return (
    <span className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
      <Ic size={16} className="text-white" />
    </span>
  );
}

function InputRow({ icon, iconBg, label, children }: { icon: Icon; iconBg: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
      <IconSquare icon={icon} iconBg={iconBg} />
      <span className="text-ink text-sm font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end min-w-0">{children}</div>
    </div>
  );
}

function SelectRow({ icon, iconBg, label, children }: { icon: Icon; iconBg: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
      <IconSquare icon={icon} iconBg={iconBg} />
      <span className="text-ink text-sm font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end items-center gap-1 min-w-0">
        {children}
        <span className="text-faint text-xs shrink-0">▾</span>
      </div>
    </div>
  );
}

function ChipRow({ icon, iconBg, label, options, value, onChange }: {
  icon: Icon; iconBg: string; label: string;
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 min-h-[52px]">
      <IconSquare icon={icon} iconBg={iconBg} />
      <span className="text-ink text-sm font-medium whitespace-nowrap">{label}</span>
      <div className="flex-1 flex justify-end gap-1.5 flex-wrap">
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors btn-soft ${
              value === o.value ? 'bg-brand text-brand-ink' : 'bg-elevated text-muted hover:text-ink'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
