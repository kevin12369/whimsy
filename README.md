# Whimsy Shuffle — Echo Expedition

> Collect echoes from shattered realms. Forge bonds with lost companions. Decide the fate of a broken world.

A browser-based 2D roguelike expedition game built with Phaser 3. Explore 11 procedurally generated domains, recruit companions, collect 33 story fragments, make moral choices, and face 3 unique endings. Built entirely in TypeScript — no server, no accounts, no install.

**Status**: Phase A-D complete, playable from first tutorial to final ending. [Play now](https://kevin12369.github.io/whimsy/) (requires GitHub Actions deployment).

---

## Overview

The world shattered when the Prism broke. Echoes of its power scatter across 11 corrupted domains. You — a lone traveler — must venture into each realm, collect the echoes, recruit lost companions, and decide whether to restore, remake, or release the world.

### Core Loop

```
Select a Domain → Expedition (5 layers) → Collect Echoes → 
Echo Archive (track progress) → Next Domain → 
All 11 echoes collected → Final Choice → Ending
```

Each expedition layer features procedurally generated terrain via Wave Function Collapse, items to discover, NPCs to encounter, and a unique realm threat.

---

## Features

### 11 Domains
Each with distinct palette, companion, traps, and story:

| Domain | Threat | Companion |
|--------|--------|-----------|
| 🌲 Forest | Thorns | Moss (scout) |
| 🌊 Ocean | Undertow | Tide (channeler) |
| 🏰 Dungeon | Shadow | Ember (guardian) |
| 🤖 Sci-Fi | Energy Field | Pixel (AI) |
| 🏜️ Desert | Quicksand | Mirage (trickster) |
| ❄️ Tundra | Ice Crack | Frost (elemental) |
| 🌴 Jungle | Toxin Cloud | Spore (symbiont) |
| 💎 Crystal | Crystal Spikes | Prism (resonator) |
| 🌈 Neon | Power Grid | Glitch (data spirit) |
| 👻 Haunted | Wraiths | Echo (lost soul) |
| ☁️ Sky | Void | Zephyr (wind rider) |

### Companion System
- 11 companions with unique passive abilities
- 4 bond levels unlocked via XP (quests + exploration)
- Companions react to your choices with contextual dialogue
- Passives affect gameplay: auto-freeze water, reveal traps, reduce dash cooldown, etc.

### Domain Conflict System
Each realm has **2 opposing factions** (22 total). Encounter conflict events during your expedition — your choices affect faction favor and influence which ending you unlock.

### Moral Choice Nodes
5 ethical dilemmas scattered across your journey. Choices track your virtues (compassion, sacrifice, truth, power, freedom, duty) and shape the narrative outcome.

### Story & Narrative
- 33 story fragments revealing the Prism's history
- Domain contamination system (40% chance of corrupted palette)
- 3 endings determined by your choices throughout the game

### Progression & Persistence
- Echo collection tracked across sessions via localStorage
- Companion recruiting and bond levels persist
- Completed quests and faction favor carry over
- All 11 echoes unlock the Final Ending

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Engine | Phaser 3.80 |
| Language | TypeScript 5 |
| Build | Vite 5 |
| Testing | Vitest + Playwright |
| Map Gen | Wave Function Collapse |
| Persistence | localStorage |
| Art | Kenney (CC0) — Roguelike tiles, UI pack, particle pack |
| Audio | Kenney UI Audio pack (CC0) |
| Hosting | GitHub Pages (static, no server) |

## Quick Start

```bash
git clone https://github.com/kevin12369/whimsy.git
cd whimsy
pnpm install
pnpm dev
# open http://localhost:5173
```

Requires **Node.js 20+** and **pnpm 9+**.

## How to Play

### First-time player
1. **Complete the tutorial** (5 steps) — teaches movement, pickup, item use, dialogue, and fusion
2. **Echo Archive** opens — tracks your progress across all domains
3. Click **"Start Expedition"** → pick a domain from the 3 offered

### In Expedition (5 layers per domain)
- **WASD / Arrow keys** — move
- **Space** — dash (1.6s cooldown)
- **E** — interact (pick up items, talk to NPCs, open fusion altar)
- **Q** — discard or secondary choice
- **I** — open inventory
- **Esc** — pause menu

### Objectives
Each layer has one of 3 randomized objectives:
- 🔹 **Collect X Echo Fragments** — find and collect glowing purple shards
- 🔹 **Reach the Exit** — navigate to the yellow portal
- 🔹 **Activate the Altar** — perform a fusion at the altar

### Companion Recruitment
Complete quests for the Quest Giver on layer 0 to earn favor. At enough favor, the companion joins you permanently. Their passive ability activates immediately.

---

## Project Structure

```
whimsy/
  index.html                         -- Vite entry point
  src/
    main.ts                          -- Phaser game config & scene registration
    config/                          -- constants, asset keys
    core/                            -- game logic
      companion.ts                   -- 11 companion definitions, quests, dialogues, story
      domainConflict.ts              -- faction system, conflict events
      moralChoices.ts                -- moral choice nodes
      persistence.ts                 -- localStorage save/load
      itemUseEffects.ts              -- item cross-domain effects (77 combinations)
      tutorial.ts                    -- 5-step tutorial
      worldState.ts                  -- level state machine
    procgen/
      wfc.ts                         -- Wave Function Collapse map generation
      themeWorlds.ts                 -- 11 domain definitions
      tileFrames.ts                  -- Kenney spritesheet frame mapping by tile type
      itemFrames.ts                  -- item name → spritesheet frame mapping
      contamination.ts               -- domain contamination system
      deckFallback.ts                -- fallback item generation
      levelSpawner.ts                -- item, NPC, and altar placement
    phaser/
      scenes/
        BootScene.ts                 -- asset loading
        MenuScene.ts                 -- main menu
        EchoArchiveScene.ts          -- progress tracking hub
        DomainSelectScene.ts         -- pick 1 of 3 domains
        GameScene.ts                 -- core gameplay (~2000 lines)
        EndingScene.ts               -- 3 endings with narrative reveal
        InventoryScene.ts            -- inventory UI
        FusionAltarScene.ts          -- item fusion UI
        HandScene.ts                 -- legacy card hand
        PauseScene.ts                -- pause overlay
        PlayerTestScene.ts           -- test scene
      entities/
        Player.ts                    -- movement, dash, collision
        Companion.ts                 -- companion follow entity
    ui/
      DialogueBox.ts                 -- bottom-panel RPG dialogue
      VFX.ts                         -- particle effects
      AudioManager.ts                -- SFX playback
      KeyIcon.ts                     -- keyboard prompt icon
      CardHandView.ts                -- legacy card hand view
  public/
    assets/
      tiles/                         -- Kenney roguelike spritesheet
      audio/                         -- 12 SFX (pickup, dash, damage, etc.)
      vfx/                           -- 9 particle sprites (magic, fire, slash, etc.)
      ui/                            -- Kenney UI panel & keyboard prompts
    favicon.png
  .github/workflows/
    deploy.yml                       -- GitHub Pages auto-deploy
  docs/design/                       -- design documents & acceptance reports
```

## Dev Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Vite dev server with HMR at :5173 |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve `dist/` locally |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm typecheck` | `tsc --noEmit` |

## Deployment

Push to `main` triggers [GitHub Actions](.github/workflows/deploy.yml) to build and deploy to GitHub Pages. The workflow:

1. Checks out the code
2. Installs dependencies with pnpm
3. Builds the project
4. Uploads `dist/` as a Pages artifact
5. Deploys to `https://kevin12369.github.io/whimsy/`

## Design

Detailed design docs are in [docs/design/](docs/design/):

- [Game Design Document v2](docs/design/GDD-whimsy-shuffle-v2.md)
- [Phase A-Acceptance](docs/design/2026-06-22-phase15-acceptance.md)
- [Phase C-Acceptance](docs/design/2026-06-22-phase16-acceptance.md)
- [Game State Evaluation](docs/design/2026-06-24-game-state-evaluation.md)

## License

MIT. See [LICENSE](./LICENSE).

## Acknowledgments

- [Kenney](https://kenney.nl) — Roguelike tiles, UI panel, particle pack, UI audio (CC0)
- [Phaser](https://phaser.io) — Game engine
- OpenGameArt.org — Asset distribution platform
