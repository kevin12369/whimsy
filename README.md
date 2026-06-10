# Whimsy (一念成游)

Type one sentence; get a playable, shareable Phaser 3 game in ~15 seconds.

## Live demo

Deployed to Cloudflare Pages + Workers: <https://play.example.dev/> (set after deploy).

## Develop

```bash
pnpm install
pnpm test                 # all packages
pnpm dev:worker           # http://127.0.0.1:8787
pnpm dev:web              # http://localhost:3000
```

### Local prerequisites

- Node 20+
- pnpm 9+
- Wrangler: `pnpm dlx wrangler login`

### First-time setup

```bash
# Worker
cd apps/worker
pnpm exec wrangler d1 create whimsy
pnpm exec wrangler r2 bucket create games
pnpm exec wrangler kv namespace create QUOTA
# Then paste the IDs into wrangler.toml

pnpm exec wrangler secret put CF_API_TOKEN       # optional, for Workers AI
pnpm exec wrangler secret put DEEPSEEK_API_KEY   # recommended
pnpm exec wrangler secret put GEMINI_API_KEY     # optional

pnpm run migrate
pnpm run dev
```

## Deploy

```bash
pnpm --filter @whimsy/worker deploy
pnpm --filter @whimsy/web build
pnpm --filter @whimsy/web exec wrangler pages deploy ./out --project-name whimsy
```

## Architecture

- `packages/prompt` — pure TS prompt builder (no LLM)
- `packages/llm` — provider abstraction over Workers AI, DeepSeek, Gemini, Anthropic
- `packages/sandbox` — extractHtml, static denylist, size check
- `packages/retry` — self-iteration state machine (max 2 retries)
- `packages/templates` — 15 pre-baked HTML game templates with theme injection
- `apps/web` — Next.js 14 static export, form + viewer
- `apps/worker` — Cloudflare Worker: Hono routes, D1 history, R2 game blobs, KV quotas

## Safety

- Iframe uses `sandbox="allow-scripts"` only (no `allow-same-origin`)
- Static denylist blocks `eval`, `new Function`, `fetch`, `XMLHttpRequest`, `localStorage`, `window.parent`, etc.
- Strict CSP: `default-src 'self' https://cdn.jsdelivr.net`
- LLM output validated server-side before it is served to anyone

## Cost

- Self-funded default: $0 (Workers AI free, optional DeepSeek ~$0.001/gen)
- BYOK: user provides their own API key
- 100 generations/day fits inside Cloudflare free tier
