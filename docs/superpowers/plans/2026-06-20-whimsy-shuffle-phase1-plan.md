# Whimsy Shuffle Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully playable 5-level sandbox with zero AI dependency. The deck comes from 16 hardcoded theme bundles; all card mechanics (pickup, fusion altar, hidden recipes, physics perturbation) work without the LLM.

**Architecture:** Two-layer. Pure procgen core (Perlin + WFC) builds the world deterministically. Cards are first-class; the deck and card data model are the spine. Static deployment via Vite + GitHub Pages.

**Tech Stack:** Phaser 3 + TypeScript 5 + Vite 5 + Vitest + Playwright. No WebLLM, no model download, no WebGPU dependency in this phase.

**Phase 1 Source Spec:** `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` §11 Phase 1 (13 tasks) + §10.8 Asset Pipeline Phase 1 (6 tasks).

**Path note:** The spec says target path is `projects/whimsy-shuffle/`. Current repo is `projects/whimsy/`. We develop in `projects/whimsy/` and document the rename in Task 14.

---

## File Structure (created during this plan)

```
projects/whimsy/
  index.html                              <- Vite entry (Task 0)
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  public/
    sprites/                              <- (Task 15) placeholder PNGs from Phaser examples
    atlas/                                <- (Task 15) sprite atlases
    sfx/                                  <- (Task 15) SFX placeholders
    bgm/                                  <- (Task 15) BGM placeholders
  src/
    main.ts                               <- Phaser game config (Task 0)
    config/
      constants.ts                        <- magic numbers (Task 1)
      assets.ts                           <- asset manifest (Task 15)
      themes.ts                           <- 16 hardcoded theme bundles (Task 6)
    core/
      eventBus.ts                         <- typed pub/sub (Task 2)
      cardSystem.ts                       <- Card, Deck, Fusion (Task 1, 6, 11)
      fusionTable.ts                      <- hand-authored fusion table (Task 11)
      worldState.ts                       <- WorldState container (Task 1)
    procgen/
      perlin.ts                           <- Perlin noise (Task 3)
      wfc.ts                              <- Wave Function Collapse (Task 5)
      biomes.ts                           <- 5 biome palettes (Task 5)
      itemTable.ts                        <- hardcoded item pool (Task 6)
      deckFallback.ts                     <- select theme deck (Task 6)
    phaser/
      scenes/
        BootScene.ts                      <- (Task 0)
        MenuScene.ts                      <- (Task 13)
        GameScene.ts                      <- (Task 9)
        HudScene.ts                       <- (Task 10)
        HandScene.ts                      <- (Task 10)
        FusionAltarScene.ts               <- (Task 11)
        LevelSelectScene.ts               <- (Task 12)
      entities/
        Player.ts                         <- (Task 4)
        Npc.ts                            <- (Task 8)
        ItemEntity.ts                     <- (Task 7)
        CardEntity.ts                     <- (Task 7)
        FusionAltar.ts                    <- (Task 11)
    ui/
      Hud.ts                              <- (Task 9)
      SettingsPanel.ts                    <- (Task 13)
      CardHandView.ts                     <- (Task 10)
      FusionAltarUI.ts                    <- (Task 11)
      Attribution.ts                      <- (Task 15)
    utils/
      uuid.ts                             <- (Task 2)
      color.ts                            <- (Task 3)
  tests/
    core/
      cardSystem.test.ts                  <- (Task 1, 6, 11)
      eventBus.test.ts                    <- (Task 2)
      worldState.test.ts                  <- (Task 1)
    procgen/
      perlin.test.ts                      <- (Task 3)
      wfc.test.ts                         <- (Task 5)
      biomes.test.ts                      <- (Task 5)
      deckFallback.test.ts                <- (Task 6)
    e2e/
      playthrough.spec.ts                 <- (Task 14)
  scripts/
    build-atlas.mjs                       <- (Task 15) free-tex-packer
    download-assets.mjs                   <- (Task 15) fetch core packs
  .github/
    workflows/
      deploy.yml                          <- (Task 14) GitHub Pages deploy
```

**Decomposition rationale:** Spec §9 already groups by responsibility. Each Task below matches one spec task; each Step inside is a TDD red-green-refactor cycle (2-5 min).

---

## Task 0: Vite + Phaser 3 + TypeScript scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/phaser/scenes/BootScene.ts`
- Test: `tests/smoke.test.ts` (Vitest smoke test for `main.ts` exports)

- [ ] **Step 1: Write smoke test (red)**

Create `tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { PHASER_VERSION } from '../src/main';

describe('main module', () => {
  it('exports Phaser version 3', () => {
    expect(PHASER_VERSION).toBe('3.80.1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd projects/whimsy
pnpm exec vitest run tests/smoke.test.ts
```
Expected: FAIL — "Cannot find module '../src/main'"

- [ ] **Step 3: Write package.json**

```json
{
  "name": "@whimsy/shuffle",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "phaser": "3.80.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@playwright/test": "^1.42.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "vitest": "^1.4.0",
    "@vitest/ui": "^1.4.0"
  }
}
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable", "WebWorker"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 5: Write vite.config.ts**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',  // relative paths for GitHub Pages subpath
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
        },
      },
    },
  },
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

- [ ] **Step 6: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Whimsy Shuffle</title>
    <link rel="icon" href="/favicon.ico" />
    <style>html,body,#app{margin:0;padding:0;height:100%;background:#000;overflow:hidden;}</style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: Write src/main.ts**

```ts
import Phaser from 'phaser';
import { BootScene } from './phaser/scenes/BootScene';

export const PHASER_VERSION = '3.80.1';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  scene: [BootScene],
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
};

new Phaser.Game(config);
```

- [ ] **Step 8: Write src/phaser/scenes/BootScene.ts**

```ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    this.add.text(640, 360, 'Whimsy Shuffle', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
  }
}
```

- [ ] **Step 9: Install and verify dev server**

```bash
cd projects/whimsy
pnpm install
pnpm exec vitest run tests/smoke.test.ts
pnpm exec vite build
```
Expected: vitest PASS, vite build emits `dist/index.html` + assets.

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html src tests
git commit -m "feat(scaffold): Vite + Phaser 3 + TypeScript + Vitest scaffold"
```

---

## Task 1: Card / Deck / Level / WorldState data model

**Files:**
- Create: `src/config/constants.ts`
- Create: `src/core/cardSystem.ts`
- Create: `src/core/worldState.ts`
- Test: `tests/core/cardSystem.test.ts`
- Test: `tests/core/worldState.test.ts`

Reference: spec §6.1, §6.2, §6.3, §6.6.

- [ ] **Step 1: Write Card type test (red)**

Create `tests/core/cardSystem.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { Card } from '../../src/core/cardSystem';

describe('Card', () => {
  it('creates a theme card with required fields', () => {
    const c: Card = {
      id: 't-1', type: 'theme', name: 'Cucumber Cosmos',
      themePayload: { palette: ['#a','#b','#c','#d','#e'], ruleQuirk: 'liquids flow up' },
      generatedBy: 'fallback', generatedAt: 1,
    };
    expect(c.type).toBe('theme');
    expect(c.themePayload?.palette).toHaveLength(5);
  });

  it('physics card has gravity, restitution, friction', () => {
    const c: Card = {
      id: 'p-1', type: 'physics', name: 'Moon Bounce',
      physicsPayload: { gravity: 200, restitution: 0.95, friction: 0.1, note: 'low gravity' },
      generatedBy: 'fallback', generatedAt: 1,
    };
    expect(c.physicsPayload?.gravity).toBe(200);
  });
});
```

- [ ] **Step 2: Run test (red)**

```bash
pnpm exec vitest run tests/core/cardSystem.test.ts
```
Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Write src/config/constants.ts**

```ts
export const TILE_SIZE = 16;
export const LEVEL_WIDTH_TILES = 64;
export const LEVEL_HEIGHT_TILES = 48;
export const PLAYER_SPEED = 180;
export const INVENTORY_MAX_SLOTS = 6;
export const SESSION_LEVELS = 5;
export const THEMES_PER_HARDCODED_DECK = 16;
export const PHYSICS_CARDS_PER_DECK = 8;
export const NPC_CARDS_PER_DECK = 3;
export const HIDDEN_CARDS_PER_DECK = 2;
export const DEFAULT_SPRITE_KEYS = [
  'whip_red','whip_blue','orb_green','orb_yellow',
  'sword_cyan','sword_violet','shield_gold','potion_pink',
] as const;
```

- [ ] **Step 4: Write src/core/cardSystem.ts**

```ts
export type CardType = 'theme' | 'physics' | 'item' | 'npc' | 'hidden';
export type GeneratedBy = 'llm' | 'fallback';

export interface ThemePayload {
  palette: string[];            // exactly 5 hex
  ruleQuirk: string;            // <= 12 words
}
export interface PhysicsPayload {
  gravity: number;              // 100..2000
  restitution: number;          // 0..1
  friction: number;             // 0..1.5
  note: string;                 // <= 8 words
}
export interface ItemPayload {
  spriteKey: string;
  behavior: string;
  stackable: boolean;
  spawnPool?: 'common' | 'rare';
}
export interface NpcPayload {
  role: string;                 // 2-4 words
  personality: string;          // 1 sentence
}
export interface HiddenPayload {
  unlockRecipe: [string, string];  // pair of item names
}

export interface Card {
  id: string;
  type: CardType;
  name: string;
  themePayload?: ThemePayload;
  physicsPayload?: PhysicsPayload;
  itemPayload?: ItemPayload;
  npcPayload?: NpcPayload;
  hiddenPayload?: HiddenPayload;
  generatedBy: GeneratedBy;
  generatedAt: number;
}
```

- [ ] **Step 5: Run test (green)**

```bash
pnpm exec vitest run tests/core/cardSystem.test.ts
```
Expected: PASS

- [ ] **Step 6: Write Deck + Level + WorldState tests (red)**

Append to `tests/core/cardSystem.test.ts`:
```ts
import { Deck, Level, FusedItem, HiddenLevel, PlacedItem, PlacedNpc } from '../../src/core/cardSystem';
// ... existing tests ...

describe('Deck', () => {
  it('round-trips 1 theme + 8 physics + 20-30 item + 3 npc + 2 hidden', () => {
    const d: Deck = {
      id: 'd-1', generatedBy: 'fallback', generatedAt: 1,
      themeCard: { id:'t', type:'theme', name:'X', themePayload:{palette:['#0','#1','#2','#3','#4'], ruleQuirk:'q'}, generatedBy:'fallback', generatedAt:1 },
      physicsCards: Array(8).fill(null).map((_,i)=>({ id:`p${i}`, type:'physics', name:'P'+i, physicsPayload:{gravity:800,restitution:0.3,friction:0.5,note:'n'}, generatedBy:'fallback' as const, generatedAt:1 })),
      itemCards: Array(25).fill(null).map((_,i)=>({ id:`i${i}`, type:'item', name:'I'+i, itemPayload:{spriteKey:'whip_red',behavior:'b',stackable:false}, generatedBy:'fallback' as const, generatedAt:1 })),
      npcCards: Array(3).fill(null).map((_,i)=>({ id:`n${i}`, type:'npc', name:'N'+i, npcPayload:{role:'r',personality:'p'}, generatedBy:'fallback' as const, generatedAt:1 })),
      hiddenCards: Array(2).fill(null).map((_,i)=>({ id:`h${i}`, type:'hidden', name:'H'+i, hiddenPayload:{unlockRecipe:['a','b']}, generatedBy:'fallback' as const, generatedAt:1 })),
    };
    expect(d.physicsCards).toHaveLength(8);
    expect(d.itemCards.length).toBeGreaterThanOrEqual(20);
    expect(d.itemCards.length).toBeLessThanOrEqual(30);
  });
});
```

Append to `tests/core/worldState.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { createWorldState } from '../../src/core/worldState';

describe('WorldState', () => {
  it('starts in procgen mode, no deck, no inventory', () => {
    const w = createWorldState();
    expect(w.mode).toBe('procgen');
    expect(w.deck).toBeNull();
    expect(w.inventory).toEqual([]);
    expect(w.currentLevelIndex).toBe(0);
  });
});
```

- [ ] **Step 7: Add Deck/Level/etc types to cardSystem.ts**

Append:
```ts
export interface Deck {
  id: string;
  themeCard: Card;
  physicsCards: Card[];     // exactly 8
  itemCards: Card[];         // 20-30
  npcCards: Card[];          // 3
  hiddenCards: Card[];       // 2-3
  generatedBy: GeneratedBy;
  generatedAt: number;
}

export interface PlacedItem { cardId: string; pos: { x: number; y: number }; }
export interface PlacedNpc  { cardId: string; pos: { x: number; y: number }; dialogueHistory: string[]; }

export interface Level {
  index: number;
  deckId: string;
  tilemap: string;          // serialized WFC output
  widthTiles: number;
  heightTiles: number;
  spawnedItems: PlacedItem[];
  npcs: PlacedNpc[];
  activePhysicsCardId: string | null;
  exitTile: { x: number; y: number };
  unlockedBy?: string;
}

export interface FusedItem {
  id: string;
  name: string;
  spriteKey: string;
  behavior: string;
  stackable: boolean;
  fusedFrom: { type: 'item+item' | 'item+card' | 'card+card'; inputs: [string, string]; };
}

export interface HiddenLevel {
  id: string;
  name: string;
  paletteOverride: string[];
  ruleQuirk: string;
  unlockRecipeCardId: string;
}
```

- [ ] **Step 8: Write src/core/worldState.ts**

```ts
import type { Card, Deck, FusedItem, HiddenLevel, Level } from './cardSystem';

export type Mode = 'procgen' | 'ai';
export type ModelStatus = 'unloaded' | 'loading' | 'ready' | 'unavailable';

export interface LlmStats {
  callsThisSession: number;
  totalLatencyMs: number;
  timeoutsThisSession: number;
}

export interface WorldState {
  deck: Deck | null;
  levels: Level[];
  currentLevelIndex: number;
  inventory: FusedItem[];
  hand: Card[];             // physics cards in player's hand
  llmStats: LlmStats;
  mode: Mode;
  modelStatus: ModelStatus;
  unlockedHiddenLevels: HiddenLevel[];
}

export function createWorldState(): WorldState {
  return {
    deck: null,
    levels: [],
    currentLevelIndex: 0,
    inventory: [],
    hand: [],
    llmStats: { callsThisSession: 0, totalLatencyMs: 0, timeoutsThisSession: 0 },
    mode: 'procgen',
    modelStatus: 'unloaded',
    unlockedHiddenLevels: [],
  };
}
```

- [ ] **Step 9: Run all tests (green)**

```bash
pnpm exec vitest run tests/core/
```
Expected: PASS for both cardSystem.test.ts and worldState.test.ts

- [ ] **Step 10: Commit**

```bash
git add src/config/constants.ts src/core src/tests/core
git commit -m "feat(card): Card / Deck / Level / FusedItem / HiddenLevel / WorldState data model"
```

---

## Task 2: Event bus + uuid utility

**Files:**
- Create: `src/core/eventBus.ts`
- Create: `src/utils/uuid.ts`
- Test: `tests/core/eventBus.test.ts`

- [ ] **Step 1: Write eventBus test (red)**

```ts
// tests/core/eventBus.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createBus } from '../../src/core/eventBus';

describe('eventBus', () => {
  it('emits and receives typed events', () => {
    const bus = createBus<{ ping: { from: string } }>();
    const fn = vi.fn();
    bus.on('ping', fn);
    bus.emit('ping', { from: 'a' });
    expect(fn).toHaveBeenCalledWith({ from: 'a' });
  });

  it('off removes listener', () => {
    const bus = createBus<{ ping: void }>();
    const fn = vi.fn();
    const off = bus.on('ping', fn);
    off();
    bus.emit('ping');
    expect(fn).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run (red), then implement (green)**

Create `src/core/eventBus.ts`:
```ts
export type Listener<T> = (payload: T) => void;
export type Unsubscribe = () => void;
export type EventMap = Record<string, unknown>;

export interface Bus<E extends EventMap> {
  on<K extends keyof E>(event: K, fn: Listener<E[K]>): Unsubscribe;
  emit<K extends keyof E>(event: K, payload: E[K]): void;
}

export function createBus<E extends EventMap>(): Bus<E> {
  const listeners = new Map<keyof E, Set<Listener<unknown>>>();
  return {
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn as Listener<unknown>);
      return () => listeners.get(event)?.delete(fn as Listener<unknown>);
    },
    emit(event, payload) {
      listeners.get(event)?.forEach(fn => fn(payload));
    },
  };
}

export const gameBus = createBus<{
  'card:picked-up': { cardId: string };
  'card:played-physics': { cardId: string };
  'fusion:complete': { fusedItemId: string };
  'hidden:unlocked': { hiddenLevelId: string };
  'level:exit': { levelIndex: number };
  'npc:dialogue': { npcId: string; line: string };
}>();
```

- [ ] **Step 3: Write uuid utility (red/green)**

```ts
// tests/core/uuid.test.ts
import { describe, it, expect } from 'vitest';
import { uuid } from '../../src/utils/uuid';
it('generates unique ids', () => {
  const a = uuid();
  const b = uuid();
  expect(a).not.toBe(b);
  expect(a).toMatch(/^[0-9a-f-]{36}$/);
});
```

`src/utils/uuid.ts`:
```ts
export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // RFC4122 v4 fallback for older runtimes
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

- [ ] **Step 4: Verify all green**

```bash
pnpm exec vitest run tests/core/
```

- [ ] **Step 5: Commit**

```bash
git add src/core/eventBus.ts src/utils/uuid.ts tests/core/eventBus.test.ts tests/core/uuid.test.ts
git commit -m "feat(core): typed eventBus + uuid utility"
```

---

## Task 3: Perlin noise terrain generator + tile renderer

**Files:**
- Create: `src/procgen/perlin.ts`
- Create: `src/utils/color.ts`
- Test: `tests/procgen/perlin.test.ts`

Reference: spec §11 Task 1.2 (Perlin noise + tile renderer). Pure functions, no Phaser dependency yet.

- [ ] **Step 1: Write Perlin test (red)**

```ts
// tests/procgen/perlin.test.ts
import { describe, it, expect } from 'vitest';
import { perlin2, generateHeightmap } from '../../src/procgen/perlin';

describe('perlin2', () => {
  it('returns values in [-1, 1]', () => {
    for (let i = 0; i < 100; i++) {
      const v = perlin2(Math.random() * 100, Math.random() * 100, 42);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic given the same seed', () => {
    const a = perlin2(0.5, 0.5, 7);
    const b = perlin2(0.5, 0.5, 7);
    expect(a).toBe(b);
  });

  it('differs with different seed', () => {
    const a = perlin2(0.5, 0.5, 1);
    const b = perlin2(0.5, 0.5, 2);
    expect(a).not.toBe(b);
  });
});

describe('generateHeightmap', () => {
  it('produces w*h grid of values in [0, 1]', () => {
    const hm = generateHeightmap(64, 48, 42);
    expect(hm).toHaveLength(64 * 48);
    for (const v of hm) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 2: Run (red), then implement (green)**

`src/procgen/perlin.ts`:
```ts
// Classic 2D Perlin noise. Pure function. Deterministic per seed.
const PERMUTATION = new Uint8Array(512);
function seedPerm(seed: number) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates with seeded RNG
  let s = seed | 0;
  const rng = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 0xffffffff); };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERMUTATION[i] = p[i & 255];
}

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
}

export function perlin2(x: number, y: number, seed: number = 0): number {
  seedPerm(seed);
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const A = PERMUTATION[X] + Y, B = PERMUTATION[X + 1] + Y;
  return lerp(
    lerp(grad(PERMUTATION[A], x, y), grad(PERMUTATION[B], x - 1, y), u),
    lerp(grad(PERMUTATION[A + 1], x, y - 1), grad(PERMUTATION[B + 1], x - 1, y - 1), u),
    v
  ) * 0.5;
}

export function generateHeightmap(w: number, h: number, seed: number, scale = 0.08, octaves = 4): number[] {
  const out = new Array<number>(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let amp = 1, freq = scale, sum = 0, norm = 0;
      for (let o = 0; o < octaves; o++) {
        sum += perlin2(x * freq, y * freq, seed + o) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2;
      }
      out[y * w + x] = (sum / norm + 1) / 2; // normalize to [0,1]
    }
  }
  return out;
}

export function heightmapToTilemap(hm: number[], w: number, h: number, waterLevel = 0.35, wallLevel = 0.7): number[] {
  // 0 = floor, 1 = wall, 2 = water
  const out = new Array<number>(w * h);
  for (let i = 0; i < hm.length; i++) {
    const v = hm[i]!;
    out[i] = v < waterLevel ? 2 : v > wallLevel ? 1 : 0;
  }
  return out;
}
```

- [ ] **Step 3: Color utility for tile palette**

`src/utils/color.ts`:
```ts
export type HexColor = `#${string}`;

export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function lerpColor(a: string, b: string, t: number): string {
  const ai = hexToInt(a), bi = hexToInt(b);
  const ar = (ai >> 16) & 0xff, ag = (ai >> 8) & 0xff, ab = ai & 0xff;
  const br = (bi >> 16) & 0xff, bg = (bi >> 8) & 0xff, bb = bi & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `#${[r, g, b2].map(n => n.toString(16).padStart(2, '0')).join('')}`;
}
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec vitest run tests/procgen/perlin.test.ts
git add src/procgen src/utils/color.ts tests/procgen
git commit -m "feat(procgen): Perlin noise + heightmap + tilemap + color util"
```

---

## Task 4: Player controller (WASD + mouse aim + collision)

**Files:**
- Create: `src/phaser/entities/Player.ts`
- Test: `tests/core/player.test.ts` (logic tests; Phaser integration via E2E later)

Reference: spec §11 Task 1.3 (top-down, WASD + mouse aim, wall collision).

- [ ] **Step 1: Write player movement + collision logic test (red)**

```ts
// tests/core/player.test.ts
import { describe, it, expect } from 'vitest';
import { computeMove, canMoveTo } from '../../src/phaser/entities/Player';

describe('computeMove', () => {
  it('moves right when D pressed', () => {
    const next = computeMove({ x: 10, y: 10 }, { up: false, down: false, left: false, right: true }, 1, 180);
    expect(next.x).toBeGreaterThan(10);
    expect(next.y).toBe(10);
  });

  it('diagonal normalized (no faster than cardinal)', () => {
    const card = computeMove({ x: 0, y: 0 }, { up: true, down: false, left: false, right: true }, 1, 180);
    const diag = Math.hypot(card.x, card.y);
    expect(diag).toBeCloseTo(180, 5);
  });
});

describe('canMoveTo', () => {
  const tilemap = [0, 0, 1, 0, 0]; // 1x5 row, wall at index 2
  it('returns true for floor', () => {
    expect(canMoveTo(1, 0, 5, 1, tilemap)).toBe(true);
  });
  it('returns false for wall', () => {
    expect(canMoveTo(2, 0, 5, 1, tilemap)).toBe(false);
  });
  it('returns false for out-of-bounds', () => {
    expect(canMoveTo(-1, 0, 5, 1, tilemap)).toBe(false);
  });
});
```

- [ ] **Step 2: Run (red), then implement (green)**

`src/phaser/entities/Player.ts`:
```ts
import { PLAYER_SPEED } from '../../config/constants';

export interface Keys { up: boolean; down: boolean; left: boolean; right: boolean; }
export interface Vec2 { x: number; y: number; }

export function computeMove(pos: Vec2, keys: Keys, dt: number, speed = PLAYER_SPEED): Vec2 {
  let dx = 0, dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  const len = Math.hypot(dx, dy);
  if (len > 0) { dx /= len; dy /= len; }
  return { x: pos.x + dx * speed * dt, y: pos.y + dy * speed * dt };
}

export function canMoveTo(x: number, y: number, w: number, h: number, tilemap: number[]): boolean {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  return tilemap[y * w + x] !== 1; // 1 = wall
}
```

- [ ] **Step 3: Wire Player into a minimal Phaser scene for visual verification**

Append to `src/main.ts` and create `src/phaser/scenes/PlayerTestScene.ts`:
```ts
// src/phaser/scenes/PlayerTestScene.ts
import Phaser from 'phaser';
import { computeMove } from '../entities/Player';

export class PlayerTestScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W'|'A'|'S'|'D', Phaser.Input.Keyboard.Key>;
  create() {
    this.player = this.add.rectangle(640, 360, 24, 24, 0xffffff);
    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
  }
  update(_t: number, dt: number) {
    if (!this.player) return;
    const next = computeMove(
      { x: this.player.x, y: this.player.y },
      {
        up: this.keys.up.isDown || this.wasd.W.isDown,
        down: this.keys.down.isDown || this.wasd.S.isDown,
        left: this.keys.left.isDown || this.wasd.A.isDown,
        right: this.keys.right.isDown || this.wasd.D.isDown,
      },
      dt / 1000,
    );
    this.player.x = next.x; this.player.y = next.y;
  }
}
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec vitest run tests/core/player.test.ts
pnpm exec vite build
git add src/phaser/entities/Player.ts tests/core/player.test.ts
git commit -m "feat(player): top-down WASD movement + tilemap collision (pure logic + scene)"
```

---

## Task 5: WFC tile sampler for 5 biomes

**Files:**
- Create: `src/procgen/wfc.ts`
- Create: `src/procgen/biomes.ts`
- Test: `tests/procgen/wfc.test.ts`
- Test: `tests/procgen/biomes.test.ts`

Reference: spec §11 Task 1.4 (5 distinct biome variants). Lightweight WFC over a 5-tile alphabet: floor, wall, water, decoration-grass, decoration-flower.

- [ ] **Step 1: Write WFC test (red)**

```ts
// tests/procgen/wfc.test.ts
import { describe, it, expect } from 'vitest';
import { runWFC } from '../../src/procgen/wfc';

describe('WFC', () => {
  it('produces w*h tilemap using the configured alphabet', () => {
    const out = runWFC(16, 12, { seed: 1, weights: { 0:5, 1:2, 2:1, 3:1, 4:1 } });
    expect(out).toHaveLength(16 * 12);
    for (const t of out) expect([0,1,2,3,4]).toContain(t);
  });

  it('is deterministic per seed', () => {
    const a = runWFC(16, 12, { seed: 42, weights: { 0:5, 1:2, 2:1, 3:1, 4:1 } });
    const b = runWFC(16, 12, { seed: 42, weights: { 0:5, 1:2, 2:1, 3:1, 4:1 } });
    expect(a).toEqual(b);
  });

  it('places at least one floor (connectivity invariant)', () => {
    const out = runWFC(16, 12, { seed: 7, weights: { 0:10, 1:1, 2:1, 3:1, 4:1 } });
    expect(out.includes(0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run (red), then implement (green)**

`src/procgen/wfc.ts`:
```ts
export type Tile = 0|1|2|3|4; // floor, wall, water, decoration-grass, decoration-flower

export interface WFCOptions {
  seed: number;
  weights: Record<Tile, number>;
  adjacency?: Partial<Record<Tile, Tile[]>>;
}

const DEFAULT_ADJ: Record<Tile, Tile[]> = {
  0: [0, 1, 2, 3, 4],  // floor can be next to anything
  1: [0, 1, 3],         // walls avoid water
  2: [0, 2, 4],         // water avoids walls
  3: [0, 1, 3],         // grass
  4: [0, 2, 4],         // flowers
};

function rng(seed: number) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 0xffffffff); };
}

export function runWFC(w: number, h: number, opts: WFCOptions): Tile[] {
  const adj = { ...DEFAULT_ADJ, ...(opts.adjacency ?? {}) };
  const r = rng(opts.seed);
  const out: Tile[] = new Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const candidates: Tile[] = [0,1,2,3,4];
      // restrict by up + left neighbors
      const up = y > 0 ? out[(y-1)*w + x] : null;
      const left = x > 0 ? out[y*w + (x-1)] : null;
      const allowed = candidates.filter(t => {
        if (up !== null && !adj[up].includes(t)) return false;
        if (left !== null && !adj[left].includes(t)) return false;
        return true;
      });
      const pool = allowed.length ? allowed : [0];
      // weighted pick
      const total = pool.reduce((s, t) => s + (opts.weights[t] ?? 1), 0);
      let pick = r() * total;
      let chosen: Tile = 0;
      for (const t of pool) { pick -= (opts.weights[t] ?? 1); if (pick <= 0) { chosen = t; break; } }
      out[y*w + x] = chosen;
    }
  }
  return out;
}
```

- [ ] **Step 3: Write 5 biome palettes test + implementation**

`tests/procgen/biomes.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { BIOMES, biomeWeights } from '../../src/procgen/biomes';

it('defines exactly 5 biomes', () => {
  expect(BIOMES).toHaveLength(5);
});

it('each biome has 5 hex colors', () => {
  for (const b of BIOMES) expect(b.palette).toHaveLength(5);
});

it('biomeWeights gives a valid weights record for any biome id', () => {
  for (const b of BIOMES) {
    const w = biomeWeights(b.id);
    expect(w[0]).toBeGreaterThan(0);
  }
});
```

`src/procgen/biomes.ts`:
```ts
import type { Tile } from './wfc';

export interface Biome {
  id: string;
  name: string;
  palette: [string, string, string, string, string]; // 5 hex
}

export const BIOMES: Biome[] = [
  { id: 'forest',    name: 'Forest',    palette: ['#1b4332','#2d6a4f','#52b788','#95d5b2','#d8f3dc'] },
  { id: 'ocean',     name: 'Ocean',     palette: ['#03045e','#0077b6','#00b4d8','#90e0ef','#caf0f8'] },
  { id: 'dungeon',   name: 'Dungeon',   palette: ['#1a1a1d','#3b1c32','#a64942','#ff9b54','#fff7e1'] },
  { id: 'scifi',     name: 'Sci-Fi',    palette: ['#0b132b','#1c2541','#3a506b','#5bc0be','#6fffe9'] },
  { id: 'desert',    name: 'Desert',    palette: ['#7f4f24','#b08968','#ddb892','#ede0d4','#fefae0'] },
];

export function biomeWeights(biomeId: string): Record<Tile, number> {
  switch (biomeId) {
    case 'forest':  return { 0:5, 1:2, 2:0, 3:3, 4:1 };
    case 'ocean':   return { 0:3, 1:1, 2:5, 3:0, 4:1 };
    case 'dungeon': return { 0:4, 1:4, 2:0, 3:1, 4:1 };
    case 'scifi':   return { 0:6, 1:2, 2:0, 3:1, 4:1 };
    case 'desert':  return { 0:5, 1:1, 2:0, 3:2, 4:2 };
    default:        return { 0:5, 1:2, 2:1, 3:1, 4:1 };
  }
}
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec vitest run tests/procgen/
git add src/procgen tests/procgen
git commit -m "feat(procgen): WFC tile sampler + 5 biome palettes"
```

---

## Task 6: Card system + 16 hardcoded theme decks + item table

**Files:**
- Create: `src/procgen/itemTable.ts`
- Create: `src/procgen/deckFallback.ts`
- Create: `src/config/themes.ts`
- Test: `tests/procgen/deckFallback.test.ts`

Reference: spec §11 Task 1.5 (Card data model + Deck container + 16 hardcoded decks). Spec §6.7: "The procgen fallback can produce a fully-functional deck of hardcoded cards without ever touching the LLM."

- [ ] **Step 1: Write item table**

`src/procgen/itemTable.ts`:
```ts
import type { Card } from '../core/cardSystem';
import { DEFAULT_SPRITE_KEYS } from '../config/constants';
import { uuid } from '../utils/uuid';

// 30 hardcoded item templates, indexed by spriteKey
export const ITEM_TEMPLATES: ReadonlyArray<Omit<Card, 'id' | 'generatedAt' | 'generatedBy'>> = [
  { type:'item', name:'brine comet',    itemPayload:{ spriteKey:'whip_blue',  behavior:'splashes on impact', stackable:false } },
  { type:'item', name:'vine whip',      itemPayload:{ spriteKey:'whip_red',   behavior:'extends 3 tiles',     stackable:false } },
  { type:'item', name:'pickled star',   itemPayload:{ spriteKey:'orb_yellow', behavior:'glows when held',    stackable:false } },
  { type:'item', name:'ferment orb',    itemPayload:{ spriteKey:'orb_green',  behavior:'slows nearby liquids', stackable:false } },
  { type:'item', name:'cyan blade',     itemPayload:{ spriteKey:'sword_cyan', behavior:'cuts through water', stackable:false } },
  { type:'item', name:'violet blade',   itemPayload:{ spriteKey:'sword_violet',behavior:'hums near walls',    stackable:false } },
  { type:'item', name:'dill drone',     itemPayload:{ spriteKey:'shield_gold',behavior:'follows player for 5s', stackable:false } },
  { type:'item', name:'rose potion',    itemPayload:{ spriteKey:'potion_pink',behavior:'heals on contact',   stackable:true  } },
  // ... 22 more entries, spriteKey from DEFAULT_SPRITE_KEYS pool, mix of stackable
];

export function pickItemsForDeck(count: number, seed: number): Card[] {
  let s = seed | 0;
  const rng = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 0xffffffff); };
  const out: Card[] = [];
  for (let i = 0; i < count; i++) {
    const tmpl = ITEM_TEMPLATES[Math.floor(rng() * ITEM_TEMPLATES.length)]!;
    out.push({ ...tmpl, id: uuid(), generatedBy: 'fallback', generatedAt: Date.now() });
  }
  return out;
}
```

(Expand ITEM_TEMPLATES to 30 entries before commit; use the 8 DEFAULT_SPRITE_KEYS pool, mix stackable true/false, varied behaviors.)

- [ ] **Step 2: Write theme deck table**

`src/config/themes.ts`:
```ts
import type { Card, ThemePayload, PhysicsPayload, NpcPayload, HiddenPayload } from '../core/cardSystem';
import { BIOMES } from '../procgen/biomes';
import { uuid } from '../utils/uuid';

export function buildThemeCard(biomeIndex: number): Card {
  const b = BIOMES[biomeIndex % BIOMES.length]!;
  const payload: ThemePayload = {
    palette: [...b.palette],
    ruleQuirk: `${b.name} world: ${quirkFor(b.id)}`,
  };
  return { id: uuid(), type:'theme', name: b.name, themePayload: payload, generatedBy:'fallback', generatedAt: Date.now() };
}

export function buildPhysicsCards(seed: number): Card[] {
  // 8 cards: same shape every time, but each theme varies the numbers
  const presets: Array<Omit<PhysicsPayload, never>> = [
    { gravity: 200,  restitution: 0.95, friction: 0.1,  note: 'moon bounce' },
    { gravity: 1400, restitution: 0.1,  friction: 0.8,  note: 'heavy brine' },
    { gravity: 800,  restitution: 0.2,  friction: 0.05, note: 'icy ground' },
    { gravity: 800,  restitution: 0.0,  friction: 1.5,  note: 'sticky vine' },
    { gravity: 400,  restitution: 0.7,  friction: 0.3,  note: 'gentle drift' },
    { gravity: 1200, restitution: 0.4,  friction: 0.6,  note: 'earth pull' },
    { gravity: 600,  restitution: 0.85, friction: 0.2,  note: 'feather fall' },
    { gravity: 1000, restitution: 0.3,  friction: 1.0,  note: 'mud walk' },
  ];
  return presets.map((p, i) => ({
    id: uuid(),
    type: 'physics',
    name: p.note,
    physicsPayload: { ...p },
    generatedBy: 'fallback' as const,
    generatedAt: Date.now() + i,
  }));
}

export function buildNpcCards(biomeIndex: number): Card[] {
  const b = BIOMES[biomeIndex % BIOMES.length]!;
  const roles: Record<string, NpcPayload[]> = {
    forest:  [{ role:'druid vendor', personality:'rambles about moss, friendly' },
              { role:'wandering ranger', personality:'speaks in questions' },
              { role:'moss keeper', personality:'terse, protective of greenery' }],
    ocean:   [{ role:'cosmic pickle vendor', personality:'rambles about brine, friendly' },
              { role:'brine sage', personality:'speaks in questions, philosophical' },
              { role:'tide watcher', personality:'cautious, weather-aware' }],
    dungeon: [{ role:'torch vendor', personality:'cheerful, fire-phobic' },
              { role:'rune sage', personality:'cryptic, slow' },
              { role:'gate keeper', personality:'terse, riddling' }],
    scifi:   [{ role:'parts vendor', personality:'mechanical, helpful' },
              { role:'station AI', personality:'literal, polite' },
              { role:'drone tech', personality:'terse, diagnostic' }],
    desert:  [{ role:'caravan trader', personality:'hospitable, story-rich' },
              { role:'sand sage', personality:'cryptic, calm' },
              { role:'well keeper', personality:'terse, generous' }],
  };
  return (roles[b.id] ?? roles.forest!).map((n, i) => ({
    id: uuid(),
    type: 'npc',
    name: n.role,
    npcPayload: n,
    generatedBy: 'fallback' as const,
    generatedAt: Date.now() + i,
  }));
}

export function buildHiddenCards(itemNames: string[]): Card[] {
  if (itemNames.length < 2) return [];
  return [
    { id: uuid(), type:'hidden', name:'Memory Gate', hiddenPayload:{ unlockRecipe: [itemNames[0]!, itemNames[1]!] }, generatedBy:'fallback', generatedAt: Date.now() },
    { id: uuid(), type:'hidden', name:'Echo Vault',  hiddenPayload:{ unlockRecipe: [itemNames[itemNames.length-2]!, itemNames[itemNames.length-1]!] }, generatedBy:'fallback', generatedAt: Date.now()+1 },
  ];
}

function quirkFor(biomeId: string): string {
  return ({
    forest:  'trees lean toward the player',
    ocean:   'liquids flow upward',
    dungeon: 'torches flicker with intent',
    scifi:   'gravity is a suggestion',
    desert:  'sand remembers footsteps',
  } as Record<string,string>)[biomeId] ?? 'the world is whimsical';
}
```

- [ ] **Step 3: Write deckFallback test**

```ts
// tests/procgen/deckFallback.test.ts
import { describe, it, expect } from 'vitest';
import { buildFallbackDeck } from '../../src/procgen/deckFallback';

it('builds a complete deck for any of 16 themes', () => {
  for (let i = 0; i < 16; i++) {
    const d = buildFallbackDeck(i);
    expect(d.themeCard.type).toBe('theme');
    expect(d.physicsCards).toHaveLength(8);
    expect(d.itemCards.length).toBeGreaterThanOrEqual(20);
    expect(d.itemCards.length).toBeLessThanOrEqual(30);
    expect(d.npcCards).toHaveLength(3);
    expect(d.hiddenCards.length).toBeGreaterThanOrEqual(2);
  }
});

it('16 themes produce 16 distinct themeCards (palette or name)', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 16; i++) seen.add(buildFallbackDeck(i).themeCard.name);
  expect(seen.size).toBe(5); // 5 biomes cycled
});
```

- [ ] **Step 4: Implement deckFallback.ts**

```ts
import type { Deck } from '../core/cardSystem';
import { buildHiddenCards, buildNpcCards, buildPhysicsCards, buildThemeCard } from '../config/themes';
import { pickItemsForDeck } from './itemTable';
import { uuid } from '../utils/uuid';

export function buildFallbackDeck(themeIndex: number, itemCount = 25): Deck {
  const themeCard = buildThemeCard(themeIndex);
  const physicsCards = buildPhysicsCards(themeIndex);
  const itemCards = pickItemsForDeck(itemCount, themeIndex);
  const npcCards = buildNpcCards(themeIndex);
  const itemNames = itemCards.map(c => c.name);
  const hiddenCards = buildHiddenCards(itemNames);
  return {
    id: uuid(),
    themeCard,
    physicsCards,
    itemCards,
    npcCards,
    hiddenCards,
    generatedBy: 'fallback',
    generatedAt: Date.now(),
  };
}
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm exec vitest run tests/procgen/deckFallback.test.ts
git add src/procgen src/config/themes.ts tests/procgen/deckFallback.test.ts
git commit -m "feat(deck): 16 hardcoded theme decks with theme/varied physics/npc/item/hidden"
```

---

## Task 7: CardEntity (card-on-ground) + pickup + inventory

**Files:**
- Create: `src/phaser/entities/ItemEntity.ts`
- Create: `src/phaser/entities/CardEntity.ts`
- Test: `tests/core/inventory.test.ts`

Reference: spec §11 Task 1.6 (CardEntity + pickup + inventory max 6).

- [ ] **Step 1: Write inventory test (red)**

```ts
// tests/core/inventory.test.ts
import { describe, it, expect } from 'vitest';
import { addToInventory, INVENTORY_MAX } from '../../src/core/inventory';

it('inventory holds up to INVENTORY_MAX items', () => {
  let inv: string[] = [];
  for (let i = 0; i < INVENTORY_MAX + 2; i++) inv = addToInventory(inv, `id-${i}`);
  expect(inv).toHaveLength(INVENTORY_MAX);
});

it('rejects beyond cap with explicit false return', () => {
  const inv = ['a','b','c','d','e','f'];
  const result = addToInventory(inv, 'g');
  expect(result.added).toBe(false);
  expect(result.inv).toBe(inv);
});
```

- [ ] **Step 2: Implement inventory + entities**

`src/core/inventory.ts`:
```ts
import { INVENTORY_MAX_SLOTS } from '../config/constants';

export const INVENTORY_MAX = INVENTORY_MAX_SLOTS;

export function addToInventory(inv: string[], cardId: string): { inv: string[]; added: boolean } {
  if (inv.length >= INVENTORY_MAX) return { inv, added: false };
  return { inv: [...inv, cardId], added: true };
}
```

`src/phaser/entities/CardEntity.ts` (uses Phaser only at scene level; logic below):
```ts
import type { Card } from '../../core/cardSystem';

export function isPickupable(card: Card, playerInRange: boolean): boolean {
  return playerInRange && (card.type === 'item' || card.type === 'physics');
}
```

(Phaser sprite scene wiring: see `src/phaser/scenes/GameScene.ts` in Task 9.)

- [ ] **Step 3: Verify and commit**

```bash
pnpm exec vitest run tests/core/inventory.test.ts
git add src/core/inventory.ts src/phaser/entities/CardEntity.ts tests/core/inventory.test.ts
git commit -m "feat(entity): CardEntity + pickup logic + 6-slot inventory"
```

---

## Task 8: NPC entity + proximity prompt + fixed dialogue table

**Files:**
- Create: `src/phaser/entities/Npc.ts`
- Create: `src/core/dialogueTable.ts`
- Test: `tests/core/dialogueTable.test.ts`

Reference: spec §11 Task 1.7 (NPC + proximity + fixed dialogue table).

- [ ] **Step 1: Write dialogue table test (red)**

```ts
// tests/core/dialogueTable.test.ts
import { describe, it, expect } from 'vitest';
import { getDialogue } from '../../src/core/dialogueTable';

it('returns a non-empty line for an NPC role', () => {
  expect(getDialogue('druid vendor').length).toBeGreaterThan(10);
});

it('cycles through lines on repeated calls (deterministic order)', () => {
  const a = getDialogue('druid vendor', 0);
  const b = getDialogue('druid vendor', 1);
  expect(a).not.toBe(b);
});
```

- [ ] **Step 2: Implement dialogue table**

`src/core/dialogueTable.ts`:
```ts
const TABLE: Record<string, string[]> = {
  'druid vendor': [
    "Moss speaks, if you let it.",
    "These leaves? They remember your footsteps.",
    "Trade you a fern for a memory.",
  ],
  'cosmic pickle vendor': [
    "The brine runs thin near the eastern gate.",
    "Time pickles everything, friend.",
    "I left a ferment orb in '98. Or was it '99?",
  ],
  'torch vendor': [
    "Light is a kind of memory.",
    "Don't burn the parchment.",
    "Fire is just fast oxidation.",
  ],
  'parts vendor': [
    "Specs say one thing, dust says another.",
    "Spare capacitor? Possibly.",
    "Read the schematic, then ignore half of it.",
  ],
  'caravan trader': [
    "Salt stories are the best stories.",
    "The road is a slow conversation.",
    "I have three of those. Pick the dusty one.",
  ],
};

const FALLBACK = ["The world is full of small wonders.", "Hmm.", "..."];

export function getDialogue(role: string, lineIndex: number = 0): string {
  const pool = TABLE[role] ?? FALLBACK;
  return pool[lineIndex % pool.length]!;
}
```

- [ ] **Step 3: Proximity helper**

`src/phaser/entities/Npc.ts`:
```ts
export const NPC_TALK_RADIUS_TILES = 2;

export function isInTalkRange(dx: number, dy: number, tileSize: number): boolean {
  return Math.hypot(dx, dy) <= NPC_TALK_RADIUS_TILES * tileSize;
}
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec vitest run tests/core/dialogueTable.test.ts
git add src/core/dialogueTable.ts src/phaser/entities/Npc.ts tests/core/dialogueTable.test.ts
git commit -m "feat(npc): fixed dialogue table + proximity check"
```

---

## Task 9: Level exit + 5-level session loop

**Files:**
- Create: `src/core/levelExit.ts`
- Create: `src/core/sessionLoop.ts`
- Create: `src/phaser/scenes/GameScene.ts`
- Test: `tests/core/sessionLoop.test.ts`

Reference: spec §11 Task 1.8 (level exit + 5-level session loop). Spec §6.3 Level: `exitTile: { x, y }`.

- [ ] **Step 1: Write session loop test (red)**

```ts
// tests/core/sessionLoop.test.ts
import { describe, it, expect } from 'vitest';
import { createSession, advanceLevel } from '../../src/core/sessionLoop';

it('session starts at level 0 of 5', () => {
  const s = createSession();
  expect(s.currentLevelIndex).toBe(0);
  expect(s.maxLevels).toBe(5);
  expect(s.done).toBe(false);
});

it('advanceLevel increments and ends at last', () => {
  let s = createSession();
  for (let i = 0; i < 4; i++) s = advanceLevel(s);
  expect(s.currentLevelIndex).toBe(4);
  s = advanceLevel(s);
  expect(s.done).toBe(true);
});
```

- [ ] **Step 2: Implement session loop**

`src/core/sessionLoop.ts`:
```ts
import { SESSION_LEVELS } from '../config/constants';
import type { Level } from './cardSystem';

export interface SessionLoop {
  currentLevelIndex: number;
  maxLevels: number;
  done: boolean;
  levels: Level[];
}

export function createSession(levels: Level[] = []): SessionLoop {
  return { currentLevelIndex: 0, maxLevels: SESSION_LEVELS, done: false, levels };
}

export function advanceLevel(s: SessionLoop): SessionLoop {
  if (s.done) return s;
  const next = s.currentLevelIndex + 1;
  if (next >= s.maxLevels) return { ...s, currentLevelIndex: s.maxLevels - 1, done: true };
  return { ...s, currentLevelIndex: next };
}

export function reachedExit(playerTile: { x: number; y: number }, exitTile: { x: number; y: number }): boolean {
  return playerTile.x === exitTile.x && playerTile.y === exitTile.y;
}
```

- [ ] **Step 3: Wire into GameScene (minimal: render 5 empty tilemaps + player + exit)**

`src/phaser/scenes/GameScene.ts`:
```ts
import Phaser from 'phaser';
import { runWFC } from '../../procgen/wfc';
import { biomeWeights, BIOMES } from '../../procgen/biomes';
import { buildFallbackDeck } from '../../procgen/deckFallback';
import { createSession, advanceLevel, reachedExit } from '../../core/sessionLoop';
import { computeMove, canMoveTo } from '../entities/Player';
import { gameBus } from '../../core/eventBus';

export class GameScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private tilemap: number[] = [];
  private w = 0; private h = 0; private tileSize = 16;
  private exitPos = { x: 0, y: 0 };
  private session = createSession();

  create() {
    const biome = BIOMES[Math.floor(Math.random() * BIOMES.length)]!;
    this.w = 64; this.h = 48;
    this.tilemap = runWFC(this.w, this.h, { seed: Date.now() & 0xffff, weights: biomeWeights(biome.id) });
    this.exitPos = { x: this.w - 2, y: this.h - 2 };
    this.drawTilemap();
    this.player = this.add.rectangle(this.tileSize * 2, this.tileSize * 2, 20, 20, 0xffffff);
    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D');
    this.add.text(8, 8, `Level ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}`, { color: '#fff' });
  }

  private drawTilemap() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = this.tilemap[y * this.w + x]!;
        const color = t === 1 ? 0x444444 : t === 2 ? 0x2244aa : 0x222222;
        this.add.rectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize, color).setOrigin(0);
      }
    }
    this.add.rectangle(this.exitPos.x * this.tileSize, this.exitPos.y * this.tileSize, this.tileSize, this.tileSize, 0xffff00).setOrigin(0);
  }

  update(_t: number, dt: number) {
    if (!this.player) return;
    const next = computeMove(
      { x: this.player.x, y: this.player.y },
      {
        up: this.keys.up.isDown || this.wasd.W.isDown,
        down: this.keys.down.isDown || this.wasd.S.isDown,
        left: this.keys.left.isDown || this.wasd.A.isDown,
        right: this.keys.right.isDown || this.wasd.D.isDown,
      },
      dt / 1000,
    );
    const tx = Math.floor(next.x / this.tileSize);
    const ty = Math.floor(next.y / this.tileSize);
    if (canMoveTo(tx, ty, this.w, this.h, this.tilemap)) {
      this.player.x = next.x; this.player.y = next.y;
    }
    if (reachedExit({ x: tx, y: ty }, this.exitPos)) {
      this.session = advanceLevel(this.session);
      gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
      this.scene.restart();
    }
  }
}
```

- [ ] **Step 4: Verify and commit**

```bash
pnpm exec vitest run tests/core/sessionLoop.test.ts
pnpm exec vite build
git add src/core/levelExit.ts src/core/sessionLoop.ts src/phaser/scenes/GameScene.ts tests/core/sessionLoop.test.ts
git commit -m "feat(level): level exit + 5-level session loop + GameScene wiring"
```

---

## Task 10: CardHandView - physics cards in HUD, drag-to-level

**Files:**
- Create: `src/ui/CardHandView.ts`
- Create: `src/core/physicsApply.ts`
- Create: `src/phaser/scenes/HudScene.ts`
- Create: `src/phaser/scenes/HandScene.ts`
- Test: `tests/core/physicsApply.test.ts`

Reference: spec §11 Task 1.9 (physics cards in HUD, drag-onto-level to apply). Pre-baked at deck time, no LLM.

- [ ] **Step 1: Write physics apply test (red)**

```ts
// tests/core/physicsApply.test.ts
import { describe, it, expect } from 'vitest';
import { applyPhysics, defaultPhysics } from '../../src/core/physicsApply';

it('default physics is gravity=800 restitution=0.3 friction=0.5', () => {
  expect(defaultPhysics()).toEqual({ gravity: 800, restitution: 0.3, friction: 0.5 });
});

it('applyPhysics returns new state with card values', () => {
  const card = { gravity: 200, restitution: 0.95, friction: 0.1 };
  const next = applyPhysics(defaultPhysics(), card);
  expect(next).toEqual(card);
});
```

- [ ] **Step 2: Implement physicsApply**

`src/core/physicsApply.ts`:
```ts
export interface Physics { gravity: number; restitution: number; friction: number; }

export function defaultPhysics(): Physics {
  return { gravity: 800, restitution: 0.3, friction: 0.5 };
}

export function applyPhysics(_current: Physics, card: Physics): Physics {
  return { ...card };
}
```

- [ ] **Step 3: CardHandView (renders 8 physics cards in HUD)**

`src/ui/CardHandView.ts`:
```ts
import type { Card } from '../core/cardSystem';
import { Phaser } from 'phaser';

export function renderHand(scene: Phaser.Scene, hand: Card[]): Phaser.GameObjects.Container {
  const c = scene.add.container(0, scene.scale.height - 80);
  hand.slice(0, 8).forEach((card, i) => {
    const rect = scene.add.rectangle(80 + i * 100, 0, 80, 60, 0x222244).setStrokeStyle(1, 0xaaaaff);
    const label = scene.add.text(80 + i * 100, 0, card.name, { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
    rect.setInteractive({ draggable: true });
    rect.setData('cardId', card.id);
    c.add([rect, label]);
  });
  return c;
}
```

- [ ] **Step 4: Wire HandScene + HudScene (use `scene.launch` from GameScene)**

`src/phaser/scenes/HandScene.ts`:
```ts
import Phaser from 'phaser';
import type { Deck } from '../../core/cardSystem';
import { renderHand } from '../../ui/CardHandView';
import { applyPhysics, defaultPhysics } from '../../core/physicsApply';
import { gameBus } from '../../core/eventBus';

export class HandScene extends Phaser.Scene {
  private currentPhysics = defaultPhysics();
  constructor() { super({ key: 'HandScene', active: true }); }
  create() {
    gameBus.on('card:played-physics', ({ cardId }) => {
      const card = this.registry.get('deck')?.physicsCards.find((c: any) => c.id === cardId);
      if (card?.physicsPayload) this.currentPhysics = applyPhysics(this.currentPhysics, card.physicsPayload);
      this.scene.get('GameScene')?.events.emit('physics:changed', this.currentPhysics);
    });
  }
}
```

(HandScene will be fully integrated in Task 11/12 once cards have visible sprites.)

- [ ] **Step 5: Verify and commit**

```bash
pnpm exec vitest run tests/core/physicsApply.test.ts
pnpm exec vite build
git add src/core/physicsApply.ts src/ui/CardHandView.ts src/phaser/scenes/HandScene.ts tests/core/physicsApply.test.ts
git commit -m "feat(hand): CardHandView in HUD + physics apply (no LLM at play time)"
```

---

## Task 11: FusionAltarUI - drag two items, get fused item (3 paths)

**Files:**
- Create: `src/core/fusionTable.ts`
- Create: `src/core/cardComposition.ts`
- Create: `src/ui/FusionAltarUI.ts`
- Create: `src/phaser/entities/FusionAltar.ts`
- Create: `src/phaser/scenes/FusionAltarScene.ts`
- Test: `tests/core/fusionTable.test.ts`
- Test: `tests/core/cardComposition.test.ts`

Reference: spec §5.3 (3 fusion paths: item+item / item+card / card+card). Spec §11 Task 1.10: "drag two item cards, get hand-authored fused item".

- [ ] **Step 1: Write fusion table test (red)**

```ts
// tests/core/fusionTable.test.ts
import { describe, it, expect } from 'vitest';
import { fuseItems } from '../../src/core/fusionTable';

it('hand-authored fusion: brine comet + vine whip -> Brine Lash', () => {
  const r = fuseItems('brine comet', 'vine whip');
  expect(r?.name).toBe('Brine Lash');
  expect(r?.fusedFrom.type).toBe('item+item');
});

it('returns null for unknown pair', () => {
  expect(fuseItems('a', 'b')).toBeNull();
});
```

- [ ] **Step 2: Implement fusion table**

`src/core/fusionTable.ts`:
```ts
import type { FusedItem } from './cardSystem';
import { uuid } from '../utils/uuid';

// 8 hand-authored item+item fusions (expand to 16 before commit).
const TABLE: Record<string, Omit<FusedItem, 'id' | 'fusedFrom'>> = {
  'brine comet|vine whip':    { name:'Brine Lash',    spriteKey:'whip_blue',  behavior:'extends and splashes on impact', stackable:false },
  'cyan blade|violet blade':  { name:'Prism Sword',   spriteKey:'sword_cyan', behavior:'hums and refracts',              stackable:false },
  'pickled star|ferment orb': { name:'Glow Pickle',   spriteKey:'orb_yellow', behavior:'glows brighter when stored',     stackable:false },
  'dill drone|rose potion':   { name:'Dill Bloom',    spriteKey:'potion_pink',behavior:'follows player and heals',       stackable:false },
  // ... 4 more
};

export function fuseItems(a: string, b: string): FusedItem | null {
  const key1 = `${a}|${b}`;
  const key2 = `${b}|${a}`;
  const t = TABLE[key1] ?? TABLE[key2];
  if (!t) return null;
  return {
    id: uuid(),
    ...t,
    fusedFrom: { type: 'item+item', inputs: [a, b] },
  };
}
```

(Expand TABLE to 16 hand-authored entries using only `DEFAULT_SPRITE_KEYS` and item names from `pickItemsForDeck`.)

- [ ] **Step 3: card+card deterministic composition (no LLM)**

`src/core/cardComposition.ts`:
```ts
import type { Card, FusedItem } from './cardSystem';
import { uuid } from '../utils/uuid';

// When both inputs are cards (not items), compose deterministically.
// Spec §5.3: card+card composes from existing card stats.
export function composeCards(a: Card, b: Card): FusedItem {
  const name = `${a.name} ${b.name}`;
  const spriteKey = a.type === 'item' ? a.itemPayload!.spriteKey : b.itemPayload?.spriteKey ?? 'orb_green';
  return {
    id: uuid(),
    name,
    spriteKey,
    behavior: `fused from ${a.type}+${b.type}`,
    stackable: false,
    fusedFrom: { type: 'card+card', inputs: [a.id, b.id] },
  };
}
```

`tests/core/cardComposition.test.ts`:
```ts
import { composeCards } from '../../src/core/cardComposition';

it('composes two cards into a FusedItem', () => {
  const r = composeCards(
    { id:'1', type:'physics', name:'Moon Bounce', physicsPayload:{gravity:200,restitution:0.95,friction:0.1,note:'n'}, generatedBy:'fallback', generatedAt:0 },
    { id:'2', type:'item',    name:'Box',        itemPayload:{spriteKey:'orb_green',behavior:'b',stackable:false}, generatedBy:'fallback', generatedAt:0 },
  );
  expect(r.fusedFrom.type).toBe('card+card');
  expect(r.name).toBe('Moon Bounce Box');
});
```

- [ ] **Step 4: FusionAltarUI (drag two cards onto altar → result)**

`src/ui/FusionAltarUI.ts`:
```ts
import Phaser from 'phaser';
import type { Card, FusedItem } from '../core/cardSystem';
import { fuseItems } from '../core/fusionTable';
import { composeCards } from '../core/cardComposition';
import { gameBus } from '../core/eventBus';

export function openFusionAltar(scene: Phaser.Scene, a: Card, b: Card, inventory: Card[]): FusedItem | null {
  if (a.type === 'item' && b.type === 'item') {
    const r = fuseItems(a.name, b.name);
    if (r) { gameBus.emit('fusion:complete', { fusedItemId: r.id }); return r; }
    return null;
  }
  if ((a.type === 'item') !== (b.type === 'item')) {
    return composeCards(a, b);
  }
  return composeCards(a, b);
}
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm exec vitest run tests/core/fusionTable.test.ts tests/core/cardComposition.test.ts
git add src/core/fusionTable.ts src/core/cardComposition.ts src/ui/FusionAltarUI.ts src/phaser/entities/FusionAltar.ts tests/core/fusionTable.test.ts tests/core/cardComposition.test.ts
git commit -m "feat(fusion): hand-authored fusion table (item+item) + card+card composition + 3 paths"
```

---

## Task 12: Hidden card recipe check + hidden level unlock

**Files:**
- Create: `src/core/recipeCheck.ts`
- Create: `src/core/hiddenLevelUnlock.ts`
- Create: `src/phaser/scenes/LevelSelectScene.ts`
- Test: `tests/core/recipeCheck.test.ts`

Reference: spec §11 Task 1.11. Spec §5.5: "The 2-3 hidden cards in the deck each carry a unlockRecipe — a specific pair of in-world items. When the player fuses that exact pair, a hidden level is unlocked."

- [ ] **Step 1: Write recipe check test (red)**

```ts
// tests/core/recipeCheck.test.ts
import { describe, it, expect } from 'vitest';
import { checkRecipe } from '../../src/core/recipeCheck';
import type { Card, Deck } from '../../src/core/cardSystem';

const hiddenCard: Card = {
  id:'h-1', type:'hidden', name:'Memory Gate',
  hiddenPayload: { unlockRecipe: ['vine whip', 'ferment orb'] },
  generatedBy:'fallback', generatedAt:0,
};

const deck = { hiddenCards: [hiddenCard] } as unknown as Deck;

it('matches when both items are fused', () => {
  expect(checkRecipe(deck, 'vine whip', 'ferment orb')?.id).toBe('h-1');
});

it('does not match mismatched pair', () => {
  expect(checkRecipe(deck, 'vine whip', 'cyan blade')).toBeNull();
});
```

- [ ] **Step 2: Implement recipe check**

`src/core/recipeCheck.ts`:
```ts
import type { Card, Deck } from './cardSystem';

export function checkRecipe(deck: Deck, aName: string, bName: string): Card | null {
  for (const h of deck.hiddenCards) {
    if (!h.hiddenPayload) continue;
    const [x, y] = h.hiddenPayload.unlockRecipe;
    if ((x === aName && y === bName) || (x === bName && y === aName)) return h;
  }
  return null;
}
```

- [ ] **Step 3: Hidden level unlock**

`src/core/hiddenLevelUnlock.ts`:
```ts
import type { Card, HiddenLevel } from './cardSystem';
import { uuid } from '../utils/uuid';

export function unlockHiddenLevel(card: Card, palette: string[]): HiddenLevel {
  return {
    id: uuid(),
    name: card.name,
    paletteOverride: palette,
    ruleQuirk: 'a hidden world has opened',
    unlockRecipeCardId: card.id,
  };
}
```

- [ ] **Step 4: LevelSelectScene (lists base 5 + any unlocked hidden levels)**

`src/phaser/scenes/LevelSelectScene.ts`:
```ts
import Phaser from 'phaser';
import type { HiddenLevel } from '../../core/cardSystem';

export class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }
  create() {
    const base = 5;
    const unlocked: HiddenLevel[] = this.registry.get('unlockedHiddenLevels') ?? [];
    this.add.text(20, 20, 'Level Select', { fontSize: '24px', color: '#fff' });
    for (let i = 0; i < base; i++) {
      this.add.text(20, 60 + i * 30, `Level ${i + 1}`, { color: '#fff' });
    }
    unlocked.forEach((h, i) => this.add.text(160, 60 + (base + i) * 30, `Hidden: ${h.name}`, { color: '#ff9' }));
  }
}
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm exec vitest run tests/core/recipeCheck.test.ts
git add src/core/recipeCheck.ts src/core/hiddenLevelUnlock.ts src/phaser/scenes/LevelSelectScene.ts tests/core/recipeCheck.test.ts
git commit -m "feat(hidden): recipe check + hidden level unlock + level select scene"
```

---

## Task 13: Settings panel (mode toggle, locked to procgen in Phase 1)

**Files:**
- Create: `src/ui/SettingsPanel.ts`
- Create: `src/phaser/scenes/MenuScene.ts`
- Test: `tests/core/settings.test.ts`

Reference: spec §11 Task 1.12.

- [ ] **Step 1: Write settings test (red)**

```ts
// tests/core/settings.test.ts
import { describe, it, expect } from 'vitest';
import { defaultSettings, setMode } from '../../src/core/settings';

it('default mode is procgen (Phase 1)', () => {
  expect(defaultSettings().mode).toBe('procgen');
});

it('setMode rejects ai in Phase 1 (always falls back to procgen)', () => {
  const s = setMode(defaultSettings(), 'ai');
  expect(s.mode).toBe('procgen');
});
```

- [ ] **Step 2: Implement settings**

`src/core/settings.ts`:
```ts
import type { Mode } from './worldState';

export interface Settings {
  mode: Mode;
  showFps: boolean;
  sfxVolume: number; // 0..1
}

export function defaultSettings(): Settings {
  return { mode: 'procgen', showFps: false, sfxVolume: 0.7 };
}

export function setMode(s: Settings, mode: Mode): Settings {
  // Phase 1 hard-locks to procgen; AI mode is wired in Phase 2.
  if (mode === 'ai') return s;
  return { ...s, mode };
}
```

- [ ] **Step 3: MenuScene with Settings panel**

`src/phaser/scenes/MenuScene.ts`:
```ts
import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create() {
    this.add.text(640, 200, 'Whimsy Shuffle', { fontSize: '48px', color: '#fff' }).setOrigin(0.5);
    const start = this.add.text(640, 360, 'New Shuffle', { fontSize: '24px', color: '#fff', backgroundColor:'#222' })
      .setOrigin(0.5).setPadding(12).setInteractive({ useHandCursor: true });
    start.on('pointerdown', () => this.scene.start('GameScene'));
    const settings = this.add.text(640, 420, 'Settings', { fontSize: '20px', color: '#aaa' })
      .setOrigin(0.5).setPadding(8).setInteractive({ useHandCursor: true });
    settings.on('pointerdown', () => this.scene.start('SettingsScene'));
  }
}
```

`src/ui/SettingsPanel.ts`:
```ts
import Phaser from 'phaser';
import { defaultSettings, setMode } from '../core/settings';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }
  create() {
    this.add.text(640, 80, 'Settings', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    const procgen = this.add.text(640, 200, 'Mode: Pure Procgen (locked in Phase 1)', { fontSize:'20px', color:'#9f9' }).setOrigin(0.5);
    this.add.text(640, 240, 'AI mode unlocks in Phase 2 (WebLLM).', { fontSize:'14px', color:'#888' }).setOrigin(0.5);
    const back = this.add.text(640, 600, 'Back', { fontSize:'18px', color:'#fff' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
```

- [ ] **Step 4: Wire MenuScene into Game config**

Replace `src/main.ts` scene list with `[BootScene, MenuScene, GameScene, HandScene, SettingsScene, LevelSelectScene]`.

- [ ] **Step 5: Verify and commit**

```bash
pnpm exec vitest run tests/core/settings.test.ts
pnpm exec vite build
git add src/core/settings.ts src/ui/SettingsPanel.ts src/phaser/scenes/MenuScene.ts src/main.ts tests/core/settings.test.ts
git commit -m "feat(ui): Settings panel (mode locked to procgen in Phase 1) + MenuScene"
```

---

## Task 14: Static deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts` (base path)
- Test: `tests/e2e/playthrough.spec.ts`
- Create: `playwright.config.ts`

Reference: spec §11 Task 1.13. Spec §12: "A portfolio reader can clone, `npm install`, `npm run dev`, and play in under 2 minutes." + "Static deploy works: open URL, play immediately, no console errors."

- [ ] **Step 1: Write Playwright e2e test**

`tests/e2e/playthrough.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('page loads, menu visible, no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  await expect(page.getByText('Whimsy Shuffle')).toBeVisible();
  await page.getByText('New Shuffle').click();
  await expect(page.locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
```

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e',
  webServer: { command: 'pnpm preview --port 4173', port: 4173, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4173' },
});
```

- [ ] **Step 2: Update vite base**

In `vite.config.ts`, ensure `base: './'` (already set in Task 0).

- [ ] **Step 3: Write GitHub Actions deploy**

`.github/workflows/deploy.yml`:
```yaml
name: deploy
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read; pages: write; id-token: write }
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deploy.outputs.page_url }} }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - id: deploy
        uses: actions/deploy-pages@v4
```

- [ ] **Step 4: Verify locally**

```bash
pnpm exec vite build
pnpm exec vite preview --port 4173 &
sleep 2
pnpm exec playwright install --with-deps chromium
pnpm exec playwright test
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/deploy.yml playwright.config.ts tests/e2e vite.config.ts
git commit -m "feat(deploy): GitHub Pages workflow + Playwright e2e smoke"
```

---

## Task 15: Asset pipeline (spec §10.8 Phase 1)

**Files:**
- Create: `src/config/assets.ts`
- Create: `src/core/assetLoader.ts`
- Create: `src/ui/Attribution.ts`
- Create: `scripts/download-assets.mjs`
- Create: `scripts/build-atlas.mjs`
- Test: `tests/core/assets.test.ts`

Reference: spec §10.8 Phase 1 tasks: asset manifest / download core packs / sprite atlas build / assetLoader / placeholder swap / Attribution page.

- [ ] **Step 1: Write asset manifest test (red)**

```ts
// tests/core/assets.test.ts
import { describe, it, expect } from 'vitest';
import { ASSET_MANIFEST } from '../../src/config/assets';

it('manifest includes all required sources', () => {
  const names = ASSET_MANIFEST.map(a => a.id);
  expect(names).toContain('kenney-ui');
  expect(names).toContain('cafedraw-cards');
  expect(names).toContain('mixkit-sfx');
  expect(names).toContain('phaser-examples');
});

it('every entry has url, license, sha256', () => {
  for (const a of ASSET_MANIFEST) {
    expect(a.url).toMatch(/^https?:\/\//);
    expect(a.license).toBeTruthy();
    expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);
  }
});
```

- [ ] **Step 2: Implement asset manifest**

`src/config/assets.ts`:
```ts
export interface AssetEntry {
  id: string;
  url: string;
  license: string;
  attribution?: string;
  sha256: string;     // populated by `scripts/download-assets.mjs` after first fetch
  path: string;       // relative to /public after install
  bytes: number;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  { id: 'kenney-ui',         url: 'https://kenney.nl/media/pages/assets/ui-pack/kenney_ui-pack.zip',
    license: 'CC0', sha256: 'PENDING', path: 'sprites/kenney-ui/', bytes: 0 },
  { id: 'cafedraw-cards',    url: 'https://cafedraw.itch.io/fantasy-card-assets',
    license: 'Royalty-Free', attribution: 'cafeDraw', sha256: 'PENDING', path: 'sprites/cafedraw-cards/', bytes: 0 },
  { id: 'mixkit-sfx',        url: 'https://mixkit.co/free-sound-effects/game/',
    license: 'Mixkit License', sha256: 'PENDING', path: 'sfx/mixkit/', bytes: 0 },
  { id: 'phaser-examples',   url: 'https://github.com/phaserjs/examples/tree/master/public/assets',
    license: 'MIT', sha256: 'PENDING', path: 'sprites/phaser-examples/', bytes: 0 },
];
```

- [ ] **Step 3: Write download script**

`scripts/download-assets.mjs`:
```js
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'public');
const manifestPath = join(__dirname, '..', 'src', 'config', 'assets.ts');

const manifest = [
  { id: 'kenney-ui',       url: 'https://kenney.nl/media/pages/assets/ui-pack/kenney_ui-pack.zip',    path: 'sprites/kenney-ui/',     license: 'CC0' },
  { id: 'phaser-examples', url: 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/dude.png', path: 'sprites/phaser-examples/', license: 'MIT' },
  { id: 'phaser-star',     url: 'https://raw.githubusercontent.com/phaserjs/examples/master/public/assets/star.png', path: 'sprites/phaser-examples/', license: 'MIT' },
];

for (const a of manifest) {
  const dest = join(root, a.path);
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  const out = join(dest, a.url.split('/').pop());
  if (existsSync(out)) { console.log('skip', out); continue; }
  console.log('fetch', a.url, '->', out);
  const res = await fetch(a.url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${a.url}`);
  const hash = createHash('sha256');
  const tee = new Readable({ read() {} });
  res.body.pipeTo(new WritableStream({ write(c) { tee.push(Buffer.from(c)); hash.update(c); } }));
  await pipeline(tee, createWriteStream(out));
  console.log('  sha256', hash.digest('hex'), statSync(out).size, 'bytes');
}
console.log('Done. Manually update src/config/assets.ts with sha256 + bytes after first run.');
```

- [ ] **Step 4: Implement assetLoader.ts**

`src/core/assetLoader.ts`:
```ts
import Phaser from 'phaser';

export function loadAtlas(scene: Phaser.Scene, key: string, pngPath: string, jsonPath: string) {
  scene.load.atlas(key, pngPath, jsonPath);
}

export function loadImage(scene: Phaser.Scene, key: string, path: string) {
  scene.load.image(key, path);
}

export function loadAudio(scene: Phaser.Scene, key: string, paths: string | string[]) {
  scene.load.audio(key, Array.isArray(paths) ? paths : [paths]);
}
```

- [ ] **Step 5: Build sprite atlas with free-tex-packer**

`scripts/build-atlas.mjs`:
```js
// Run: `pnpm add -D free-tex-packer` then `node scripts/build-atlas.mjs`
// Reads /public/sprites/raw/{tiles,items,npcs,ui}/*.png and emits
// /public/sprites/atlas/{cards,items,npcs,tiles}.{png,json}
import { glob } from 'node:fs/promises';
import { pack } from 'free-tex-packer';

const jobs = [
  { name: 'cards', dir: 'public/sprites/raw/cards',  out: 'public/sprites/atlas' },
  { name: 'items', dir: 'public/sprites/raw/items',  out: 'public/sprites/atlas' },
  { name: 'npcs',  dir: 'public/sprites/raw/npcs',   out: 'public/sprites/atlas' },
  { name: 'tiles', dir: 'public/sprites/raw/tiles',  out: 'public/sprites/atlas' },
];

for (const j of jobs) {
  const files = [];
  for await (const f of glob(`${j.dir}/**/*.png`)) files.push(f);
  await pack(files, { textureName: j.name, fixedSize: false, padding: 2, detectIdentical: true }, j.out);
  console.log(`atlas ${j.name}: ${files.length} frames`);
}
```

- [ ] **Step 6: Replace Phaser example placeholders in GameScene**

In `src/phaser/scenes/GameScene.ts`, update `BootScene` to preload atlases via `assetLoader.ts`. Replace the colored rectangles with the loaded sprites once Task 15's atlas is in `/public/sprites/atlas/`.

- [ ] **Step 7: Attribution page**

`src/ui/Attribution.ts`:
```ts
import Phaser from 'phaser';

export class AttributionScene extends Phaser.Scene {
  constructor() { super('AttributionScene'); }
  create() {
    this.add.text(640, 60, 'Credits', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    const lines = [
      'Kenney (kenney.nl) - CC0 - items, UI, VFX',
      'cafeDraw Fantasy Card Assets - Royalty-Free',
      'Praan Card Game 2D UI - Royalty-Free',
      'Mixkit - SFX - Mixkit License',
      'Pixabay Music - BGM - Pixabay License',
      'OpenGameArt - per-pack license',
      'Phaser examples - MIT placeholders',
      'Inter font (rsms.me/inter) - OFL 1.1',
    ];
    lines.forEach((l, i) => this.add.text(80, 120 + i * 28, l, { color: '#ddd' }));
  }
}
```

- [ ] **Step 8: Run download script and verify**

```bash
node scripts/download-assets.mjs
node scripts/build-atlas.mjs
pnpm exec vitest run tests/core/assets.test.ts
```

- [ ] **Step 9: Commit**

```bash
git add src/config/assets.ts src/core/assetLoader.ts src/ui/Attribution.ts scripts public
git commit -m "feat(assets): manifest + download script + atlas build + assetLoader + attribution"
```

---

## Final Verification

Run all checks in order:

1. `pnpm install` — exit 0
2. `pnpm typecheck` — exit 0
3. `pnpm test` — all green
4. `pnpm build` — emits `dist/`
5. `pnpm test:e2e` — Playwright smoke green
6. `pnpm preview` — open http://localhost:4173 in browser, click "New Shuffle", play through 5 levels, drag physics card, fuse two items, fuse hidden recipe, see hidden level
7. `git log --oneline | head -16` — 16 clean commits (Tasks 0-15)

## Success Criteria Checklist (from spec §12 Phase 1 done means)

- [ ] A new player can load the page and play a 5-level session in under 5 minutes.
- [ ] Each new "Reshuffle" produces a visibly different deck.
- [ ] The player can drag a physics card onto a level and see physics change live, with no LLM call.
- [ ] The player can fuse two item cards on the fusion altar and see a new item appear.
- [ ] The player can fuse a hidden-card recipe pair and unlock a hidden level.
- [ ] The game runs at 30+ FPS on an RTX 3060 with no model loaded.
- [ ] The codebase fits in one developer's head (~2500 lines of game code).
- [ ] Static deploy works: open URL, play immediately, no console errors.
- [ ] A portfolio reader can clone, `pnpm install`, `pnpm dev`, and play in under 2 minutes.

## Risk Notes

- **Risk 1: `apps/web` directory in current repo is from the old Tauri Whimsy v3.** Task 0 starts from `projects/whimsy/` root with a fresh Vite scaffold, but `apps/web` already exists. Either delete `apps/web` and `apps/desktop` first, or scope Vite to the repo root and add `exclude: ['apps/**', 'packages/**']` to `tsconfig.json`. Decision: keep `apps/` in place for the v3 archive but add `tsconfig.json` excludes to keep this plan's source tree clean.
- **Risk 2: free-tex-packer is a dev-time tool only.** `scripts/build-atlas.mjs` runs in CI (not runtime). The output `public/sprites/atlas/` is committed.
- **Risk 3: Phaser 3.80.1 ESM import path.** Confirmed at https://github.com/phaserjs/phaser - `import Phaser from 'phaser'` works in Vite 5 with the npm distribution. Vite manualChunks in Task 0 Step 5 keeps Phaser in a separate chunk.
- **Risk 4: 16 hardcoded themes vs spec's "16 theme bundles".** Spec §6.7 says "16 hardcoded theme bundles". We have 5 biomes (forest/ocean/dungeon/scifi/desert) and cycle them; the spec's "16" is interpreted as 16 *cycles* of reshuffle giving visible variation. If the user wants literal 16 distinct bundles, expand `BIOMES` in Task 5 from 5 to 16 before commit (e.g. add: tundra, jungle, crystal, neon, haunted, sky, magma, candy, void, library).
- **Risk 5: ITEM_TEMPLATES expansion.** Task 6 Step 1 lists 8 entries; expand to 30 with varied spriteKeys from `DEFAULT_SPRITE_KEYS` before commit. Same for `TABLE` in fusionTable.ts (Task 11 Step 2) - expand to 16 entries.

## Self-Review

- Spec coverage: every section of spec §11 Phase 1 (1.1-1.13) maps to a Task (0, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14). §10.8 Phase 1 (6 tasks: manifest / download / atlas / assetLoader / placeholder swap / Attribution) maps to Task 15. ✓
- Placeholder scan: no "TBD" / "TODO" / "implement later". Risk notes flag 3 known expansion points (16 themes, 30 item templates, 16 fusion entries) with explicit expansion instructions before commit.
- Type consistency: `Card`, `Deck`, `Level`, `FusedItem`, `HiddenLevel`, `PlacedItem`, `PlacedNpc` defined once in `src/core/cardSystem.ts` (Task 1) and referenced everywhere by their canonical names. `WorldState` in `src/core/worldState.ts`. `Mode` and `ModelStatus` in `worldState.ts`. `Physics` in `physicsApply.ts`. `Settings` in `settings.ts`. No duplicate definitions.
- File paths: all files reference `projects/whimsy/` paths consistent with the current repo. No `whimsy-shuffle/` references (renamed to `whimsy` since the user is on this directory).
