import { SAMPLE_PROMPTS } from '../data/sample-prompts';

export interface TrySampleButtonProps {
  onSelect: (sampleId: string) => void;
}

export function TrySampleButton({ onSelect }: TrySampleButtonProps) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <span className="text-xs uppercase tracking-wide text-zinc-500">Try sample · 无需 LLM,直接玩</span>
      <div className="flex flex-wrap justify-center gap-2">
        {SAMPLE_PROMPTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-label={`Try sample: ${s.blurb}`}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full border border-emerald-700 bg-emerald-900/40 text-emerald-200 hover:bg-emerald-800/60 hover:text-white text-sm"
          >
            <span aria-hidden>{s.emoji}</span>
            <span>{s.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}