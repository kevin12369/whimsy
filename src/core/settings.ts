import type { Mode } from './worldState';

export interface Settings {
  mode: Mode;
  showFps: boolean;
  sfxVolume: number;
}

export function defaultSettings(): Settings {
  return { mode: 'procgen', showFps: false, sfxVolume: 0.7 };
}

export function setMode(s: Settings, mode: Mode): Settings {
  // Phase 1 hard-locks to procgen; AI mode is wired in Phase 2.
  if (mode === 'ai') return s;
  return { ...s, mode };
}