import { useEffect, useState } from 'react';
import GamePreview from './components/GamePreview';
import InputForm from './components/InputForm';
import { AIStudioPanel } from './components/AIStudioPanel';
import LocalProviderCard, { type Status } from './components/LocalProviderCard';
import { TEMPLATES, getTemplate, defaultConfig } from '@whimsy/templates';

type DesignerMode = 'classic' | 'ai';

export default function App() {
  const [currentId, setCurrentId] = useState(TEMPLATES[0]!.id);
  const [overrideHtml, setOverrideHtml] = useState<string | null>(null);
  const [aiGameName, setAiGameName] = useState<string | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genResult, setGenResult] = useState<{ ok: boolean; bytes: number } | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [designerMode, setDesignerMode] = useState<DesignerMode>('ai');

  const current = getTemplate(currentId) ?? TEMPLATES[0]!;
  const previewHtml = overrideHtml ?? current.render(current.defaultTheme, defaultConfig());
  // Stable, collision-free key: template id + bytes of generated content
  // (per Phaser expert review: slice(0,50) is unsafe because templates share prefix).
  const previewKey = `${currentId}:${genResult?.bytes ?? 0}:${overrideHtml ? 'g' : 't'}`;

  async function onGenerate(p: {
    text: string; provider: 'ollama' | 'openai-compatible'; baseUrl: string; model: string; apiKey?: string; timeoutMs: number;
  }) {
    setGenBusy(true); setGenError(null); setGenResult(null);
    try {
      const html = await generateFromRust(p);
      setOverrideHtml(html);
      setGenResult({ ok: true, bytes: html.length });
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenBusy(false);
    }
  }

  function onAiGameReady(html: string, name: string) {
    setOverrideHtml(html);
    setAiGameName(name);
    setGenResult({ ok: true, bytes: html.length });
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <span className="text-lg font-semibold">Whimsy v3 — Tauri</span>
        <span className="ml-3 text-xs text-zinc-500">5 templates · local LLM · AI Studio</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setDesignerMode('ai')}
            className={`text-xs px-3 h-7 rounded ${designerMode === 'ai' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
            data-testid="mode-ai"
          >
            AI Studio
          </button>
          <button
            onClick={() => setDesignerMode('classic')}
            className={`text-xs px-3 h-7 rounded ${designerMode === 'classic' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
            data-testid="mode-classic"
          >
            Classic
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <section id="demo" className="h-[70vh] w-full bg-black relative">
          <GamePreview html={previewHtml} key={previewKey} />
          {aiGameName && (
            <div className="absolute top-2 left-2 text-xs text-zinc-400 bg-black/60 px-2 py-1 rounded" data-testid="ai-game-badge">
              AI: {aiGameName}
            </div>
          )}
        </section>
        {designerMode === 'ai' ? (
          <AIStudioPanel onGameReady={onAiGameReady} />
        ) : (
          <>
            <LocalProviderCard onStatus={setStatus} />
            <InputForm
              onSubmit={onGenerate}
              disabled={genBusy}
              detectedStatus={status}
            />
            {genError && <p className="text-red-400 px-4 py-2 text-sm">⚠ {genError}</p>}
            {genResult?.ok && (
              <p className="text-emerald-400 px-4 py-2 text-sm">✓ Generated {genResult.bytes} bytes.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

async function generateFromRust(p: {
  text: string; provider: 'ollama' | 'openai-compatible'; baseUrl: string; model: string; apiKey?: string; timeoutMs: number;
}): Promise<string> {
  // Per architect review: Rust API expects snake_case (base_url, api_key, timeout_ms).
  const resp = await fetch('http://localhost:1421/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: p.text,
      provider: p.provider,
      base_url: p.baseUrl,
      model: p.model,
      api_key: p.apiKey,
      timeout_ms: p.timeoutMs,
    }),
  });
  if (!resp.ok) throw new Error(`Rust API ${resp.status}: ${await resp.text()}`);
  const { config } = await resp.json();
  // current is in App scope, accessible via closure
  const tpl = getTemplate(config.type) ?? TEMPLATES[0]!;
  return tpl.render(tpl.defaultTheme, config);
}
