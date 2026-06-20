import { useState } from 'react';
import type { Status } from './LocalProviderCard';
import { Check, AlertTriangle } from './icons';

export interface InputFormPayload {
  text: string;
  provider: 'ollama' | 'openai-compatible';
  baseUrl: string;
  model: string;
  apiKey?: string;
  timeoutMs: number;
}

export default function InputForm({
  onSubmit, disabled, detectedStatus,
}: { onSubmit: (p: InputFormPayload) => void; disabled: boolean; detectedStatus: Status | null }) {
  const [text, setText] = useState('');
  // Per architect review: provider/baseUrl/model derived from detectedStatus
  // (LocalProviderCard polls Rust /api/status) — not hardcoded.
  const detected = detectedStatus;
  const provider: 'ollama' | 'openai-compatible' = detected?.ollama ? 'ollama' : 'openai-compatible';
  const baseUrl = detected?.ollama ? 'http://localhost:11434' : 'http://localhost:1234/v1';
  const model = detected?.ollama ? 'qwen2.5-coder:7b' : 'qwen2.5-coder-7b-instruct';
  const status: { kind: 'ok' | 'warn' | 'pending'; msg: string } =
    !detected
      ? { kind: 'pending', msg: 'checking...' }
      : detected.ollama || detected.lm_studio
      ? { kind: 'ok', msg: 'local LLM detected' }
      : { kind: 'warn', msg: 'no local LLM detected (default config)' };

  const disabledReason = disabled
    ? status.kind === 'pending'
      ? 'Checking local LLM...'
      : status.kind === 'warn'
      ? 'No local LLM detected. Start Ollama (ollama serve) or LM Studio, then click refresh.'
      : 'Already generating...'
    : null;

  return (
    <div className="px-4 py-3 border-t border-surface-border">
      <div className={`flex items-center gap-1.5 text-xs mb-2 ${
        status.kind === 'ok' ? 'text-success'
        : status.kind === 'warn' ? 'text-warn'
        : 'text-zinc-500'
      }`}>
        {status.kind === 'ok' && <Check />}
        {status.kind === 'warn' && <AlertTriangle />}
        {status.msg}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim() || disabled) return;
          onSubmit({ text: text.trim(), provider, baseUrl, model, timeoutMs: 120_000 });
        }}
        className="flex gap-2"
      >
        <input
          type="text" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Describe a game (e.g. side-scrolling platformer avoiding asteroids)"
          className="flex-1 bg-surface-3 border border-surface-border rounded px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
        />
        <button
          type="submit"
          disabled={disabled}
          title={disabledReason ?? undefined}
          className="bg-white text-zinc-950 hover:bg-zinc-200 font-medium px-4 py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {disabled ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
}
