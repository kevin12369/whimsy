import type { Template } from '@whimsy/templates';

export interface TemplateGridProps {
  templates: Template[];
  currentId: string;
  onSelect: (id: string) => void;
}

export function TemplateGrid({ templates, currentId, onSelect }: TemplateGridProps) {
  const others = templates.filter((t) => t.id !== currentId);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 p-2">
      {others.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className="rounded border border-zinc-700 bg-zinc-900 p-2 text-left hover:border-zinc-500 transition-colors"
        >
          <div
            className="w-full h-20 rounded mb-1"
            style={{ background: t.defaultTheme.primary }}
            aria-hidden
          />
          <div className="text-xs font-medium text-zinc-100 truncate">{t.name}</div>
          <div className="text-[10px] text-zinc-500 uppercase">{t.genre}</div>
        </button>
      ))}
    </div>
  );
}
