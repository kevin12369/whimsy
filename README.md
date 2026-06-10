# Whimsy (一念成游)

> 一句话生成一个可玩的、可分享的 Phaser 3 小游戏。
>
> Type one sentence; get a playable, shareable Phaser 3 game in ~15 seconds.

## 在线演示 / Live demo

部署到 Cloudflare Pages + Workers:`https://play.example.dev/`(部署后填入)

Deployed to Cloudflare Pages + Workers: `https://play.example.dev/` (set after deploy).

## 开发 / Develop

```bash
pnpm install
pnpm test                 # 所有包 / all packages
pnpm dev:worker           # http://127.0.0.1:8787
pnpm dev:web              # http://localhost:3000
```

### 环境要求 / Local prerequisites

- Node 20+
- pnpm 9+
- Wrangler:`pnpm dlx wrangler login`

### 首次配置 / First-time setup

```bash
# Worker
cd apps/worker
pnpm exec wrangler d1 create whimsy
pnpm exec wrangler r2 bucket create games
pnpm exec wrangler kv namespace create QUOTA
# 然后把 ID 粘到 wrangler.toml / Then paste the IDs into wrangler.toml

pnpm exec wrangler secret put CF_API_TOKEN       # 可选,Workers AI 用 / optional
pnpm exec wrangler secret put DEEPSEEK_API_KEY   # 推荐 / recommended
pnpm exec wrangler secret put GEMINI_API_KEY     # 可选 / optional

pnpm run migrate
pnpm run dev
```

## 部署 / Deploy

```bash
pnpm --filter @whimsy/worker deploy
pnpm --filter @whimsy/web build
pnpm --filter @whimsy/web exec wrangler pages deploy ./out --project-name whimsy
```

## 架构 / Architecture

- `packages/prompt` — 纯 TS 提示词构建器,不含 LLM 依赖 / pure TS prompt builder (no LLM)
- `packages/llm` — LLM 抽象层:Workers AI / DeepSeek / Gemini / Anthropic / provider abstraction
- `packages/sandbox` — `extractHtml` 提取 + 静态 API 黑名单 + 体积校验 / extractHtml, static denylist, size check
- `packages/retry` — 自迭代状态机,最多重试 2 次 / self-iteration state machine (max 2 retries)
- `packages/templates` — 15 套预制 HTML 游戏模板,支持主题注入 / 15 pre-baked HTML game templates with theme injection
- `apps/web` — Next.js 14 静态导出,表单 + 播放页 / Next.js 14 static export, form + viewer
- `apps/worker` — Cloudflare Worker:Hono 路由 + D1 历史 + R2 游戏产物 + KV 配额 / Hono routes, D1 history, R2 game blobs, KV quotas

## 安全 / Safety

| 措施 / Measure | 说明 / Detail |
|---|---|
|Iframe 沙盒 / Iframe sandbox | `sandbox="allow-scripts"` only(没有 `allow-same-origin`) |
|静态黑名单 / Static denylist | 拦截 `eval`、`new Function`、`fetch`、`XMLHttpRequest`、`localStorage`、`window.parent` 等 |
|严格 CSP / Strict CSP | `default-src 'self' https://cdn.jsdelivr.net` |
|服务端校验 / Server-side validation | LLM 输出先在 Worker 端校验再下发 |

## 成本 / Cost

- **默认自费 / Self-funded default**: $0(Workers AI 免费,DeepSeek 约 $0.001/次)
- **BYOK**:用户自带 API 钥 / user provides their own API key
- **免费额度 / Free tier**:每天 100 次生成落在 Cloudflare 免费档内 / 100 generations/day fits inside Cloudflare free tier