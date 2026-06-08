# 一念成游 · Whimsy

> **一句话出 2D 小游戏 / One sentence → a playable 2D game**

输入 "超级马里奥但是太空版" → 浏览器里 15 秒后能玩。

*代码待写。This is a portfolio project for job applications; the implementation is forthcoming.*

---

## Why

Replit Agent / v0 演示里看到 LLM 写贪吃蛇:3 秒,一个非程序员能玩上自己想的版本。这件事值得做。

具体说:LLM 出 Phaser.js 单文件 HTML,沙箱里跑,玩家直接玩。**让人从"想玩游戏"到"玩上"只用一句话**。

---

## Stack

- Next.js 14(App Router, `output: 'export'`)
- Phaser 3(CDN 引入)
- Workers AI Llama 3.1 8B(默认,免费) / DeepSeek-Coder V2(几乎免费,质量好) / Claude Sonnet(BYOK)
- Cloudflare Pages + Workers + D1 + R2 + KV
- iframe `sandbox="allow-scripts"`(无 `allow-same-origin`)
- 5 套预生成 Phaser 模板(平台跳跃/射击/拼图/Snake/2048)做缓存兜底

---

## Architecture (planned)

```
Browser (input form)
  ↓ X-Model header + LLM key
Pages (Next.js)
  ↓ POST /api/generate
Worker (orchestrator)
  ├── Pre-check quota (KV)
  ├── Try LLM (model from X-Model)
  ├── If failed: retry (max 2)
  ├── Return HTML
  └── Cache key: genre+theme → KV
Browser (iframe sandbox)
  └── Phaser game runs
```

---

## Tradeoffs (real)

- **`output: 'export'` Next.js 静态导出会跟 Web Worker 路径打架。** `next.config.js` 加 `trailingSlash: true` 修。
- **`fireEvent.click(submitButton)` 在 happy-dom 下不触发 form submit。** 用 `fireEvent.submit(form)`。RHF + RTL 经典坑。
- **LLM 第一次生成 30% 跑不通。** "几乎对"是最大敌人。自迭代回路(沙箱跑 → 抛错 → 喂回 LLM 修)目标 80% 首跑成功。
- **沙箱逃逸是真实威胁。** `eval` / `Function()` / DOM API。纵深防御:静态分析 + CSP + iframe sandbox(no allow-same-origin)。
- **DeepSeek-Coder V2 几乎免费,质量比肩 Sonnet。** 默认 Workers AI 太弱,Sonnet 太贵,DeepSeek 是 sweet spot。

---

## Run

```bash
pnpm install
pnpm dev          # web :3000, worker :8787
```

---

## Known limitations

- No audio(纯画面)
- Keyboard only, no touch/mobile
- 2D only, no 3D
- Anonymous single-user(cookie UUID), no accounts
- 3 attempt max per generation

---

## Explicit non-goals

- No native mobile app
- No multiplayer
- No asset library(色块 + 文字)
- No narrative campaign
- No login/account system

---

## Cost

| Usage | Monthly |
|---|---|
| 100 generations/day | $0(Workers AI + template cache) |
| 1,000 generations/day | $5-15(DeepSeek fallback) |
| 10,000 generations/day | $50-150 |

---

## Status

- Design: [docs/design/2026-06-07-ai-2d-game-gen-design.md](../docs/design/2026-06-07-ai-2d-game-gen-design.md)
- Plan: [docs/plans/2026-06-07-whimsy-2d-game-gen-plan.md](../docs/plans/2026-06-07-whimsy-2d-game-gen-plan.md)
- Code: 0% — forthcoming
- Live URL: TBD
