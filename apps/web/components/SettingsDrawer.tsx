import { useState } from 'react';

const MODELS = [
  { id: 'workers-ai-llama', label: 'Workers AI (free, simple games)' },
  { id: 'deepseek-coder-v2', label: 'DeepSeek-Coder V2 (recommended, ~free)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (free, good)' },
  { id: 'claude-sonnet-4', label: 'Claude Sonnet (BYOK, best)' },
] as const;

export interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const [model, setModel] = useState(localStorage.getItem('whimsy:model') ?? 'workers-ai-llama');
  const [apiKey, setApiKey] = useState(localStorage.getItem('whimsy:apikey') ?? '');

  function saveModel(v: string) { setModel(v); localStorage.setItem('whimsy:model', v); }
  function saveKey(v: string) { setApiKey(v); localStorage.setItem('whimsy:apikey', v); }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" role="dialog">
      <div className="bg-zinc-900 w-80 h-full p-4 flex flex-col gap-3 border-l border-zinc-800">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">Settings</h2>
          <button onClick={onClose} className="ml-auto text-zinc-400 hover:text-white">×</button>
        </div>
        <label className="text-sm text-zinc-300" htmlFor="model-sel">Model</label>
        <select id="model-sel" value={model} onChange={(e) => saveModel(e.target.value)}
          className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1">
          {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <label className="text-sm text-zinc-300" htmlFor="key-in">API key (only stored in this browser)</label>
        <input id="key-in" type="password" value={apiKey} onChange={(e) => saveKey(e.target.value)}
          className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1" />
        <p className="text-xs text-zinc-500 mt-2">Your key is never sent to our servers except as the X-Api-Key header for the chosen provider.</p>
      </div>
    </div>
  );
}
