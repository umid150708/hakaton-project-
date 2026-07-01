/**
 * Bozor.tsx — B2B Marketplace page (Muammo 14)
 *
 * Ads come from the shared Supabase backend (/api/ads) so buyers and sellers see
 * each other. If that backend isn't reachable yet (tables not created), it falls
 * back to local + sample ads so the page keeps working. Sample ads carry their
 * own contact and use the simple free-limit gate; real backend ads reveal their
 * contact only via /api/reveal (free limit / subscription / paid deal fee).
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth, useDealContact, FREE_LIMIT } from '../lib/auth';
import { CATEGORIES, SAMPLE_BUY, SAMPLE_SELL, loadUserAds, type Ad, type Category } from '../lib/bozorData';
import { marketplace, computeFee, type Match } from '../lib/marketplace';
import { fmtSum } from '../lib/pricingConfig';

import AdCard           from '../components/AdCard';
import PostAdModal      from '../components/PostAdModal';
import AIStrip          from '../components/AIStrip';
import AuthModal        from '../components/AuthModal';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle      from '../components/ThemeToggle';

// ─── Deal modal (terms → gated contact reveal, incl. pay-per-deal) ─────────────

function DealModal({
  ad, isSignedIn, plan, freeLeft, onNeedSignup, onClose,
}: {
  ad: Ad;
  isSignedIn: boolean;
  plan: string;
  freeLeft: number | null;
  onNeedSignup: () => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const isBuy  = ad.type === 'buy';
  const accent = isBuy ? 'text-sky' : 'text-brand';
  const btnCls = isBuy ? 'bg-sky hover:bg-sky/90' : 'bg-brand hover:bg-brand-hover';

  // Sample/local ads carry their contact; real backend ads have it stripped.
  const hasLocalContact = !!ad.contact;

  type Phase = 'terms' | 'loading' | 'revealed' | 'payfee' | 'paying' | 'error';
  const [phase, setPhase]     = useState<Phase>('terms');
  const [contact, setContact] = useState('');
  const [fee, setFee]         = useState(0);

  const revealLocal = () => {
    if (!isSignedIn) { onNeedSignup(); return; }
    if (plan === 'free' && (freeLeft ?? 0) <= 0) { onClose(); navigate('/pricing'); return; }
    if (plan === 'free') {
      if (useDealContact() === 'paywall') { onClose(); navigate('/pricing'); return; }
    }
    setContact(ad.contact);
    setPhase('revealed');
  };

  const revealRemote = async () => {
    if (!isSignedIn) { onNeedSignup(); return; }
    setPhase('loading');
    try {
      const r = await marketplace.reveal(ad.id);
      if ('contact' in r && r.contact) { setContact(r.contact); setPhase('revealed'); return; }
      if ('paywall' in r) {
        if (r.paywall === 'signup')    { onClose(); onNeedSignup(); return; }
        if (r.paywall === 'subscribe') { onClose(); navigate('/pricing'); return; }
        if (r.paywall === 'payfee')    { setFee(r.fee ?? computeFee(null, null)); setPhase('payfee'); return; }
      }
      setPhase('error');
    } catch { setPhase('error'); }
  };

  const doAgree = () => (hasLocalContact ? revealLocal() : revealRemote());

  const doPay = async () => {
    setPhase('paying');
    try {
      await marketplace.payDealFee(ad.id);
      const r = await marketplace.reveal(ad.id);
      if ('contact' in r && r.contact) { setContact(r.contact); setPhase('revealed'); return; }
      setPhase('error');
    } catch { setPhase('error'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-line-strong shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-ink font-bold leading-tight">{ad.product}</p>
            <span className={`text-[11px] font-semibold ${accent}`}>{isBuy ? '🛒 Xaridor' : '💰 Sotuvchi'}</span>
          </div>
          <button onClick={onClose} className="text-faint hover:text-ink shrink-0 btn-icon">✕</button>
        </div>

        {/* Deal facts */}
        <div className="space-y-2 text-sm bg-elevated/50 rounded-xl p-3">
          {ad.quantity && <p className="text-muted">📦 {ad.quantity}</p>}
          {ad.location && <p className="text-muted">📍 {ad.location}</p>}
          {ad.price && <p className={`font-bold ${accent}`}>💵 {ad.price}</p>}
        </div>

        {phase === 'revealed' ? (
          <>
            <a href={`tel:${contact.replace(/\s/g, '')}`}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold transition-colors btn-cta ${btnCls}`}>
              📞 {contact}
            </a>
            <p className="text-faint text-xs text-center">Kontakt ochildi. Bevosita bog'laning.</p>
          </>
        ) : phase === 'payfee' ? (
          /* ── Pay-per-deal: fee, then reveal ── */
          <>
            <div className="rounded-xl border border-purple-700/40 bg-purple-950/20 p-4 text-center space-y-1">
              <p className="text-muted text-xs">Platforma xizmat haqi (1.5%)</p>
              <p className="text-ink text-2xl font-black">{fmtSum(fee)} so'm</p>
              <p className="text-faint text-xs">To'lovdan so'ng kontakt ochiladi</p>
            </div>
            <button onClick={doPay} className="w-full py-3 rounded-xl text-white text-sm font-bold bg-purple-700 hover:bg-purple-600 transition-all active:scale-95 btn-cta">
              💳 To'lash — {fmtSum(fee)} so'm
            </button>
            <p className="text-faint text-[11px] text-center">Demo to'lov — haqiqiy pul yechilmaydi</p>
          </>
        ) : (
          /* ── Terms + gated action ── */
          <>
            <div className="rounded-xl border border-line-strong/60 p-3 space-y-1.5">
              <p className="text-muted text-xs font-semibold mb-1">Bitim shartlari</p>
              {[
                "Platforma xaridor va sotuvchini bevosita bog'laydi.",
                "Sifat, narx va yetkazib berish tomonlar kelishuviga bog'liq.",
                'Kontakt obuna, bepul limit yoki bitim haqi orqali ochiladi.',
              ].map(t => (
                <div key={t} className="flex items-start gap-2">
                  <span className={`shrink-0 text-xs ${accent}`}>•</span>
                  <span className="text-muted text-xs leading-relaxed">{t}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-elevated/60 border border-dashed border-line-strong text-faint text-sm">
              🔒 +998 •• ••• •• ••
            </div>

            <button onClick={doAgree} disabled={phase === 'loading'}
              className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-60 btn-cta ${btnCls}`}>
              {phase === 'loading' ? 'Tekshirilmoqda…' : isSignedIn ? '✓ Roziman — kontaktni ochish' : "Ro'yxatdan o'tib ochish"}
            </button>

            {phase === 'error' && <p className="text-red-400 text-xs text-center">Kontaktni ochib bo'lmadi. Qayta urinib ko'ring.</p>}
            <p className="text-faint text-xs text-center">
              {isSignedIn && plan === 'free' && freeLeft !== null && `Bepul limit: ${freeLeft} ta qoldi`}
              {isSignedIn && plan !== 'free' && plan !== 'deal_fee' && 'Obunangiz faol — cheksiz aloqa'}
              {isSignedIn && plan === 'deal_fee' && "Har bitim uchun xizmat haqi to'lanadi"}
              {!isSignedIn && "Kontaktni ochish uchun avval ro'yxatdan o'ting"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Bozor() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [tab, setTab]       = useState<'buy' | 'sell'>('buy');
  const [cat, setCat]       = useState<Category>('all');
  const [search, setSearch] = useState('');

  // Ads: remote (Supabase) is primary; local + samples are the fallback.
  const [remoteAds, setRemoteAds] = useState<Ad[] | null>(null);   // null = not loaded / backend down
  const [localAds]                = useState<Ad[]>(loadUserAds);
  const [reloadKey, setReloadKey] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [matchToast, setMatchToast]       = useState<Match[] | null>(null);

  const authUser = useAuth();
  const [showSignUp, setShowSignUp]     = useState(false);
  const [dealAd, setDealAd]             = useState<Ad | null>(null);
  const [pendingAd, setPendingAd]       = useState<Ad | null>(null);

  const isBuy = tab === 'buy';

  // Load ads for the current tab from the shared backend (all categories; we
  // filter client-side so the category counts stay correct).
  useEffect(() => {
    let cancelled = false;
    marketplace.listAds(tab, 'all')
      .then(ads => { if (!cancelled) setRemoteAds(ads); })
      .catch(() => { if (!cancelled) setRemoteAds(null); });
    return () => { cancelled = true; };
  }, [tab, reloadKey]);

  // ── Derived ad lists ──────────────────────────────────────────────────────────

  const samples: Ad[] = isBuy ? SAMPLE_BUY : SAMPLE_SELL;
  const baseAds: Ad[] = remoteAds != null
    ? [...remoteAds, ...samples]
    : [...localAds.filter(a => a.type === tab), ...samples];

  const countByCat = (c: Category) =>
    c === 'all' ? baseAds.length : baseAds.filter(a => a.category === c).length;

  const q = search.toLowerCase().trim();
  const visibleAds = baseAds
    .filter(a => cat === 'all' || a.category === cat)
    .filter(a => !q || a.product.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));

  // Deep-link from a notification: /bozor?ad=<id> opens that deal.
  useEffect(() => {
    const adId = params.get('ad');
    if (!adId || remoteAds == null) return;
    const found = [...remoteAds, ...samples].find(a => a.id === adId);
    if (found) { setDealAd(found); setParams({}, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteAds]);

  const freeLeft = authUser?.plan === 'free'
    ? Math.max(0, FREE_LIMIT - (authUser.dealContactsUsed ?? 0))
    : null;

  const openDeal = (ad: Ad) => {
    if (!authUser) { setPendingAd(ad); setShowSignUp(true); return; }
    setDealAd(ad);
  };

  const onSignUpSuccess = () => {
    setShowSignUp(false);
    if (pendingAd) { setDealAd(pendingAd); setPendingAd(null); }
  };

  const onPosted = (matches: Match[]) => {
    setReloadKey(k => k + 1);                 // refresh ads from backend
    if (matches.length) setMatchToast(matches);
  };

  const switchTab = (t: 'buy' | 'sell') => { setTab(t); setCat('all'); setSearch(''); };

  const totalBuy  = (remoteAds != null && isBuy  ? remoteAds : (isBuy  ? localAds.filter(a => a.type === 'buy')  : [])).length + SAMPLE_BUY.length;
  const totalSell = (remoteAds != null && !isBuy ? remoteAds : (!isBuy ? localAds.filter(a => a.type === 'sell') : [])).length + SAMPLE_SELL.length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-page/95 backdrop-blur border-b border-line">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-faint hover:text-ink text-xl leading-none shrink-0 btn-icon">←</button>

          <div className="flex bg-surface border border-line-strong rounded-xl p-1 gap-1 shrink-0">
            <button onClick={() => switchTab('buy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all btn-soft ${
                isBuy ? 'bg-sky text-white shadow-lg shadow-blue-900/40' : 'text-muted hover:text-ink'}`}>
              🛒 Xaridorlar
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isBuy ? 'bg-sky/40 text-blue-100' : 'bg-elevated text-faint'}`}>{totalBuy}</span>
            </button>
            <button onClick={() => switchTab('sell')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all btn-soft ${
                !isBuy ? 'bg-brand text-white shadow-lg shadow-emerald-900/40' : 'text-muted hover:text-ink'}`}>
              💰 Sotuvchilar
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${!isBuy ? 'bg-brand-soft text-emerald-100' : 'bg-elevated text-faint'}`}>{totalSell}</span>
            </button>
          </div>

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm pointer-events-none">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot yoki shahar..."
              className="w-full pl-9 pr-8 py-2 bg-elevated border border-line-strong focus:border-sky/40 rounded-xl text-ink text-sm placeholder:text-faint outline-none transition-colors" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink text-xs btn-icon">✕</button>}
          </div>

          <NotificationBell />

          <ThemeToggle />

          {!authUser ? (
            <button onClick={() => setShowSignUp(true)}
              className="shrink-0 px-3 py-1.5 bg-brand-soft hover:bg-emerald-700/60 text-brand text-xs font-semibold rounded-lg border border-brand transition-colors btn-soft">
              🎁 Bepul kirish
            </button>
          ) : freeLeft !== null ? (
            <button onClick={() => navigate('/pricing')}
              className={`shrink-0 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors btn-soft ${
                freeLeft === 0 ? 'bg-red-900/40 border-red-700/50 text-red-400 hover:bg-red-800/40' : 'bg-elevated border-line-strong text-muted hover:text-ink'}`}>
              {freeLeft === 0 ? '🔒 Limit tugadi' : `🎁 ${freeLeft} ta bepul`}
            </button>
          ) : (
            <span className="shrink-0 px-2.5 py-1 bg-purple-900/30 text-purple-400 text-xs font-semibold rounded-lg border border-purple-800/50">⭐ Pro</span>
          )}

          <button onClick={() => setShowPostModal(true)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all active:scale-95 btn-cta ${
              isBuy ? 'bg-sky hover:bg-sky/90' : 'bg-brand hover:bg-brand-hover'}`}>
            <span>+</span><span className="hidden sm:inline">E'lon</span>
          </button>

          <button onClick={() => navigate('/interview')} title="AI Maslahat" className="shrink-0 text-faint hover:text-ink text-lg transition-colors btn-icon">🤖</button>
        </div>

        {/* Category filter strip */}
        <div className="border-t border-line/60 bg-page/80">
          <div className="max-w-5xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto">
            {CATEGORIES.map(c => {
              const count = countByCat(c.id);
              const active = cat === c.id;
              const disabled = count === 0 && c.id !== 'all';
              return (
                <button key={c.id} onClick={() => setCat(c.id)} disabled={disabled}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 btn-soft
                    ${active ? (isBuy ? 'bg-sky text-white' : 'bg-brand text-white')
                      : disabled ? 'bg-surface text-faint cursor-not-allowed border border-line'
                      : 'bg-elevated text-muted hover:text-ink border border-line-strong hover:border-line-strong'}`}>
                  <span>{c.icon}</span><span>{c.label}</span>
                  {c.id !== 'all' && count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-elevated text-muted'}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-4 space-y-4">

        <AIStrip key={`${tab}-${cat}`} tab={tab} cat={cat} ads={visibleAds} />

        <div className="flex items-center justify-between">
          <p className="text-faint text-sm">
            <span className={`font-semibold ${isBuy ? 'text-sky' : 'text-brand'}`}>{visibleAds.length}</span>
            {' '}ta {q || cat !== 'all' ? 'natija' : isBuy ? "xarid e'loni" : "sotuv e'loni"}
            {cat !== 'all' && <> · <span className="text-ink">{CATEGORIES.find(c => c.id === cat)?.label}</span></>}
            {q && <> · "<span className="text-ink">{search}</span>"</>}
          </p>
          {(q || cat !== 'all') && (
            <button onClick={() => { setSearch(''); setCat('all'); }} className="text-xs text-faint hover:text-ink transition-colors link-quiet">Filtrni tozalash ✕</button>
          )}
        </div>

        {visibleAds.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-muted font-semibold mb-1">Hech narsa topilmadi</p>
            <p className="text-faint text-sm">Filtr yoki qidiruvni o'zgartiring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleAds.map(ad => <AdCard key={ad.id} ad={ad} onOpen={() => openDeal(ad)} />)}
          </div>
        )}
      </div>

      {/* ── Match toast (after posting) ── */}
      {matchToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <div className="bg-surface border border-brand rounded-2xl shadow-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-brand text-sm font-bold">🎯 {matchToast.length} ta mos taklif topildi!</p>
                <p className="text-muted text-xs mt-0.5">Sizning e'loningizga mos e'lonlar mavjud.</p>
              </div>
              <button onClick={() => setMatchToast(null)} className="text-faint hover:text-ink shrink-0 btn-icon">✕</button>
            </div>
            <div className="mt-3 space-y-1.5">
              {matchToast.slice(0, 3).map(m => (
                <button key={m.ad.id} onClick={() => { setMatchToast(null); openDeal(m.ad); }}
                  className="w-full text-left flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-elevated hover:bg-elevated transition-colors btn-soft">
                  <span className="text-ink text-xs font-medium truncate">{m.ad.product} · {m.ad.location}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-soft text-brand font-bold shrink-0">{m.score}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {showPostModal && <PostAdModal type={tab} onClose={() => setShowPostModal(false)} onPosted={onPosted} />}
      {showSignUp    && <AuthModal onSuccess={onSignUpSuccess} onClose={() => { setShowSignUp(false); setPendingAd(null); }} />}
      {dealAd        && (
        <DealModal
          ad={dealAd}
          isSignedIn={!!authUser}
          plan={authUser?.plan ?? 'free'}
          freeLeft={freeLeft}
          onNeedSignup={() => { setPendingAd(dealAd); setDealAd(null); setShowSignUp(true); }}
          onClose={() => setDealAd(null)}
        />
      )}

      <footer className="border-t border-line bg-surface/40 px-4 py-2.5 text-center space-y-0.5">
        <p className="text-faint text-xs">Chorsu · Ipodrom ulgurji bozori · 2026-yil iyun · Bozorboy</p>
        <p className="text-faint text-[11px]">
          O'rtacha ulgurji narxlar — indikativ, manba:{' '}
          <a href="https://uzex.uz" target="_blank" rel="noopener noreferrer" className="text-faint hover:text-muted link-quiet">UzEx</a> ·{' '}
          <a href="https://stat.uz" target="_blank" rel="noopener noreferrer" className="text-faint hover:text-muted link-quiet">stat.uz</a>
        </p>
      </footer>
    </div>
  );
}
