/**
 * AuthButton.tsx — navbar auth control.
 *
 * Signed out → "Kirish" button that opens the AuthModal.
 * Signed in  → name chip with a dropdown to sign out.
 *
 * Placed top-right so users can create/access the account that powers
 * personalized AI answers.
 */

import { useState, useEffect, useRef } from 'react';
import { getUser, signOut, type UserProfile } from '../lib/auth';
import AuthModal from './AuthModal';

export default function AuthButton() {
  const [user, setUser]   = useState<UserProfile | null>(getUser);
  const [modal, setModal] = useState<null | 'signup' | 'signin'>(null);
  const [menu, setMenu]   = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menu]);

  const onSuccess = () => { setUser(getUser()); setModal(null); };
  const doSignOut = () => { signOut(); setUser(null); setMenu(false); };

  if (user) {
    const first = user.name?.trim().split(' ')[0] || 'Foydalanuvchi';
    const initial = first.charAt(0).toUpperCase();
    return (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenu(m => !m)}
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors">
          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{initial}</span>
          <span className="text-white text-sm font-medium max-w-[100px] truncate">{first}</span>
          <span className="text-zinc-500 text-xs">▾</span>
        </button>
        {menu && (
          <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
            <div className="px-3 py-2.5 border-b border-zinc-800">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <p className="text-zinc-500 text-xs truncate">{user.phone}</p>
            </div>
            <button onClick={doSignOut}
              className="w-full text-left px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              Chiqish
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setModal('signin')}
        className="px-4 py-2 text-sm font-semibold text-zinc-200 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl transition-colors">
        Kirish
      </button>
      {modal && <AuthModal initialMode={modal} onSuccess={onSuccess} onClose={() => setModal(null)} />}
    </>
  );
}
