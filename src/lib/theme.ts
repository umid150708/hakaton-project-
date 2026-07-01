/**
 * theme.ts — day/night theme state.
 *
 * The initial class is set by an inline script in index.html (before first
 * paint) to avoid a flash. This hook mirrors that class into React state and
 * persists changes to localStorage under `bb-theme`.
 */

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'bb-theme';

function current(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

function apply(theme: Theme) {
  const root = document.documentElement;
  // Enable the color-transition only for the flip, then remove so it never
  // interferes with hover/scroll interactions.
  root.classList.add('theme-anim');
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
  try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
  window.setTimeout(() => root.classList.remove('theme-anim'), 400);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => { setTheme(current()); }, []);

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      apply(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
