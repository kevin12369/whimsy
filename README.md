# Whimsy Shuffle

> Every session, the world reshuffles itself.

A browser-based 2D sandbox casual game where each play session is "shuffled": a fresh theme, fresh levels, fresh rules, fresh surprises. A deterministic procedural core (Perlin + Wave Function Collapse) builds the world; an optional in-browser LLM (WebLLM, WebGPU) adds personality on top. Everything runs in a single browser tab. No server, no account, no install.

Status: **spec complete, Phase 1 plan in progress**. See [docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md](docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md).

- English spec: [spec](docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md)
- 中文 spec: [规范](docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.zh-CN.md)

## Why this exists

Most procgen games use one technique (noise, or WFC, or templates). Most AI-in-the-loop games lean on the LLM for almost everything. Whimsy Shuffle splits the difference: the world is **always** built by deterministic procgen, and the LLM is **only** used to fill a session's deck of cards (theme, physics tweaks, item names, NPC roles, hidden recipes) and to generate dialogue and fusion results. Procgen is the meal. LLM is the spice.

And critically, the LLM is **opt-in**. Pure Procgen mode ships with 16 hand-authored theme decks and is fully playable on integrated graphics, with zero model download. AI mode is for players who want surprise.

## Features

- **Card system**: every interactive element is a card on a shared schema (theme, physics, item, NPC, hidden). The shuffle metaphor is literal — each session is a new deck.
- **Fusion altar**: drag two cards together. Item + Item produces a new item, Item + Card absorbs the card's effect, Item + matching hidden card unlocks a level, Card + Card composes deterministically client-side.
- **Physics perturbation (opt-in, no LLM at play time)**: the LLM pre-bakes 8 physics cards per session. The player plays one onto the active level; Phaser patches gravity / restitution / friction on the spot.
- **5-level sessions**: walk, talk, fuse, perturb, exit. About 5 minutes per session, then Reshuffle.
- **Pure Procgen mode**: 16 hardcoded theme decks, no model download, 30+ FPS on integrated GPUs. The default landing path.
- **AI Enhancement mode (opt-in)**: WebLLM in a Web Worker. Default model: Phi-3.5 mini 3.8B. Optional: Qwen 2.5 7B (better Chinese). 5-10 calls per 5-level session, 30-60s total on RTX 3060.
- **Cross-platform**: any modern browser with WebGPU. Mouse + keyboard. Static hostable (itch.io, GitHub Pages, nginx).
- **Single language, single repo, ~2500 lines of game code**: small enough for a portfolio reader to clone and play in 2 minutes.

## Tech stack

| Layer | Choice |
|---|---|
| Rendering & physics | Phaser 3 |
| Language | TypeScript 5 |
| Build | Vite 5 |
| In-browser LLM | WebLLM (WebGPU) |
| Default model | Phi-3.5 mini 3.8B |
| Optional model | Qwen 2.5 7B |
| Tests | Vitest (unit) + Playwright (E2E) |
| Hosting | itch.io + GitHub Pages + nginx (static, no server) |

## Quick start

```bash
git clone https://github.com/kevin12369/whimsy.git
cd whimsy
pnpm install
pnpm dev
# open http://localhost:5173
```

Requires Node.js 20+ and pnpm 9+. The first dev run downloads the WebLLM model in the background if you pick AI mode; subsequent runs use the browser cache and start in under 5s.

## How to play

1. Open the page, pick **Pure Procgen** or **Procgen + AI**.
2. Click **New Shuffle**. The LLM generates a session deck (theme card, 8 physics cards, 5 LLM-authored item cards, 3 NPC cards, 2 hidden cards) in a single call (~3-5s on RTX 3060; instant in Pure Procgen).
3. Walk around the 5-level world. Pick up cards, talk to NPCs (press `E` near them), fuse items on the altar.
4. Open the **physics card hand** in the HUD. Drag a card onto the level to change gravity / friction / restitution live.
5. Drag two cards onto the **fusion altar** to combine them. Some combinations unlock hidden levels.
6. Touch the level exit to advance. 5 levels = one session. Click **Reshuffle** for a new deck.

## Architecture

```
+--------------------------------------------------+
|  Browser Tab (static HTML / JS bundle)           |
|                                                  |
|  +-------------+    +-----------------------+    |
|  | Phaser 3    |    | WebLLM Worker         |    |
|  | Main Thread | <->| (off-thread, WebGPU)  |    |
|  | - Scenes    |    | - Phi-3.5 / Qwen 2.5  |    |
|  | - Tilemap   |    | - prompt templates    |    |
|  | - Physics   |    | - JSON parsers        |    |
|  | - Entities  |    | - fallback handlers   |    |
|  +-------------+    +-----------------------+    |
|         ^                   ^                    |
|         |                   |                    |
|  +------|-------------------|----------------+   |
|  |      Shared Event Bus (window CustomEvent) |   |
|  +-------------------------------------------+   |
|         ^                                       |
|  +------|-------------------+                   |
|  | Procedural Core          |                   |
|  | - Perlin noise generator |                   |
|  | - WFC tile sampler       |                   |
|  | - Item / NPC placement   |                   |
|  | - Physics rule registry  |                   |
|  +--------------------------+                   |
+--------------------------------------------------+
        ^
        | (CDN cache: Hugging Face web-llm)
+--------------------------------------------------+
|  Static Hosting: itch.io / GitHub Pages / nginx  |
+--------------------------------------------------+
```

- **Main thread**: Phaser render + game loop, UI, input.
- **Web Worker**: WebLLM inference (off-thread, isolates model memory, avoids frame stutter).
- **No service worker**: cache is handled by the browser's standard HTTP cache for model files.
- **No backend**: everything is client-side. Static host = deploy.

## Project structure

```
whimsy/
  index.html                                <- Vite entry
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  public/
    sprites/                                <- (Task 15) placeholder PNGs
    atlas/                                  <- (Task 15) sprite atlases
    sfx/                                    <- (Task 15) SFX placeholders
    bgm/                                    <- (Task 15) BGM placeholders
  src/
    main.ts                                 <- Phaser game config
    config/                                 <- constants, assets, themes
    core/                                   <- eventBus, cardSystem, worldState
    procgen/                                <- perlin, wfc, biomes, itemTable, deckFallback
    phaser/
      scenes/                               <- Boot, Menu, Game, HUD, Hand
      entities/                             <- Player, NPC, Item, Card, FusionAltar
    llm/                                    <- WebLLM worker (Phase 2)
    ui/                                     <- HUD, settings, card hand, fusion altar
    utils/                                  <- uuid, color, assetLoader
  tests/                                    <- unit + e2e
  scripts/                                  <- build-atlas, download-assets
  .github/
    workflows/
      deploy.yml                            <- GitHub Pages deploy
  docs/
    superpowers/
      specs/                                <- design specs
      plans/                                <- implementation plans
  README.md
```

## Development

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server with HMR |
| `pnpm build` | production build to `dist/` |
| `pnpm preview` | serve `dist/` locally to verify the build |
| `pnpm test` | unit tests (Vitest) |
| `pnpm test:e2e` | Playwright E2E |
| `pnpm lint` | ESLint + Prettier |
| `pnpm typecheck` | `tsc --noEmit` |

The dev server is the source of truth. HMR reloads scenes on save.

## Performance budget

Targets on RTX 3060 (12GB VRAM, Chrome stable):

| Phase | Target | Hard ceiling |
|---|---|---|
| Cold page load to first frame | < 2s | 5s |
| First level procedurally generated | < 3s | 6s |
| Model download (Phi-3.5, ~2.3GB) | 60s | 120s |
| Subsequent model loads (cached) | < 3s | 8s |
| Deck generation LLM call | 5-8s | 15s timeout |
| Item fusion LLM call | 3-5s | 12s timeout |
| NPC dialogue LLM call | 2-4s | 10s timeout |
| Physics perturbation (client-side, no LLM) | < 16ms | 1 frame |
| Total LLM time per 5-level session | 30-60s | 90s |
| Frame rate during LLM inference | 30-60 FPS | 20 FPS minimum |
| Memory footprint (JS heap + model) | < 6GB | 8GB |

**Fallback chain** (when things go wrong):
1. WebGPU unavailable -> Pure Procgen mode, hide AI option in UI.
2. Model download fails -> Pure Procgen mode, show one-time HUD note.
3. LLM call times out -> cancel, use procgen fallback for that mechanic, increment `timeoutsThisSession` stat.
4. LLM call returns malformed JSON after 1 retry -> use procgen fallback, log to console only.
5. Browser tab backgrounded -> pause model, resume on focus.

## Roadmap

| Phase | Status | Notes |
|---|---|---|
| Spec | complete | 2026-06-20 |
| Phase 1 — Pure Procgen | planning | 13 tasks in spec §11: Vite + Phaser scaffold, Perlin terrain, player controller, WFC biome, card data model, 16 hardcoded decks, card-on-ground pickup, NPC dialogue table, 5-level session loop, physics card drag, fusion altar UI, hidden level recipe check, static deploy |
| Phase 2 — WebLLM enhancement | planned | Model loader, deck-generation prompt, fusion prompt, NPC dialogue prompt, hidden level prompt, model cache, settings panel model picker |
| Phase 3 — Full AI & content | planned | All 16 themes with theme-tuned tile + BGM, 30+60s LLM session budget validated, itchio release, GitHub Pages release |
| Phase 4+ | backlog | Streaming token preview, cancel mid-call, multiple LLM providers, modding hooks |

## Non-goals

These are off-limits by design:

- No accounts, no authentication, no user identity.
- No server, no database, no persistent backend.
- No multiplayer, no networking, no real-time sync.
- No telemetry, no analytics, no third-party trackers.
- No in-app purchases, no ads, no monetization.
- No mobile / touch port. Mouse + keyboard only.
- No external API at runtime (no OpenAI, no Anthropic, no Replicate). LLM is in-browser only.
- No bundled LLM weights. The browser fetches from a public WebLLM cache on first run; subsequent loads use HTTP cache.

## License

MIT. See [LICENSE](./LICENSE).

## Acknowledgments

Asset sources (full attribution in the in-game About modal "Credits" tab):

- [Kenney](https://kenney.nl/assets) — item, NPC, UI, VFX sprites (CC0)
- [cafeDraw Fantasy Card Assets](https://cafedraw.itch.io/fantasy-card-assets) — card frame and back (Royalty-Free)
- [Praan Card Game 2D UI](https://praan.itch.io/cardgame2d) — card UI and table (Royalty-Free)
- [Mixkit](https://mixkit.co/free-sound-effects/game/) — game SFX (Mixkit License)
- [Pixabay Music](https://pixabay.com/music/) — themed BGM loops (Pixabay License)
- [OpenGameArt](https://opengameart.org/) — per-pack license audit (CC0 / CC-BY)
- [Phaser examples](https://github.com/phaserjs/examples) — Phase 1 placeholder assets (MIT)
- [Inter](https://rsms.me/inter/) — English UI font (OFL 1.1)

Chinese text uses system fallback (PingFang SC, Microsoft YaHei). Special thanks to the Phaser 3 and WebLLM teams for the engines that make this project possible.
