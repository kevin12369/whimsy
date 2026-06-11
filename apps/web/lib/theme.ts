import { useState, useEffect, useCallback } from 'react';

export interface Theme {
  primary: string;       // hex color
  secondary: string;     // hex color
  playerLabel: string;
  enemyLabel: string;
  flavorText: string;
}

export const defaultTheme: Theme = {
  primary: '#3aa6ff',
  secondary: '#ffffff',
  playerLabel: 'player',
  enemyLabel: 'enemy',
  flavorText: '',
};

const STORAGE_KEY = 'whimsy:theme:v1';

function loadFromStorage(): Theme {
  if (typeof localStorage === 'undefined') return defaultTheme;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTheme;
    const parsed = JSON.parse(raw) as Partial<Theme>;
    return { ...defaultTheme, ...parsed };
  } catch {
    return defaultTheme;
  }
}

function saveToStorage(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Hydrate from localStorage on mount (client-side only).
  useEffect(() => {
    setThemeState(loadFromStorage());
  }, []);

  const setTheme = useCallback((patch: Partial<Theme>) => {
    setThemeState((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);
    saveToStorage(defaultTheme);
  }, []);

  return { theme, setTheme, resetTheme };
}
