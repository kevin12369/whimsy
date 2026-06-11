import type { Theme } from '../lib/theme';
import { defaultTheme } from '../lib/theme';

export interface ThemePanelProps {
  theme: Theme;
  onChange: (patch: Partial<Theme>) => void;
}

export function ThemePanel({ theme, onChange }: ThemePanelProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <h3 className="font-medium text-zinc-200">Theme</h3>
      <p className="text-xs text-zinc-500">Customize colors and labels for the current game.</p>

      <label className="text-zinc-300" htmlFor="theme-primary">Primary color</label>
      <div className="flex items-center gap-2">
        <input
          id="theme-primary"
          type="text"
          value={theme.primary}
          onChange={(e) => onChange({ primary: e.target.value })}
          className="flex-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs"
        />
        <input
          type="color"
          aria-label="Color swatch"
          value={theme.primary}
          onChange={(e) => onChange({ primary: e.target.value })}
          className="w-10 h-8 rounded bg-zinc-800 border border-zinc-700"
        />
      </div>

      <label className="text-zinc-300" htmlFor="theme-secondary">Secondary color</label>
      <div className="flex items-center gap-2">
        <input
          id="theme-secondary"
          type="text"
          value={theme.secondary}
          onChange={(e) => onChange({ secondary: e.target.value })}
          className="flex-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs"
        />
        <input
          type="color"
          aria-label="Color swatch"
          value={theme.secondary}
          onChange={(e) => onChange({ secondary: e.target.value })}
          className="w-10 h-8 rounded bg-zinc-800 border border-zinc-700"
        />
      </div>

      <label className="text-zinc-300" htmlFor="theme-player">Player label</label>
      <input
        id="theme-player"
        type="text"
        value={theme.playerLabel}
        onChange={(e) => onChange({ playerLabel: e.target.value })}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1"
      />

      <label className="text-zinc-300" htmlFor="theme-enemy">Enemy label</label>
      <input
        id="theme-enemy"
        type="text"
        value={theme.enemyLabel}
        onChange={(e) => onChange({ enemyLabel: e.target.value })}
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1"
      />

      <label className="text-zinc-300" htmlFor="theme-flavor">Flavor text (optional)</label>
      <input
        id="theme-flavor"
        type="text"
        value={theme.flavorText}
        onChange={(e) => onChange({ flavorText: e.target.value })}
        placeholder="e.g. A brave comet in deep space"
        className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1"
        maxLength={80}
      />

      <button
        type="button"
        onClick={() => onChange(defaultTheme)}
        className="mt-2 self-start rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1 text-xs"
      >
        Reset to default
      </button>
    </div>
  );
}
