import React from 'react';

/**
 * "v1 之前 vs v2 现在" before/after comparison.
 *
 * Two-column layout on md+: a Before column (12/15 templates were
 * spread clones of the same platformer scaffold) and an After column
 * (15 templates, mechanics-distinct — hooks / double-jump / bouncy /
 * timer / multi-stage).
 */
export function BeforeAfter() {
  return (
    <section
      className="bg-zinc-950 border-b border-zinc-800"
      aria-labelledby="before-after-title"
      data-testid="before-after"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="before-after-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="before-after-title"
          >
            v1 之前 vs v2 现在
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            不是把 spread 克隆换 5 套皮肤就交差 — Whimsy v2 沙盒字节级独立
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Before */}
          <div
            className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
            data-testid="before-after-before"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
              <span className="bg-zinc-800 px-2 py-0.5 rounded" data-testid="before-after-before-label">
                Before (v1)
              </span>
              <span data-testid="before-after-before-caption">未修整前</span>
            </div>
            <div className="bg-zinc-950/60 rounded p-4 border border-zinc-800/60">
              <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5" data-testid="before-after-before-list">
                <li>12/15 模板是同一个 platformer 骨架的 spread 克隆</li>
                <li>换皮肤换色号 = 换 5 套,机制零差异</li>
                <li>LLM 输出无沙盒验证,直接 eval / Function</li>
                <li>分享靠全页 URL,接收方离线打不开</li>
              </ul>
            </div>
            <p className="text-xs text-zinc-500 font-mono" data-testid="before-after-before-meta">
              评测者 30 秒内能看出 3 套是同一个
            </p>
          </div>

          {/* After */}
          <div
            className="flex flex-col gap-4 rounded-xl border border-emerald-700/40 bg-emerald-950/10 p-5"
            data-testid="before-after-after"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-400">
              <span className="bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/40" data-testid="before-after-after-label">
                After (v2)
              </span>
              <span data-testid="before-after-after-caption">已修整</span>
            </div>
            <div className="bg-zinc-950/60 rounded p-4 border border-emerald-800/40">
              <ul className="text-sm text-zinc-300 space-y-2 list-disc pl-5" data-testid="before-after-after-list">
                <li>5 平台跳跃 / 5 射击 / 5 解谜,机制各异</li>
                <li>钩爪 / 二段跳 / 反弹 / 计时 / 多 stage 进度,字节级独立</li>
                <li>12 API 黑名单 + 200KB 体积 + iframe sandbox 三道闸门</li>
                <li>/g/[id] URL hash 分享,IndexedDB 备份</li>
              </ul>
            </div>
            <p className="text-xs text-zinc-500 font-mono" data-testid="before-after-after-meta">
              沙盒验证 + CSP + 字节级独立
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeforeAfter;
