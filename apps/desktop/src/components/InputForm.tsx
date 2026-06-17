import { useState, useEffect } from 'react';
import type { Status } from './LocalProviderCard';

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
  const status = detected ? (detected.ollama || detected.lm_studio ? '✓ local LLM detected' : '○ no local LLM detected (default config)') : '… checking';

  return (
    <div className="px-4 py-3 border-t border-zinc-800">
      <div className="text-xs text-zinc-400 mb-2">{status}</div>
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
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
        />
        <button type="submit" disabled={disabled}
          className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded text-sm disabled:opacity-50">
          {disabled ? 'Generating...' : 'Generate'}
        </button>
      </form>
    </div>
  );
}
