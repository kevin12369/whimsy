import React from 'react';
import { CopyButton } from './RunLocally/CopyButton';
import { CheckIcon, ArrowRightIcon } from './RunLocally/icons';

const COMMANDS = [
  'git clone https://github.com/kevin12369/whimsy.git',
  'cd whimsy && pnpm install',
  'pnpm dev:web',
];

const COMMAND_TEXT = COMMANDS.join('\n');

const REQUIREMENTS: Array<{ label: string; required: boolean; note?: string }> = [
  { label: 'Node.js 20+', required: true },
  { label: 'pnpm 9+', required: true },
  {
    label: 'Ollama / LM Studio / vLLM / llama.cpp — 离线 LLM',
    required: false,
    note: '不上 LLM 也能直接玩 3 套真模板,本节是给想跑 LLM 的人',
  },
  {
    label: '8GB+ 内存 — 加载本地 LLM 模型',
    required: false,
  },
];

/**
 * "本地跑 3 步搞定" — install + run + requirements section.
 *
 * Inverted zinc-900 background to break the rhythm between sections.
 * Two-column layout on md+: terminal block on the left, hard
 * requirements checklist on the right. Single column on mobile.
 * Bottom mini-CTA bar with two links.
 */
export function RunLocally() {
  return (
    <section
      className="bg-zinc-900 border-b border-zinc-800"
      aria-labelledby="run-locally-title"
      data-testid="run-locally"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="run-locally-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="run-locally-title"
          >
            本地跑 3 步搞定
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            不需要 API key,不需要云端配额,纯本地 — 不上 LLM 也能直接玩
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left: terminal block */}
          <div
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5"
            data-testid="run-locally-terminal-card"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">3 行命令</h3>
              <CopyButton
                value={COMMAND_TEXT}
                ariaLabel="Copy install commands"
                testId="run-locally-copy"
              />
            </div>
            <pre
              className="bg-black/70 border border-zinc-800 rounded p-4 overflow-x-auto"
              data-testid="run-locally-terminal"
            >
              <code className="font-mono text-sm text-zinc-200 leading-relaxed whitespace-pre">
                {COMMAND_TEXT}
              </code>
            </pre>
            <a
              href="https://github.com/kevin12369/whimsy/blob/main/RUN-LOCALLY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
              data-testid="run-locally-docs-link"
            >
              Read full RUN-LOCALLY.md
              <ArrowRightIcon />
            </a>
          </div>

          {/* Right: hard requirements */}
          <div
            className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-5"
            data-testid="run-locally-requirements"
          >
            <h3 className="text-sm font-semibold text-zinc-200">需要什么</h3>
            <ul className="flex flex-col gap-2" data-testid="run-locally-requirements-list">
              {REQUIREMENTS.map((r) => (
                <li
                  key={r.label}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                  data-testid="run-locally-requirement"
                >
                  <span
                    className={
                      r.required
                        ? 'text-emerald-400 mt-0.5'
                        : 'text-zinc-500 mt-0.5'
                    }
                    aria-hidden
                  >
                    <CheckIcon />
                  </span>
                  <span className="flex-1">
                    <span className="text-zinc-100">{r.label}</span>
                    {r.required ? (
                      <span className="ml-1 text-xs text-zinc-500">(必填)</span>
                    ) : (
                      <span className="ml-1 text-xs text-zinc-500">(可选)</span>
                    )}
                    {r.note ? (
                      <span className="block text-xs text-zinc-500 mt-0.5">{r.note}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom mini CTA bar */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3"
          data-testid="run-locally-cta"
        >
          <p className="text-sm text-zinc-300">
            4 分钟跑起来 — 我们做了所有优化
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/kevin12369/whimsy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-200 hover:text-zinc-50 inline-flex items-center gap-1"
              data-testid="run-locally-cta-gh"
            >
              View on GitHub
              <ArrowRightIcon />
            </a>
            <a
              href="https://github.com/kevin12369/whimsy/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
              data-testid="run-locally-cta-issue"
            >
              Report issue
              <ArrowRightIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RunLocally;
