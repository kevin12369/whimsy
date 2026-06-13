# Run Whimsy locally

5 steps. ~10 min total.

## 1. Prerequisites

- **Node.js 20+** ([download](https://nodejs.org))
- **pnpm 9+** — `npm i -g pnpm`
- **A local LLM server** — Ollama or LM Studio (see step 4). Whimsy runs in two modes:
  - **Static-only** — browse 15 pre-baked Phaser 3 games (no LLM, 0 cost)
  - **Local LLM** — generate new games from a Chinese description

## 2. Clone

```bash
git clone https://github.com/kevin12369/whimsy.git
cd whimsy
```

## 3. Install

```bash
pnpm install
```

This installs 6 packages (prompt, sandbox, llm, retry, templates, web) via pnpm workspace.

## 4. Configure LLM (optional, for game generation)

Install [Ollama](https://ollama.com):

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows — download from ollama.com/download
```

Then pull a model and start the server:

```bash
ollama pull llama3.1:8b     # ~5GB, decent code generation
ollama serve                  # listens on http://localhost:11434
```

Or use **LM Studio** on port 1234 with any `Qwen2.5-Coder` or `Llama 3.1` model — Whimsy supports OpenAI-compatible endpoints out of the box.

> Skip this step if you only want to browse the 15 pre-baked games — no LLM needed.

## 5. Run

```bash
pnpm dev
# open http://localhost:3000
```

In the UI:
- **Pick a thumbnail** at the bottom → big preview loads a Phaser 3 game
- **(Optional) Settings → Local LLM** → pick provider, base URL, model → click **Test connection**
- Click **Generate (local LLM)** in the header → describe a game → 15 sec later you have new HTML

## What you'll see

- A live demo of Whimsy's big-preview layout (70vh Phaser canvas + 14 thumbnails strip)
- All **164 tests** pass (`pnpm test` to re-run)
- TypeScript strict clean (`pnpm -r exec tsc --noEmit`)

## Need help?

- Issues: https://github.com/kevin12369/whimsy/issues
- Email: 491750329@qq.com