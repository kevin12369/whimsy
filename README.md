# 一念成游 · Whimsy

> **一句话生成一个可玩的、可分享的 2D 小游戏。/ One sentence to a playable 2D game.**

[![Status](https://img.shields.io/badge/status-MVP_shipped-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)
[![Stack](https://img.shields.io/badge/stack-Cloudflare_Workers-F38020?logo=cloudflare)](#)
[![Tests](https://img.shields.io/badge/tests-164_passing-brightgreen)](#)

---

## 这个想法

你脑子里闪过一个游戏画面:"像超级马里奥那样,但主角是颗彗星,在太空里躲小行星"。**可惜你不会写代码,也没时间学 Phaser**——这个想法三分钟后就被忘了。

**让 AI 在 15 秒内给你一个真的能玩的小游戏**。你描述玩法,Whimsy 调 LLM 生成 HTML + Phaser 3 代码,经静态分析 + 沙盒校验后丢进 iframe,URL 一复制就能发给朋友。

> 不替你做游戏设计——**只帮你把脑子里的画面变成可玩的 demo,设计师/学习/分享的事还是你来做**。

---

## 这件事有意思在哪

**LLM 写完整可玩游戏是个硬需求,但 AI 之前没人认真做过**。市面上有"AI 代码助手"但都是通用补全——没人**专门**研究"怎么把 LLM 输出限制在一个能跑、安全、不超 200KB 的 HTML iframe 里"。

更细的:**纵深防御**让生成的内容既能跑又跑不坏用户——服务端做静态黑名单(拦截 `eval`/`fetch`/`localStorage` 等),Worker 设 CSP,iframe 用 `sandbox="allow-scripts"`(没有 `allow-same-origin`)。LLM 输出先在 Worker 端校验再下发,**永不直发**。

**自迭代状态机**让"生成的代码不工作"也能在 15 秒内自动修好——最多 2 轮重试,每轮把"哪里出错"塞回 prompt 让 LLM 改。如果还是不行,**模板兜底**直接给一份预制的同类游戏。

---

## 想要实现的样子

- 用户在表单填"我想玩什么游戏" → 15 秒后右侧 iframe 真在跑 Phaser 3
- 主题色/玩家/敌人标签可在生成前调整 → LLM prompt 跟着变
- 15 套预制模板(5 平台跳跃 + 5 射击 + 5 解谜),无 LLM 调用 0 成本兜底
- 一键分享:游戏 HTML 存 R2,给你一个 `/g/<id>` 短链
- 历史侧边栏:你生成过的所有游戏都在
- BYOK(自带 API 钥):Workers AI 免费额度用完了,接 DeepSeek/Gemini/Anthropic 自己的 key
- 伦理/成本护栏常驻顶部:"不替你做游戏设计,只帮你起 demo"

---

## 未来可能拓展成什么

- 多人协作:同一个游戏 id 可以多人玩(打分/排行)
- 多语言 prompt:中文 / 英文 / 日文 prompt 模板
- 移动端触屏支持:Phaser 触屏输入 + 摇杆
- 排行榜:R2 + D1 存每局最高分
- AI 教学模式:告诉用户"为什么这版比上一版好",加教育价值

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 前端 | Next.js 14 (Pages Router, `output: 'export'`) |
| 后端 | Cloudflare Workers + Hono |
| 数据库 | Cloudflare D1 (SQLite,游戏历史) + R2 (游戏 HTML 产物) |
| 配额 | Cloudflare KV (per-IP 配额计数) |
| LLM | Workers AI Llama 3.1 8B(默认,免费)/ DeepSeek / Gemini / Anthropic(BYOK) |
| Prompt 模板 | 纯 TS 构建器(无 LLM 依赖),`buildPrompt` + 5 风格子 prompt |
| 沙盒 | 静态黑名单(11 个危险 API) + 体积校验(≤200 KB) + 提取 HTML + CSP |
| 重试 | 自迭代状态机,最多 2 轮,失败用模板兜底 |
| 模板 | 15 套预制 HTML 游戏,主题色注入 |

---

## To-do

- [x] 写 `packages/prompt`(纯 TS prompt 构建器)
- [x] 写 `packages/sandbox`(提取 HTML + 黑名单 + 体积校验 + iframe 协议)
- [x] 写 `packages/llm`(4 个 provider + 模型路由 + 错误分类)
- [x] 写 `packages/retry`(自迭代状态机,最多 2 轮)
- [x] 写 `packages/templates`(15 套预制游戏 + 主题注入 + cache key)
- [x] 写 `apps/worker`(Hono 路由 + D1 + R2 + KV + orchestrator)
- [x] 写 `apps/web`(Next.js 14 + 表单 + iframe + 历史侧边栏 + 设置抽屉)
- [x] 写 Pages Functions 代理(`/api/*` → Worker)
- [x] 写 Playwright E2E(happy path + retry path)
- [x] 写 LLM_KILL_SWITCH 模板兜底
- [x] 写 README polish

---

## 欢迎词

开源 + 公开 portfolio。

如果你:

- 试用了,生成出来的游戏根本不能玩 → 提 issue,贴 prompt + 输出片段,我重写 sandbox 规则
- 5 套模板区分度不够(平台跳跃看着像射击) → 提 issue,带 "template" 标签,**重点讨论**
- 发现了沙盒漏过的危险 API → 提 issue,标 "sandbox",**优先修**
- 想加新模板(赛车 / 卡牌 / Roguelike)→ 提 PR,附 `Template` 实现
- 想加新 LLM provider(OpenAI / Mistral / Ollama)→ 提 PR
- 想加新 genre → 提 PR,附 genre 子 prompt
- 真人,想给作者说"加油" → 提 issue 带 "encouragement" 标签,我收

提交 issue:[github.com/kevin12369/whimsy/issues](https://github.com/kevin12369/whimsy/issues)
发邮件:491750329@qq.com

### 特别欢迎

- LLM 安全研究者(帮我看 11 个 API 黑名单够不够)
- 游戏设计师(帮我看 15 套模板的可玩性)
- TypeScript 包架构师(帮我看 pnpm workspace 拆分)
- 中文 NLP 研究者(中文游戏描述的 prompt 表达)

---

## 项目亮点

**做了什么**

- 5 个 pure-TS package(prompt/sandbox/llm/retry/templates)+ 2 个 app(web/worker),pnpm workspace 管理
- 15 套预制 HTML 游戏模板(5 平台跳跃 + 5 射击 + 5 解谜),Phaser 3.70.0 CDN 固定,主题色注入
- 纵深防御沙盒:11 个危险 API 静态黑名单(`eval`/`fetch`/`localStorage`/`XMLHttpRequest`/`importScripts`/`window.parent`/`document.cookie` 等) + 200 KB 体积上限 + Worker CSP(`default-src 'self' https://cdn.jsdelivr.net`) + iframe `sandbox="allow-scripts"`(无 `allow-same-origin`)
- 自迭代状态机:LLM 输出失败 → 把错误塞回 prompt 让 LLM 改 → 最多 2 轮 → 失败用模板兜底
- LLM_KILL_SWITCH:env var `LLM_KILL_SWITCH=true` 跳过所有 LLM 调用,直接给模板,用于成本应急
- 4 个 LLM provider 抽象:Workers AI(默认,免费)/ DeepSeek / Gemini / Anthropic(BYOK)
- Pages Functions 代理层(`/api/*` → Worker)加 CORS + 可选 rate-limit

**怎么做到的**

- `packages/prompt` — 纯 TS prompt 构建器,`buildPrompt(input)` 输出 system + user prompt,无外部依赖
- `packages/llm` — `Provider` interface + 4 个实现(workers-ai/deepseek/gemini/anthropic),`pickProvider(model)` 路由
- `packages/sandbox` — `extractHtml`(剥离 markdown 围栏) + `staticAnalysis`(denylist) + `sizeCheck`(≤200 KB)
- `packages/retry` — `runWithRetry(stateMachine, maxRetries=2)`,失败时 `buildFixPrompt(error)` 塞回上游
- `packages/templates` — 5 平台跳跃 + 5 射击 + 5 解谜,`Template.render(theme)` 输出完整 HTML
- `apps/web` — Next.js 14(Pages Router, `output: 'export'`) → Cloudflare Pages
- `apps/worker` — Cloudflare Worker(Hono 路由 + D1 历史 + R2 游戏产物 + KV 配额)→ Cloudflare Workers
- `functions/api/*` — Pages Functions 薄代理层,加 CORS,转发到 Worker

**跑起来的数字**

- 164 测试通过(prompt 21 + sandbox 32 + llm 23 + retry 14 + templates 17 + worker 33 + web 24)
- TypeScript strict 干净,First Load JS ≤130 kB
- 5 风格 prompt 模板 × 15 预制游戏模板 × 4 LLM provider × 7 packages/apps

**本地开发**

```bash
pnpm install
pnpm dev:worker           # http://127.0.0.1:8787
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787 pnpm dev:web   # http://localhost:3000
```

**测试**

```bash
pnpm test          # 164 tests across 7 packages
pnpm test:e2e      # Playwright happy-path + retry-path (需先 pnpm exec playwright install)
```

**部署**

```bash
pnpm --filter @whimsy/worker deploy
pnpm --filter @whimsy/web build
pnpm --filter @whimsy/web exec wrangler pages deploy ./out --project-name whimsy
```

---

> 这项目代码已经写完 100%,60 个 task 全部 commit。是 5 个项目里第二个完整跑通到 deploy 的(第一个是嘴笨助手 Sry)。