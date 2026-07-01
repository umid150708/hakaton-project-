/**
 * theme.ts — day/night theme state.
 *
 * The initial class is set by an inline script in index.html before first paint
 * to avoid a flash; this hook mirrors it into React state and persists to
 * localStorage under `bb-theme`. Toggling uses the View Transitions API for a
 * circular reveal wipe, falling back to a plain color fade where unsupported
 * or under reduced-motion.
 */

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface Origin { x: number; y: number }

const KEY = 'bb-theme';

function current(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

function applyClasses(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
}

/** Fallback for browsers without the View Transitions API. */
function applyWithColorFade(theme: Theme) {
  const root = document.documentElement;
  root.classList.add('theme-anim');
  applyClasses(theme);
  window.setTimeout(() => root.classList.remove('theme-anim'), 400);
}

function applyThemeAnimated(theme: Theme, origin?: Origin) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof document.startViewTransition !== 'function') {
    applyWithColorFade(theme);
    return;
  }

  const { x, y } = origin ?? { x: window.innerWidth / 2, y: 0 };
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(() => applyClasses(theme));

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => { /* transition skipped (e.g. tab hidden) — theme classes are already applied */ });
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => { setTheme(current()); }, []);

  const toggle = useCallback((origin?: Origin) => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyThemeAnimated(next, origin);
      return next;
    });
  }, []);

  return { theme, toggle };
}
