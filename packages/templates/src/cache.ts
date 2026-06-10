import type { Theme } from './types';

export function normalizeTheme(theme: Partial<Theme>): Theme {
  return {
    primary: (theme.primary ?? '#3aa6ff').toLowerCase().trim(),
    secondary: (theme.secondary ?? '#ffffff').toLowerCase().trim(),
    playerLabel: (theme.playerLabel ?? 'player').toString().trim(),
    enemyLabel: (theme.enemyLabel ?? 'enemy').toString().trim(),
    flavorText: (theme.flavorText ?? '').toString().trim(),
  };
}

// A tiny djb2-like string hash, deterministic across runtimes.
export function hashString(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

export function cacheKey(genre: string, theme: Partial<Theme>): string {
  const t = normalizeTheme(theme);
  const joined = [genre, t.primary, t.secondary, t.playerLabel, t.enemyLabel].join('|');
  return `${genre}:${hashString(joined)}`;
}
