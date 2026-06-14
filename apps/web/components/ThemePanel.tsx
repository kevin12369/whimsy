import { useEffect, useState } from 'react';
import type { Theme } from '../lib/theme';
import { defaultTheme } from '../lib/theme';
import {
  loadPresets,
  savePreset,
  deletePreset,
  type ThemePreset,
} from '../lib/theme-presets';

export interface ThemePanelProps {
  theme: Theme;
  onChange: (patch: Partial<Theme>) => void;
}

export function ThemePanel({ theme, onChange }: ThemePanelProps) {
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  function refresh() {
    setPresets(loadPresets());
  }

  function handleSave() {
    const name = presetName.trim() || `Preset ${new Date().toLocaleDateString()}`;
    savePreset(name, theme);
    setPresetName('');
    refresh();
  }

  function handleLoad(id: string) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    onChange(p.theme);
  }

  function handleDelete(id: string) {
    deletePreset(id);
    refresh();
  }

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

      {/* Preset save / load */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-col gap-2">
        <h4 className="text-xs uppercase text-zinc-500">Theme presets</h4>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name"
            className="flex-1 rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-xs"
            maxLength={40}
            aria-label="New preset name"
          />
          <button
            type="button"
            onClick={handleSave}
            className="text-xs rounded bg-emerald-700 hover:bg-emerald-600 text-zinc-100 px-3 py-1"
          >
            Save as preset
          </button>
        </div>

        {presets.length === 0 ? (
          <p className="text-[11px] text-zinc-500">No saved presets yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {presets.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded bg-zinc-800/60 border border-zinc-700 px-2 py-1"
              >
                <span
                  className="inline-block w-4 h-4 rounded border border-zinc-600"
                  style={{ background: p.theme.primary }}
                  aria-hidden
                />
                <span className="flex-1 text-xs text-zinc-100 truncate">{p.name}</span>
                <button
                  type="button"
                  onClick={() => handleLoad(p.id)}
                  className="text-[11px] rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-2 py-0.5"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-[11px] rounded bg-zinc-800 hover:bg-red-900 text-zinc-300 px-2 py-0.5"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}