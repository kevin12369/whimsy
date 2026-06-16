import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { GamePreview } from '../components/GamePreview';
import { TemplateGrid } from '../components/TemplateGrid';
import { SettingsModal } from '../components/SettingsModal';
import { InputForm } from '../components/InputForm';
import { CopyShareLinkButton } from '../components/CopyShareLinkButton';
import { GamePreviewToolbar } from '../components/GamePreviewToolbar';
import { Hero } from '../components/Hero';
import { StatusBadges } from '../components/StatusBadges';
import { Features } from '../components/Features';
import { BeforeAfter } from '../components/BeforeAfter';
import { WhoIsItFor } from '../components/WhoIsItFor';
import { RunLocally } from '../components/RunLocally';
import { FAQ } from '../components/FAQ';
import { Roadmap } from '../components/Roadmap';
import { Footer } from '../components/Footer';
import { useTheme } from '../lib/theme';
import { generateWithLocalLLM, type GenerateResult } from '../lib/llm-direct';
import { TEMPLATES, getTemplate, getAllTemplates } from '@whimsy/templates';
import { encodeShareUrl, saveShare, shareUrlBytes, isOversize } from '../lib/share';
import { SAMPLE_PROMPTS, getSampleGame } from '../data/sample-prompts';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [currentId, setCurrentId] = useState(TEMPLATES[0]!.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [genResult, setGenResult] = useState<GenerateResult | null>(null);
  const [genBusy, setGenBusy] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  const [sampleHtml, setSampleHtml] = useState<string | null>(null);
  const [sampleName, setSampleName] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [overrideHtml, setOverrideHtml] = useState<string | null>(null);

  // Listen for edit-and-regenerate override from GamePreviewToolbar.
  useEffect(() => {
    function onOverride(ev: Event) {
      const e = ev as CustomEvent<string>;
      setOverrideHtml(e.detail);
    }
    window.addEventListener('whimsy:preview-override', onOverride as EventListener);
    return () => window.removeEventListener('whimsy:preview-override', onOverride as EventListener);
  }, []);

  const current = useMemo(() => getTemplate(currentId) ?? TEMPLATES[0]!, [currentId]);
  const allByGenre = useMemo(() => getAllTemplates(), []);

  // Flatten all 15 templates into one array for the grid (order: platformer, shooter, puzzle).
  const allTemplates = useMemo(
    () => [...allByGenre.platformer, ...allByGenre.shooter, ...allByGenre.puzzle],
    [allByGenre],
  );

  const previewHtml = overrideHtml ?? sampleHtml ?? current.render(theme);
  const previewTitle = sampleName ?? current.name;
  const previewTemplateId = sampleHtml ? currentId : currentId;

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
      // Pipe the generated HTML into the GamePreview iframe (overrideHtml).
      if (r.ok && r.html) {
        const extracted = r.html.length > 4096 ? r.html : r.html;
        setOverrideHtml(extracted);
        setSampleName(`Generated: ${p.text.slice(0, 40)}…`);
      }
      // Try to also build a share URL for the current view
      try {
        const html = r.ok && r.html ? r.html : current.render(theme);
        const url = encodeShareUrl(html);
        if (isOversize(url)) {
          const id = `gen-${Date.now().toString(36)}`;
          const long = await saveShare(id, html);
          setShareUrl(long);
        } else {
          setShareUrl(url);
        }
      } catch {
        setShareUrl('');
      }
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenBusy(false);
    }
  }

  function handleSample(promptId: string) {
    const game = getSampleGame(promptId);
    if (!game) return;
    setSampleHtml(game.html);
    setSampleName(game.name);
    setCurrentId(game.templateId);
    setShareUrl(encodeShareUrl(game.html));
    setOverrideHtml(null);
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <span className="text-lg font-semibold" data-testid="brand-name">Whimsy — 一念成游</span>
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
            aria-label={showGenerator ? 'Hide generator' : 'Show generator'}
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded px-2 py-1"
          >
            {showGenerator ? 'Hide generator' : 'Show generator'}
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
        {/* Hero section: tagline + sub + 2 CTAs (Whimsy v2 final stage) */}
        <Hero />

        {/* Status badges: 8 shields.io row */}
        <StatusBadges />

        {/* Big preview: 70vh, fills the page */}
        <section id="demo" className="h-[70vh] w-full bg-black">
          {overrideHtml && !overrideHtml.trim().toLowerCase().endsWith('</html>') ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 p-6 text-center">
              <p className="text-amber-400 font-medium">Generated HTML appears truncated (no closing &lt;/html&gt; tag).</p>
              <p className="text-xs text-zinc-500 mt-2">The LLM response hit its token limit before completing the game. Try a simpler prompt, or use a smaller/faster model.</p>
              <button
                type="button"
                onClick={() => { setOverrideHtml(null); setGenResult(null); }}
                className="mt-4 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1 text-sm"
              >Dismiss</button>
            </div>
          ) : (
            <iframe
              key={previewTemplateId + (sampleHtml ? ':sample' : ':template') + (overrideHtml ? ':override' : '')}
              title={previewTitle}
              srcDoc={previewHtml}
              sandbox="allow-scripts"
              className="w-full h-full bg-black border-0"
            />
          )}
        </section>

        {/* Export toolbar (PR-3: Copy / Export / Edit) */}
        <GamePreviewToolbar
          html={previewHtml}
          theme={theme}
          templateName={previewTitle}
        />

        {/* Share row */}
        {shareUrl && (
          <section className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
            <span className="text-xs text-zinc-400">Share this view</span>
            <CopyShareLinkButton url={shareUrl} />
            <span className="text-[10px] text-zinc-500">{shareUrlBytes(shareUrl)} bytes</span>
            <a className="text-[10px] text-zinc-500 underline ml-auto" href={`/g/?${shareUrl.split('?').slice(1).join('?')}`}>open in /g/</a>
          </section>
        )}

        {/* Generator panel (PR #5: defaultExpanded) */}
        {showGenerator && (
          <section id="generator" className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
            <InputForm onSubmit={onGenerate} disabled={genBusy} defaultExpanded />
            {genError && <p className="mt-2 text-xs text-red-300">⚠ {genError}</p>}
            {genResult?.ok && (
              <p className="mt-2 text-xs text-emerald-300">✓ Generated {genResult.bytes} bytes. Now playing in the preview above. Use the share button to copy a URL.</p>
            )}
            <p className="mt-3 text-[10px] text-zinc-500">
              Try one of these prompts above: {SAMPLE_PROMPTS.map((s) => s.blurb).join(' · ')}
            </p>
          </section>
        )}

        {/* 14 thumbnails strip */}
        <section className="border-t border-zinc-800">
          <h2 className="text-xs uppercase text-zinc-500 px-3 pt-2">Other templates</h2>
          <TemplateGrid templates={allTemplates} currentId={currentId} onSelect={(id) => {
            setCurrentId(id);
            setSampleHtml(null);
            setSampleName(null);
            setOverrideHtml(null);
          }} />
        </section>

        {/* 8 Whimsy v2 marketing sections (final stage) */}
        <Features />
        <BeforeAfter />
        <WhoIsItFor />
        <RunLocally />
        <FAQ />
        <Roadmap />
      </main>

      <Footer />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
}