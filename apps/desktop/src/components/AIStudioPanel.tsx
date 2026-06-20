// AIStudioPanel — 3-mode AI-driven game design.
// Phase 1: User types prompt → Concept Designer returns 3 GameSpec candidates.
// Phase 2: User picks one → SpecCompiler + v3 buildHtml() produces playable HTML.
// Phase 3: Parent App.tsx renders the HTML in GamePreview (existing iframe flow).
//
// v3 path: we use sideScrollerComet.render(theme, cfg) which returns Phaser HTML.
// This is the minimal integration that ships today; v4 Kaplay path is future work.

import { useState } from 'react';
import { designConcepts } from '@whimsy/agents';
import { isOllamaAvailable } from '@whimsy/lib';
import { compileSpec, type GameSpec } from '@whimsy/runtime';
import { sideScrollerComet, clampConfig } from '@whimsy/templates';
import { RefreshCw as RefreshIcon } from './icons';

export interface AIStudioPanelProps {
  /** Called when user picks a candidate and we have the compiled HTML. */
  onGameReady: (html: string, name: string) => void;
}

interface CompiledCandidate {
  spec: GameSpec;
  html: string;
}

export function AIStudioPanel({ onGameReady }: AIStudioPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [candidates, setCandidates] = useState<GameSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ kind: 'transient' | 'permanent'; msg: string } | null>(null);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [compilingIdx, setCompilingIdx] = useState<number | null>(null);

  async function checkOllama() {
    setOllamaOk(await isOllamaAvailable());
  }

  async function handleDesign() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setCandidates([]);
    try {
      const specs = await designConcepts(prompt);
      setCandidates(specs);
    } catch (e) {
      const msg = (e as Error).message;
      const isPermanent = /ollama|ECONNREFUSED|fetch failed|not running/i.test(msg);
      setError({ kind: isPermanent ? 'permanent' : 'transient', msg });
    } finally {
      setLoading(false);
    }
  }

  function compileAndSelect(idx: number) {
    setCompilingIdx(idx);
    try {
      const spec = candidates[idx]!;
      const { config } = compileSpec(spec);
      // v3 buildHtml takes (theme, cfg)
      const theme = {
        primary: spec.art.palette.primary,
        secondary: spec.art.palette.secondary,
        playerLabel: spec.meta.name,
        enemyLabel: 'asteroid',
        flavorText: spec.meta.flavor,
      };
      // v3 GameConfig requires all theme strings; runtime's GameConfig has them optional.
      // We build a fully-populated config that satisfies v3's required fields.
      const v3Config = clampConfig({
        type: 'sideScroller',
        primary: spec.art.palette.primary,
        secondary: spec.art.palette.secondary,
        enemyColor: spec.art.palette.enemy,
        playerLabel: spec.meta.name,
        enemyLabel: 'asteroid',
        playerSpeed: spec.mechanics.moveSpeed,
        jumpVelocity: spec.mechanics.jumpVelocity,
        gravity: spec.mechanics.gravity,
        enemyCount: spec.level.enemyCount,
        enemySpeed: spec.mechanics.enemySpeed,
      });
      const html = sideScrollerComet.render(theme, v3Config);
      onGameReady(html, spec.meta.name);
    } catch (e) {
      const msg = (e as Error).message;
      setError({ kind: 'permanent', msg: `Compile failed: ${msg}` });
    } finally {
      setCompilingIdx(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3" data-testid="ai-studio-panel">
      <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
        AI Studio
      </div>

      {ollamaOk === null && (
        <button
          onClick={checkOllama}
          className="text-xs text-zinc-400 hover:text-zinc-100 text-left"
          data-testid="ai-studio-check-ollama"
        >
          Check Ollama status →
        </button>
      )}
      {ollamaOk === false && (
        <div className="text-xs text-red-400" data-testid="ai-studio-ollama-missing">
          Ollama not running. Start it: <code>ollama serve</code>
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe a game...&#10;e.g. A 2D space platformer where I play a comet avoiding asteroids"
        rows={3}
        disabled={ollamaOk === false}
        className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none disabled:opacity-50"
        data-testid="ai-studio-prompt"
      />

      <button
        onClick={handleDesign}
        disabled={loading || !prompt.trim() || ollamaOk === false}
        className="text-sm h-9 px-3 rounded bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        data-testid="ai-studio-design"
      >
        {loading ? 'Designing…' : 'Design 3 concepts'}
      </button>

      {error && (
        <div
          className={`flex items-start gap-1.5 text-xs p-2 rounded ${
            error.kind === 'permanent'
              ? 'text-danger bg-danger/5 border border-danger/20'
              : 'text-warn bg-warn/5 border border-warn/20'
          }`}
          data-testid="ai-studio-error"
          role="alert"
          aria-live="polite"
        >
          <span className="flex-1">{error.msg}</span>
          {error.kind === 'transient' && (
            <button
              type="button"
              onClick={handleDesign}
              className="flex items-center gap-1 text-zinc-300 hover:text-zinc-50 shrink-0"
              data-testid="ai-studio-retry"
            >
              <RefreshIcon size={11} /> Retry
            </button>
          )}
        </div>
      )}

      {candidates.length > 0 && (
        <div className="flex flex-col gap-2 mt-2" data-testid="ai-studio-candidates">
          <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">
            Candidates ({candidates.length})
          </div>
          {candidates.map((spec, idx) => (
            <button
              key={idx}
              onClick={() => compileAndSelect(idx)}
              disabled={compilingIdx !== null}
              className="text-left rounded-lg border border-zinc-700 bg-zinc-800 p-2.5 hover:border-zinc-500 transition-colors disabled:opacity-50"
              data-testid={`ai-studio-candidate-${idx}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-zinc-50">{spec.meta.name}</div>
                <div className="text-[10px] text-zinc-500 uppercase">{spec.level.concept}</div>
              </div>
              <div className="text-xs text-zinc-400 line-clamp-2 mb-1.5">{spec.meta.flavor}</div>
              <div className="flex items-center gap-1.5">
                <ColorSwatch color={spec.art.palette.primary} />
                <ColorSwatch color={spec.art.palette.enemy} />
                <ColorSwatch color={spec.art.palette.bg} />
                <div className="text-[10px] text-zinc-500 ml-auto">
                  {spec.level.enemyCount} enemies · {spec.level.starCount} stars
                </div>
              </div>
              {compilingIdx === idx && (
                <div className="text-[10px] text-blue-400 mt-1">Compiling…</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <div
      className="w-3 h-3 rounded border border-zinc-700"
      style={{ backgroundColor: color }}
      title={color}
    />
  );
}
