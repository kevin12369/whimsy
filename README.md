# Whimsy

> **One sentence. Five playable Phaser 3 variants in 30 seconds. Pick one, export the source, keep going.**

**Status: v3 in development** — pivoting from a browser SPA to a local desktop app (Tauri). See [Roadmap](#roadmap) and [What changed and why](#what-changed-and-why).

---

## What it is

Whimsy is a Game Jam starter. Describe a game in one sentence (Chinese or English); it gives you five Phaser 3 variants you can actually open and play. Pick the closest one, export the HTML or the Phaser source, and keep iterating in your own editor.

It is not an AI game design tool. It does not invent mechanics for you, balance them, or teach you Phaser. It is a "turn the picture in your head into something I can play in 30 seconds" tool.

The product lives in **two places** now:

1. **GitHub Pages** — static landing page with project info, template screenshots, and download links for the desktop app.
2. **Desktop app (Tauri)** — runs locally; talks to your own Ollama / LM Studio; renders the generated game into a real webview where Phaser actually works.

---

## Why the pivot (short version)

Phaser 3 is the core of every variant. In a browser SPA hosted on GitHub Pages, with strict CSP and `<iframe sandbox="allow-scripts">`, Phaser's scene `create()` throws `Cannot read properties of undefined (reading 'add')` — `this.add` is undefined inside the sandboxed frame. We tried `allow-same-origin`, drop CSP, switch CSP sources, strip base64, fence-strip, JSON-config output, and 30+ patches. The sandbox + strict CSP combination is fundamentally hostile to Phaser's scene init in modern Chromium / Edge / WebView2.

The desktop app removes the constraint. Tauri runs the same webview on the user's machine, with CSP fully under our control (we can drop `default-src 'none'` because the entire surface is local). Phaser mounts in the main webview, no iframe, no sandbox, just DOM — and it works.

Full timeline below in [What changed and why](#what-changed-and-why).

---

## How it works (v3)

```
user prompt  →  Tauri Rust backend  →  local Ollama / LM Studio (JSON config)
                                          ↓
                              12-denylist + 200KB + staticAnalysis
                                          ↓
                          5 templates read the JSON config
                                          ↓
                       IIFE rendered as <script> in main webview
                                          ↓
                            Phaser 3 mounts the game
```

The LLM never produces Phaser code anymore. It produces a small JSON config (8-15 fields) that names a template + fills the numbers (player speed, jump velocity, enemy count, colours, etc). The five templates compile the JSON into complete Phaser 3 IIFE in `~7 KB` each. This was a deliberate trade — see [Why JSON config](#why-json-config).

---

## Download

The desktop app is in development. Once v3 ships, releases will appear here:

- **macOS**: `Whimsy-x.y.z.dmg`
- **Windows**: `Whimsy-x.y.z.exe`
- **Linux**: `Whimsy-x.y.z.AppImage`

Until then, you can run Whimsy from source — see [Run from source](#run-from-source) below.

---

## Run from source

Requires Node.js 20+, pnpm 9+, and a local LLM (Ollama or LM Studio).

```bash
git clone https://github.com/kevin12369/whimsy.git
cd whimsy
pnpm install

# Terminal 1: your local LLM
ollama pull qwen2.5-coder:7b
ollama serve    # http://localhost:11434

# Terminal 2: Whimsy web (legacy v2 demo; works only partially due to the iframe issue)
pnpm --filter @whimsy/web dev
open http://localhost:3000/whimsy/
```

For the v3 desktop app (when it ships):

```bash
cd whimsy/apps/desktop
cargo install tauri-cli --version "^2.0"
pnpm install
pnpm tauri dev
```

---

## The 5 templates

| Template | Mechanic | JSON knobs |
|---|---|---|
| `sideScrollerComet` | Side-scrolling platformer (Mario-style) | `playerSpeed`, `jumpVelocity`, `gravity`, `enemyCount`, `enemySpeed`, `spawnIntervalMs`, `lives` |
| `verticalShmup` | Vertical bullet-hell shooter | `scrollSpeed`, `enemyFireRateMs`, `enemyRows`, `lives` |
| `twinStickBattler` | Twin-stick room-clearing roguelike | `roomCount`, `enemiesPerRoom`, `enemyFireMs` |
| `tileMatch` | Bejeweled-style 8×8 match-3 | `boardSize`, `moves`, `targetScore`, `iceBlocks` |
| `sokoban` | Box-pushing puzzle | `gridSize`, `boxCount`, `movingTarget` |

Every template ships with 3 levels, a boss fight at the end, and a `localStorage` high-score. The LLM's JSON just adjusts the numbers + colours + flavour text.

---

## What changed and why

This section is the honest timeline. It is the kind of post-mortem I wish more open-source projects published.

### Phase 0 — Browser SPA (PRs #1-#25, ~3 weeks)

The original design was a pure-static GitHub Pages SPA: user opens the page, types a prompt, Whimsy sends it to LM Studio / Ollama on `localhost:1234` / `localhost:11434`, LLM writes a complete Phaser 3 HTML file, Whimsy renders that HTML into a sandboxed `<iframe srcDoc>`.

Things that worked:
- 5 templates with 3 levels + boss + HUD + high-score (PR #14, ~280 lines of IIFE per template)
- Local LLM connection via Ollama / OpenAI-compatible protocols
- 12-denylist + 200KB + staticAnalysis sandbox for LLM output
- LLM failure fallback (random template + defaults)
- HOW TO PLAY HUD on every template
- LLM output: 789 tokens / 8.5s on a 7B model

Things that didn't:
- **CSP + iframe + Phaser.** Every time the LLM produced a valid HTML game, the iframe was either blocked by CSP (`default-src 'none'`), the Phaser scene init failed inside the sandbox (`this.add` undefined), or the browser showed a Tracking Prevention warning. We tried 30+ fixes — added `allow-same-origin`, dropped `default-src 'none'`, stripped markdown fences, stripped base64 URIs, added JSON-config output, added a fallback for missing closing `</html>`, added 1500ms spawn invincibility frames, removed a phantom Loading hack in `twinStick`. None of them closed the gap. **The browser architecture was the wrong shape for Phaser to work inside it.**
- **Tracking Prevention** on Chrome blocks third-party storage reads for the Phaser CDN, which is a runtime warning users see in console but does not actually break Phaser.
- **LLM 7B generates bad Phaser.** It often wrote `load.image('comet', 'data:image/png;base64,...')` even when prompted not to, because 7B models don't reliably follow "no base64" rules.

The JSON-config pivot (PR #26) was the last real lever: LLM produces JSON, templates render it. That part works well — Phaser code is now only in templates, LLM only emits numbers + colours. But the iframe sandbox + strict CSP remained incompatible with Phaser's runtime needs.

### Phase 1 — The pivot to desktop (this phase, in progress)

The desktop app is the same architecture as Phase 0, minus the iframe + strict CSP that were the actual blockers. We get:

- **Phaser mounts in the main webview** — no iframe, no sandbox. `this.add` is the real `GameObjectFactory`, not undefined.
- **CSP is under our control** — Tauri webview, not Chrome's strict default. We can drop `default-src 'none'` and add `unsafe-inline` / `unsafe-eval` for the script Phaser needs.
- **Rust backend** proxies LLM calls. No CORS, no mixed-content, no localhost fetches from the webview. The webview talks to its own Rust server via Tauri IPC.
- **Smaller download** — Tauri ships ~5 MB (system WebView), not 150 MB (Electron + Chromium).
- **Offline by default** — no CDN dependency; Phaser is bundled.
- **Real GitHub Releases pipeline** — `.dmg` / `.exe` / `.AppImage` artifacts, versioned, downloadable, not "view the GitHub Pages demo".

What we lose:
- One-click web demo on `kevin12369.github.io/whimsy`. The page still exists, but it's now a static landing page with download links, not a playable demo.
- Browser-only users have to download + install an app. That's the trade.

### Why JSON config

In Phase 0, the LLM produced free-form HTML — strings like:

```js
class CometGame extends Phaser.Scene {
  preload() { this.load.image('comet', 'data:image/png;base64,iVBORw...'); }
  ...
}
```

Two problems: (1) 7B models reliably ignore "no base64" instructions, and (2) Phaser's scene init breaks inside the iframe, so even a perfect output wouldn't render.

We pivoted to JSON:

```json
{"type":"sideScroller","playerSpeed":220,"jumpVelocity":460,"gravity":900,"enemyCount":5,"lives":3}
```

The templates compile this JSON into Phaser code at the client. The LLM never writes Phaser anymore — only numbers and colours. The same 5 templates can render dozens of variants. And the runtime works, because Phaser code lives in trusted template code, not in untrusted LLM output.

### The numbers behind the pivots

| Phase | Output type | Avg size | Avg time | 7B success rate | Plays in browser? |
|---|---|---|---|---|---|
| 0a (HTML) | free-form Phaser HTML | 789-8000 tok | 8.5-30s | ~50% | **No** (iframe/CSP) |
| 0b (JSON) | JSON config | 50-200 tok | 1-3s | ~99% | **No** (iframe/CSP) |
| 1 (Desktop) | JSON config → main webview Phaser | 50-200 tok | 1-3s | ~99% | **Yes** |

---

## Roadmap

| Milestone | Status | Notes |
|---|---|---|
| **v2 — Browser SPA** | shipped (broken) | 25 PRs, ~280 tests, deploy to GitHub Pages. Concept works, runtime doesn't. |
| **v2.5 — JSON config + 5 templates** | shipped (still broken in browser) | PRs #14, #26-#29. The templates + JSON pipeline are good and will carry into v3. |
| **v3 — Tauri desktop app** | **in development** | Phase 0 + Phase 1 of new plan. Target: 2026-07-15. |
| **v3.1 — GitHub Releases pipeline** | planned | Tauri matrix build, .dmg / .exe / .AppImage auto-upload on tag. |
| **v3.5 — Polished landing page** | planned | GitHub Pages becomes a real marketing site: hero, screenshots, GIFs, download CTA. |
| **v4 — Streaming + cancel** | backlog | Real-time LLM token streaming, cancel button, partial-game preview. |
| **v4.5 — Auto-detect local LLM** | backlog | Tauri Rust backend detects Ollama / LM Studio on launch, prompts to install if missing. |
| **v5 — Cloud LLM option** | rejected | Was on the Phase 0 roadmap; rejected because (a) keys can't be in the browser safely and (b) contradicts the local-first principle. |

Track progress in the [Issues tab](https://github.com/kevin12369/whimsy/issues) and on this README — sections below update as milestones land.

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│  User downloads + double-clicks Whimsy.app / .exe / .AppImage │
│                                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Tauri webview (main page, CSP under our control)  │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │  <head>                                     │  │    │
│  │  │    Phaser 3 bundled locally                 │  │    │
│  │  │  <body>                                     │  │    │
│  │  │    <div id="g">  ← Phaser canvas mount     │  │    │
│  │  │    <script>     ← 5 templates' IIFE          │  │    │
│  │  │    <input>      ← user prompt               │  │    │
│  │  │  </script>                                 │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ Tauri IPC                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Rust backend                                      │    │
│  │  • HTTP server on localhost:1420                  │    │
│  │  • /api/generate  → forwards to local LLM         │    │
│  │  • 12-denylist + 200KB + staticAnalysis           │    │
│  │    (rust regex + AST check, binary-grade)         │    │
│  │  • /api/status    → detects Ollama / LM Studio    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕ HTTP                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Ollama / LM Studio (user runs locally)           │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

Why a Tauri webview and not Electron? Smaller binary (5 MB vs 150 MB) and faster cold start. We don't need Electron's tooling — no Node-in-main-process, no Chromium re-download. The Rust backend gives us a real, native, type-safe IPC for the 12-denylist sandbox validation. Linux + macOS + Windows all use the system WebView (WebKitGTK, WKWebView, WebView2) so no Chromium upgrade treadmill.

---

## Development

### Build the desktop app

```bash
cd apps/desktop
cargo tauri build
```

Output in `apps/desktop/src-tauri/target/release/bundle/`. The CI workflow at `.github/workflows/release.yml` builds the same matrix on tag push.

### Run the dev server

```bash
pnpm --filter @whimsy/web dev       # Next.js pages (legacy v2 demo)
pnpm --filter @whimsy/desktop dev   # Tauri app (v3)
```

### Project layout

```
projects/whimsy/
├─ apps/
│  ├─ web/                    ← GitHub Pages static landing + (legacy) v2 demo
│  └─ desktop/                ← Tauri v3 app (in development)
│     ├─ src/                 ← React + TypeScript
│     └─ src-tauri/           ← Rust backend
├─ packages/
│  ├─ templates/              ← 5 Phaser templates (platformer / shooter / puzzle)
│  ├─ sandbox/                ← 12-denylist + 200KB + staticAnalysis (TS; mirrored in Rust)
│  ├─ llm/                    ← Provider abstraction (reused in Rust port)
│  ├─ prompt/                 ← JSON prompt templates
│  └─ retry/                  ← fetch retry helpers
└─ docs/                      ← Specs, plans, this README's source of truth
```

---

## License

MIT. See [LICENSE](./LICENSE).