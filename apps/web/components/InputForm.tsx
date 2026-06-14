import { useState } from 'react';
import { SAMPLE_PROMPTS } from '../data/sample-prompts';

export interface InputFormPayload {
  text: string;
  model?: 'ollama' | 'openai-compatible';
  localBaseUrl?: string;
  localModel?: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

export interface InputFormProps {
  onSubmit: (p: InputFormPayload) => Promise<void>;
  disabled?: boolean;
  defaultExpanded?: boolean;
  initialText?: string;
}

export function InputForm({ onSubmit, disabled, defaultExpanded = true, initialText }: InputFormProps) {
  const [open, setOpen] = useState<boolean>(defaultExpanded);
  const [text, setText] = useState<string>(initialText ?? '');
  const [busy, setBusy] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy || disabled) return;
    setBusy(true);
    try {
      const ls = typeof localStorage !== 'undefined' ? localStorage : null;
      const useLocal = ls?.getItem('whimsy:useLocal') === 'true';
      const provider = ls?.getItem('whimsy:local:provider');
      const payload: InputFormPayload = { text: text.trim() };
      if (useLocal && (provider === 'ollama' || provider === 'openai-compatible')) {
        payload.model = provider;
        const baseUrl = ls?.getItem('whimsy:local:baseUrl');
        if (baseUrl) payload.localBaseUrl = baseUrl;
        const lm = ls?.getItem('whimsy:local:model');
        if (lm) payload.localModel = lm;
        const key = ls?.getItem('whimsy:local:apiKey');
        if (key) payload.localApiKey = key;
        const t = ls?.getItem('whimsy:local:timeoutMs');
        if (t) payload.localTimeoutMs = Number(t);
      }
      await onSubmit(payload);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-2 w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">用本地模型生成(没装?看 README 5 分钟接入)</span>
        {!defaultExpanded && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Collapse generator' : 'Expand generator'}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {open ? '收起' : '展开'}
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setText(s.prompt)}
                aria-label={`Use sample: ${s.blurb}`}
                className="text-xs rounded-full border border-zinc-700 px-3 py-1 text-zinc-200 hover:text-white hover:border-zinc-500"
              >
                <span aria-hidden className="mr-1">{s.emoji}</span>
                {s.blurb}
              </button>
            ))}
          </div>

          <input
            id="gen-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Describe a game (e.g. "Mario but in space, I am a comet")'
            maxLength={500}
            className="rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
          />
          <button
            type="submit"
            disabled={busy || !text.trim() || disabled}
            aria-label="Generate"
            className="rounded-md bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 font-medium disabled:opacity-50"
          >
            {busy ? 'Generating…' : '用本地模型生成'}
          </button>
        </>
      )}
    </form>
  );
}