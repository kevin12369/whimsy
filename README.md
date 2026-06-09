# Whimsy (一念成游)

One sentence to a playable 2D game.

## Develop

```bash
pnpm install
pnpm test
pnpm dev:web
pnpm dev:worker
```

## Deploy

```bash
pnpm --filter @whimsy/worker deploy
pnpm --filter @whimsy/web deploy
```

## Architecture

- `packages/prompt` — pure TS prompt builder
- `packages/llm` — provider abstraction (Workers AI / DeepSeek / Gemini / Anthropic)
- `packages/sandbox` — static-analysis denylist + extractHtml + size check
- `packages/retry` — self-iteration state machine
- `packages/templates` — pre-generated game templates
- `apps/web` — Next.js static-export frontend
- `apps/worker` — Cloudflare Worker (Hono + D1 + R2 + KV)
