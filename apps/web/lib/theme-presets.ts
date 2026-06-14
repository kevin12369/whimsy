import type { Theme } from './theme';

const STORAGE_KEY = 'whimsy:theme-presets:v1';

export interface ThemePreset {
  id: string;
  name: string;
  theme: Theme;
  createdAt: number;
}

function safeStorage(): Storage | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

function readAll(): ThemePreset[] {
  const storage = safeStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is ThemePreset =>
        !!p &&
        typeof p === 'object' &&
        typeof (p as ThemePreset).id === 'string' &&
        typeof (p as ThemePreset).name === 'string' &&
        typeof (p as ThemePreset).createdAt === 'number' &&
        typeof (p as ThemePreset).theme === 'object',
    );
  } catch {
    return [];
  }
}

function writeAll(presets: ThemePreset[]): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function loadPresets(): ThemePreset[] {
  return readAll().sort((a, b) => b.createdAt - a.createdAt);
}

export function savePreset(name: string, theme: Theme): ThemePreset {
  const trimmed = name.trim() || `Preset ${new Date().toLocaleDateString()}`;
  const preset: ThemePreset = {
    id: `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed.slice(0, 40),
    theme: { ...theme },
    createdAt: Date.now(),
  };
  const all = readAll();
  all.push(preset);
  writeAll(all);
  return preset;
}

export function deletePreset(id: string): void {
  const all = readAll().filter((p) => p.id !== id);
  writeAll(all);
}

// Fragment injected into the next LLM generation prompt so the model respects
// the saved theme style instead of reverting to the template default.
export function presetToPromptFragment(preset: ThemePreset): string {
  return `\n\n[用户预设主题] name="${preset.name}" primary=${preset.theme.primary} secondary=${preset.theme.secondary} playerLabel="${preset.theme.playerLabel}" enemyLabel="${preset.theme.enemyLabel}"`;
}