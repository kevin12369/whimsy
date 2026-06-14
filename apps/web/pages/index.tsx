import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GamePreview } from '../components/GamePreview';
import { TemplateGrid } from '../components/TemplateGrid';
import { SettingsModal } from '../components/SettingsModal';
import { InputForm } from '../components/InputForm';
import { useTheme } from '../lib/theme';
import { generateWithLocalLLM, type GenerateResult } from '../lib/llm-direct';
import { TEMPLATES, getTemplate, getAllTemplates } from '@whimsy/templates';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [currentId, setCurrentId] = useState(TEMPLATES[0]!.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genResult, setGenResult] = useState<GenerateResult | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const current = useMemo(() => getTemplate(currentId) ?? TEMPLATES[0]!, [currentId]);
  const allByGenre = useMemo(() => getAllTemplates(), []);

  // Flatten all 15 templates into one array for the grid (order: platformer, shooter, puzzle).
  const allTemplates = useMemo(
    () => [...allByGenre.platformer, ...allByGenre.shooter, ...allByGenre.puzzle],
    [allByGenre],
  );

  async function onGenerate(p: { text: string; model?: 'ollama' | 'openai-compatible'; localBaseUrl?: string; localModel?: string; localApiKey?: string; localTimeoutMs?: number }) {
    if (!p.model) {
      setGenError('Toggle "Use local LLM" in Settings → Local LLM, then try again.');
      return;
    }
    setGenBusy(true);
    setGenError(null);
    setGenResult(null);
    try {
      const r = await generateWithLocalLLM(p);
      setGenResult(r);
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <h1 className="text-lg font-semibold">Whimsy — 一念成游</h1>
        <span className="ml-3 text-xs text-zinc-500">15 pre-baked Phaser 3 games · theme live</span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/portfolio"
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded px-2 py-1"
          >
            About
          </Link>
          <button
            type="button"
            onClick={() => setShowGenerator((v) => !v)}
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded px-2 py-1"
          >
            {showGenerator ? 'Hide generator' : 'Generate (local LLM)'}
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="text-sm text-zinc-300 hover:text-white"
          >
            ⚙
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero: tagline + subtitle + pain point + 2 CTA (PR #1) */}
        <section id="hero" className="px-4 py-12 text-center border-b border-zinc-800 bg-zinc-950">
          <h1 className="text-5xl font-bold tracking-tight">一句话开 game jam</h1>
          <p className="text-xl text-zinc-300 mt-4 max-w-2xl mx-auto">
            30 秒拿 5 个 Phaser 变体,挑一个导出源码接着改 — 不装 LLM 也能直接玩 3 套真模板
          </p>
          <p className="text-base text-zinc-400 mt-3 max-w-2xl mx-auto">
            已经有想法,但 30 秒写不出 boilerplate?让 AI 试错 5 个变体,挑一个手改
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="#demo"
              className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-lg animate-pulse"
            >
              Try sample(无门槛)
            </a>
            <a
              href="#demo"
              className="inline-block px-6 py-3 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 rounded-lg"
            >
              看 30s 录屏
            </a>
          </div>
        </section>

        {/* Big preview: 70vh, fills the page */}
        <section id="demo" className="h-[70vh] w-full bg-black">
          <GamePreview template={current} theme={theme} />
        </section>

        {/* Optional generator panel (collapsed by default) */}
        {showGenerator && (
          <section className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <InputForm onSubmit={onGenerate} disabled={genBusy} />
            {genError && <p className="mt-2 text-xs text-red-300">⚠ {genError}</p>}
            {genResult?.ok && (
              <p className="mt-2 text-xs text-emerald-300">✓ Generated {genResult.bytes} bytes. (Preview-only on GitHub Pages — paste the HTML into a local file to play.)</p>
            )}
          </section>
        )}

        {/* 14 thumbnails strip */}
        <section className="border-t border-zinc-800">
          <h2 className="text-xs uppercase text-zinc-500 px-3 pt-2">Other templates</h2>
          <TemplateGrid templates={allTemplates} currentId={currentId} onSelect={setCurrentId} />
        </section>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}
