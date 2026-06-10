export interface Usage {
  workers_ai: number;
  deepseek: number;
  gemini: number;
  byok: number;
  generations: number;
  retries: number;
}

export interface StatusBarProps {
  usage: Usage;
}

export function StatusBar({ usage }: StatusBarProps) {
  return (
    <div className="text-xs text-zinc-500 px-4 py-1 border-t border-zinc-800">
      Today: Workers AI {usage.workers_ai}/10000 · DeepSeek {usage.deepseek}/200 · Gemini {usage.gemini}/60 · Games: {usage.generations} · Retries: {usage.retries}
    </div>
  );
}
