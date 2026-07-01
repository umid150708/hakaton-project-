/**
 * AuthModal.tsx — Google + email/password auth via Supabase Auth.
 *
 * Tabs: Ro'yxatdan o'tish (sign up) / Kirish (sign in).
 * Both offer a Google button and an email + password form.
 * On success the auth store updates and onSuccess() is called.
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { signUpEmail, signInEmail, signInGoogle } from '../lib/auth';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
  initialMode?: 'signup' | 'signin';
}

export default function AuthModal({ onSuccess, onClose, initialMode = 'signup' }: Props) {
  const [mode, setMode]         = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState('');
  const [notice, setNotice]     = useState('');

  const canSubmit = /\S+@\S+\.\S+/.test(email) && password.length >= 6;

  const doGoogle = async () => {
    setError('');
    const { error } = await signInGoogle();
    if (error) setError('Google orqali kirishda xatolik. Qayta urinib ko\'ring.');
    // On success the browser redirects to Google, then back to the app.
  };

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true);
    setError('');
    setNotice('');

    if (mode === 'signup') {
      const { data, error } = await signUpEmail(email.trim(), password);
      setBusy(false);
      if (error) { setError(translate(error.message)); return; }
      if (!data.session) {
        // Email confirmation is ON — user must click the link first
        setNotice("Tasdiqlash havolasi emailingizga yuborildi. Uni bosib, keyin kiring.");
        return;
      }
      onSuccess();
    } else {
      const { error } = await signInEmail(email.trim(), password);
      setBusy(false);
      if (error) { setError(translate(error.message)); return; }
      onSuccess();
    }
  };

  return createPortal((
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-page/80 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto bg-surface rounded-2xl border border-line-strong shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header + mode tabs */}
        <div className="bg-brand-soft px-5 py-4 border-b border-line flex items-center justify-between">
          <div className="flex gap-1 bg-elevated/60 rounded-xl p-1">
            <button onClick={() => { setMode('signup'); setError(''); setNotice(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all btn-soft ${mode === 'signup' ? 'bg-brand text-brand-ink' : 'text-muted hover:text-ink'}`}>
              Ro'yxatdan o'tish
            </button>
            <button onClick={() => { setMode('signin'); setError(''); setNotice(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all btn-soft ${mode === 'signin' ? 'bg-brand text-brand-ink' : 'text-muted hover:text-ink'}`}>
              Kirish
            </button>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-elevated hover:bg-elevated text-muted hover:text-ink transition-colors btn-icon">✕</button>
        </div>

        <div className="p-5 space-y-4">

          <p className="text-muted text-xs text-center leading-relaxed">
            {mode === 'signup'
              ? "Hisob yarating — AI sizning biznesingizga moslashtirilgan javob beradi."
              : "Hisobingizga kiring — profilingiz va biznes ma'lumotlaringiz tiklanadi."}
          </p>

          {/* Google */}
          <button onClick={doGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-sm font-bold transition-colors active:scale-95 btn-soft">
            <GoogleIcon />
            Google bilan {mode === 'signup' ? "ro'yxatdan o'tish" : 'kirish'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-elevated" />
            <span className="text-faint text-xs">yoki</span>
            <div className="flex-1 h-px bg-elevated" />
          </div>

          {/* Email */}
          <div>
            <label className="text-muted text-xs font-medium mb-1.5 block">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="aziz@mail.uz" type="email"
              className="w-full px-3 py-2.5 bg-elevated border border-line-strong focus:border-brand rounded-xl text-ink text-sm placeholder:text-faint outline-none transition-colors" />
          </div>

          {/* Password */}
          <div>
            <label className="text-muted text-xs font-medium mb-1.5 block">Parol</label>
            <input value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi" type="password"
              onKeyDown={e => { if (e.key === 'Enter') submit(); }}
              className="w-full px-3 py-2.5 bg-elevated border border-line-strong focus:border-brand rounded-xl text-ink text-sm placeholder:text-faint outline-none transition-colors" />
          </div>

          {error  && <p className="text-red-400 text-xs text-center">{error}</p>}
          {notice && <p className="text-brand text-xs text-center">{notice}</p>}

          <button onClick={submit} disabled={!canSubmit || busy}
            className="w-full py-3 bg-brand hover:bg-brand-hover disabled:bg-elevated disabled:text-faint disabled:cursor-not-allowed text-brand-ink text-sm font-bold rounded-xl transition-all active:scale-95 btn-cta">
            {busy ? 'Kuting…' : mode === 'signup' ? "Ro'yxatdan o'tish" : 'Kirish →'}
          </button>

          <p className="text-faint text-[11px] text-center leading-relaxed">
            {mode === 'signup'
              ? 'Hisob yaratish bilan foydalanish shartlarini qabul qilasiz.'
              : "Hisobingiz yo'qmi? Yuqoridan \"Ro'yxatdan o'tish\"ni tanlang."}
          </p>
        </div>
      </div>
    </div>
  ), document.body);
}

/** Map common Supabase auth errors to Uzbek. */
function translate(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists'))
    return "Bu email allaqachon ro'yxatdan o'tgan. \"Kirish\"ni tanlang.";
  if (m.includes('invalid login'))          return "Email yoki parol noto'g'ri.";
  if (m.includes('password'))               return 'Parol kamida 6 ta belgidan iborat bo\'lsin.';
  if (m.includes('email not confirmed'))    return 'Emailingizni tasdiqlang (havola yuborilgan).';
  return "Xatolik yuz berdi. Qayta urinib ko'ring.";
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
