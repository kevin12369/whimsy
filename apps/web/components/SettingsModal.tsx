import { ThemePanel } from './ThemePanel';
import { LocalProviderCard } from './LocalProviderCard';
import type { Theme } from '../lib/theme';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (patch: Partial<Theme>) => void;
}

export function SettingsModal({ open, onClose, theme, onThemeChange }: SettingsModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-zinc-800">
        <div className="flex items-center px-4 py-3 border-b border-zinc-800">
          <h2 className="text-lg font-medium text-zinc-100">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="ml-auto text-zinc-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col gap-6">
          <section className="border border-zinc-800 rounded p-3">
            <ThemePanel theme={theme} onChange={onThemeChange} />
          </section>
          <section className="border border-zinc-800 rounded p-3">
            <LocalProviderCard />
          </section>
        </div>
        <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
          All preferences persist to this browser only.
        </div>
      </div>
    </div>
  );
}
