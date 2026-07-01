/**
 * ThemeToggle — sun/moon day-night switch.
 * Playful icon-button motion; the icon cross-fades and rotates on flip.
 */

import { useTheme } from '../lib/theme';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={e => toggle({ x: e.clientX, y: e.clientY })}
      aria-label={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
      title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
      className="btn-icon relative w-9 h-9 grid place-items-center rounded-full border border-line bg-surface text-gold hover:bg-elevated"
    >
      <span className="relative w-5 h-5 block">
        {/* Sun */}
        <svg
          viewBox="0 0 24 24" fill="none"
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isDark ? 'opacity-0 scale-50 -rotate-90' : 'opacity-100 scale-100 rotate-0'}`}
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
          <g>
            <line x1="12" y1="2.5" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="21.5" y2="12" />
            <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
            <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
            <line x1="5.2" y1="18.8" x2="6.9" y2="17.1" />
            <line x1="17.1" y1="6.9" x2="18.8" y2="5.2" />
          </g>
        </svg>
        {/* Moon */}
        <svg
          viewBox="0 0 24 24" fill="currentColor"
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'}`}
        >
          <path d="M20 14.5A8 8 0 0 1 9.5 4a0.5 0.5 0 0 0-.7-.6A9 9 0 1 0 20.6 15.2a0.5 0.5 0 0 0-.6-.7Z" />
        </svg>
      </span>
    </button>
  );
}
