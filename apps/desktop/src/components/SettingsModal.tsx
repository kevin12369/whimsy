import { ThemePanel } from './ThemePanel';
import LocalProviderCard from './LocalProviderCard';
import type { Theme } from '../lib/theme';
import { X } from './icons';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  onThemeChange: (patch: Partial<Theme>) => void;
}

export function SettingsModal({ open, onClose, theme, onThemeChange }: SettingsModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      data-testid="settings-modal"
      onClick={onClose}
    >
      <div
        className="bg-surface-1 rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col border border-surface-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 h-11 border-b border-surface-border">
          <h2 className="text-[14px] font-semibold text-zinc-50" data-testid="settings-title">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="ml-auto w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-50 hover:bg-surface-hover transition-colors"
          >
            <X />
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col gap-3">
          <section className="rounded-lg border border-surface-border bg-surface-3 p-3">
            <ThemePanel theme={theme} onChange={onThemeChange} />
          </section>
          <LocalProviderCard onStatus={() => {}} />
        </div>
        <div className="px-4 h-9 border-t border-surface-border flex items-center text-[11px] text-zinc-500">
          All preferences persist to this browser only.
        </div>
      </div>
    </div>
  );
}
