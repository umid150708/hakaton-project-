/**
 * AuthButton.tsx — navbar auth control. Signed out shows a "Kirish" button that
 * opens the AuthModal; signed in shows a name chip with a sign-out dropdown.
 * Reacts to the auth store, updating instantly on sign in/out.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, signOut, getUser, saveUser } from '../lib/auth';
import AuthModal from './AuthModal';

export default function AuthButton() {
  const user     = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState<null | 'signup' | 'signin'>(null);
  const [menu, setMenu]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menu]);

  if (user) {
    const label = user.name?.trim().split(' ')[0] || user.email?.split('@')[0] || 'Hisob';
    const initial = label.charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-1.5">
        {/* Chip → opens profile popover (shows details) */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenu(m => !m)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-surface border border-line-strong hover:border-brand transition-colors btn-icon">
            <span className="w-6 h-6 rounded-lg bg-brand text-brand-ink text-xs font-bold flex items-center justify-center">{initial}</span>
            <span className="text-ink text-sm font-medium max-w-[100px] truncate">{label}</span>
            <span className="text-faint text-xs">▾</span>
          </button>

          {menu && (
            <div className="absolute right-0 mt-2 w-72 bg-surface border border-line-strong rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-line">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-brand-ink font-bold">{label.charAt(0)}</div>
                  <div className="flex-1">
                    <p className="text-ink text-sm font-semibold truncate">{user.name || label}</p>
                    <p className="text-faint text-xs truncate">{user.email || user.phone}</p>
                  </div>
                </div>
                <div className="mt-3 text-muted text-xs space-y-1">
                  {user.businessName && <div><strong className="text-muted">Tashkilot:</strong> {user.businessName}</div>}
                  {user.bizType && <div><strong className="text-muted">Biznes turi:</strong> {user.bizType}</div>}
                  {user.disability && <div><strong className="text-muted">Nogironlik:</strong> {user.disability}</div>}
                  {user.location && <div><strong className="text-muted">Hudud:</strong> {user.location}</div>}
                  {user.revenueBand && <div><strong className="text-muted">Tushum:</strong> {user.revenueBand}</div>}
                  {user.employees && <div><strong className="text-muted">Xodimlar:</strong> {user.employees}</div>}
                </div>
              </div>
              <div className="px-3 py-2 grid gap-1">
                <button onClick={() => { setMenu(false); navigate('/profile'); }}
                  className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-elevated rounded-lg transition-colors btn-soft">
                  Profilni ko'rish
                </button>
                <button onClick={() => { setMenu(false); navigate('/profile#edit'); }}
                  className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-elevated rounded-lg transition-colors btn-soft">
                  Tahrirlash
                </button>
                <button onClick={() => { void signOut(); setMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-red-400 rounded-lg transition-colors btn-soft">
                  Chiqish
                </button>
                {import.meta.env.DEV && (
                  <button onClick={() => {
                    const demo = {
                      name: 'Jasur Karimov', phone: '+998901234567', email: 'jasur@example.uz', bizType: 'savdo', plan: 'free', dealContactsUsed: 0, joinedAt: new Date().toISOString(),
                      disability: 'II', location: 'Toshkent', revenueBand: '<500mln', employees: '1-5', businessName: 'Jasur Novvoyxonasi', regType: 'mchj', yearsInBiz: '1-3', collateral: 'real_estate', bio: 'Novvoyxona egasi, 3 yillik tajriba.'
                    };
                    saveUser(demo as any);
                    setMenu(false);
                    window.location.reload();
                  }}
                    className="w-full text-left px-3 py-2 text-sm text-brand hover:bg-elevated rounded-lg transition-colors btn-soft">
                    Sign in as demo (DEV)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setModal('signin')}
        className="px-4 py-2 text-sm font-semibold text-muted hover:text-ink border border-line-strong hover:border-line-strong rounded-xl transition-colors btn-soft">
        Kirish
      </button>
      {modal && <AuthModal initialMode={modal} onSuccess={() => setModal(null)} onClose={() => setModal(null)} />}
    </>
  );
}
