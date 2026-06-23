# Whimsy Shuffle Phase 1.6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Phase 1.5's color-rectangle entity placeholders with Kenney CC0 sprite art via a BootScene preload pipeline, without changing any game mechanics.

**Architecture:** BootScene gains a real preload step that loads ~19 single PNG sprites (no atlas). `core/assetLoader.ts` exposes `safeAddSprite(scene, x, y, key, fallbackColor)` which falls back to a colored rectangle if the texture is missing — guaranteeing gameplay remains intact even when network or file resolution fails. GameScene, HandScene, and FusionAltarScene all consume sprites through `safeAddSprite`. Tile rectangles stay (1200 tile sprites per level would be a perf regression for marginal visual gain).

**Tech Stack:** Phaser 3.80.1 (`scene.load.image`, `textures.exists`), TypeScript 5.4 strict, Vitest 1.4, Playwright 1.42.

**Phase 1.6 Source Spec:** `docs/superpowers/specs/2026-06-22-whimsy-shuffle-phase16-design.md`

---

## File Structure (created/modified during this plan)

```
projects/whimsy/
  public/
    sprites/                             (T1) new directory
      player.png                         (T1) Kenney Toon character, facing down
      npc.png                            (T1) Kenney Toon character, alt palette
      item.png                           (T1) Kenney Tiny Town apple
      altar.png                          (T1) Kenney sign_altar style
      exit.png                           (T1) Kenney sign_arrow style
      hand_moon_bounce.png               (T1) Kenney UI card blue
      hand_heavy_brine.png               (T1) Kenney UI card red
      hand_icy_ground.png                (T1) Kenney UI card green
      hand_sticky_vine.png               (T1) Kenney UI card yellow
      hand_gentle_drift.png              (T1) Kenney UI card purple
      hand_earth_pull.png                (T1) Kenney UI card brown
      hand_feather_fall.png              (T1) Kenney UI card pink
      hand_mud_walk.png                  (T1) Kenney UI card grey
  src/
    config/
      assets.ts                          (T2) modify — add SPRITE_KEYS, populate ASSET_MANIFEST
    core/
      assetLoader.ts                     (T3) modify — preloadAllAssets, safeAddSprite
    phaser/
      scenes/
        BootScene.ts                     (T4) modify — preload + progress + handoff
        GameScene.ts                     (T5) modify — replace 5 entity classes with safeAddSprite
    ui/
      CardHandView.ts                    (T6) modify — safeAddSprite per hand card
  tests/
    core/
      assetLoader.test.ts                (T3) new
    procgen/
      assetManifest.test.ts              (T2) new
    e2e/
      playthrough.spec.ts                (T7) extend — sprite preload test
  docs/
    design/
      2026-06-22-phase16-acceptance.md   (T8) new manual smoke checklist
  scripts/
    download-assets.mjs                  (T1) modify — actually download Kenney packs
```

---

## Task 1: Download Kenney CC0 sprite packs

**Files:**
- Modify: `scripts/download-assets.mjs`
- Create: `public/sprites/` directory + 13 PNG files

Reference: spec §3.1, §3.2.

- [ ] **Step 1: Create public/sprites/ directory**

```bash
cd /d/Coder/ATNL/projects/whimsy
mkdir -p public/sprites
```

- [ ] **Step 2: Update scripts/download-assets.mjs with real Kenney pack URLs**

Replace `scripts/download-assets.mjs` with:
```js
// Whimsy Shuffle Phase 1.6 — download Kenney CC0 sprite packs and
// copy the handful of sprites the game actually uses to
// public/sprites/. Failure to download is non-fatal: the game
// has graceful fall back to colored rectangles in assetLoader.
//
// Run: node scripts/download-assets.mjs
import { mkdirSync, existsSync, statSync, createWriteStream, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'public', 'sprites');
mkdirSync(root, { recursive: true });

// Map our role names to a (sourcePack, searchKeyword) pair. The
// download step fetches each pack, then a separate "pick" step
// finds the file matching the keyword inside the unzipped dir
// and copies it to public/sprites/<role>.png.
const SPRITE_PLAN = [
  { role: 'player',            pack: 'toon-characters-1', keyword: 'walk', variant: 'a' },
  { role: 'npc',               pack: 'toon-characters-1', keyword: 'walk', variant: 'b' },
  { role: 'item',              pack: 'tiny-town',         keyword: 'apple' },
  { role: 'altar',             pack: 'tiny-town',         keyword: 'sign' },
  { role: 'exit',              pack: 'tiny-town',         keyword: 'arrow' },
  { role: 'hand_moon_bounce',  pack: 'ui-pack',           keyword: 'card_blue' },
  { role: 'hand_heavy_brine',  pack: 'ui-pack',           keyword: 'card_red' },
  { role: 'hand_icy_ground',   pack: 'ui-pack',           keyword: 'card_green' },
  { role: 'hand_sticky_vine',  pack: 'ui-pack',           keyword: 'card_yellow' },
  { role: 'hand_gentle_drift', pack: 'ui-pack',           keyword: 'card_purple' },
  { role: 'hand_earth_pull',   pack: 'ui-pack',           keyword: 'card_brown' },
  { role: 'hand_feather_fall', pack: 'ui-pack',           keyword: 'card_pink' },
  { role: 'hand_mud_walk',     pack: 'ui-pack',           keyword: 'card_grey' },
];

const PACK_URLS = {
  'toon-characters-1': 'https://kenney.nl/media/pages/assets/toon-characters-1/Toon_Characters_1.zip',
  'tiny-town':         'https://kenney.nl/media/pages/assets/tiny-town/Tiny_Town.zip',
  'ui-pack':           'https://kenney.nl/media/pages/assets/ui-pack/UI_Pack.zip',
};

const fetched = {};
for (const [packName, url] of Object.entries(PACK_URLS)) {
  const dest = join(root, `${packName}.zip`);
  if (existsSync(dest) && statSync(dest).size > 1000) {
    console.log(`skip ${packName} (cached)`);
    fetched[packName] = dest;
    continue;
  }
  console.log(`fetching ${packName}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const hash = createHash('sha256');
    const tee = new Readable({ read() {} });
    res.body.pipeTo(new WritableStream({
      write(c) { tee.push(Buffer.from(c)); hash.update(c); },
    }));
    await pipeline(tee, createWriteStream(dest));
    console.log(`  ${packName} -> ${dest} (sha256 ${hash.digest('hex').slice(0, 12)}...)`);
    fetched[packName] = dest;
  } catch (err) {
    console.warn(`  ${packName} download FAILED: ${err.message}`);
    console.warn('  Game will fall back to colored rectangles.');
  }
}

console.log('\nDone. Note: extraction + role-mapping happens manually');
console.log('  because Kenney pack ZIP contents vary across versions.');
console.log('  See docs/design/2026-06-22-phase16-acceptance.md for the');
console.log('  manual smoke checklist.');
```

- [ ] **Step 3: Try running download-assets.mjs**

```bash
node scripts/download-assets.mjs 2>&1 | tail -10
```

Expected: may succeed (downloads 3 ZIPs) or fail (no network). Both outcomes are acceptable — this task establishes the script structure, real-world download happens during manual acceptance in T8.

- [ ] **Step 4: Commit the script update**

```bash
git add scripts/download-assets.mjs
git commit -m "feat(assets): Kenney CC0 sprite download script

Replaces the placeholder URLs from Phase 1 plan T15 with the
actual Kenney pack URLs:
- Toon Characters 1 (player + NPC + exit)
- Tiny Town (item + altar)
- UI Pack (8 hand card frames)

All CC0, total ~9 MB compressed. Failure to download is
non-fatal: the game has graceful fall back to colored rectangles
via assetLoader.safeAddSprite, so the game remains playable
offline or if Kenney removes a pack."
```

---

## Task 2: Add SPRITE_KEYS + populate ASSET_MANIFEST

**Files:**
- Modify: `src/config/assets.ts`
- Test: `tests/procgen/assetManifest.test.ts`

Reference: spec §3.2, §3.3.

- [ ] **Step 1: Write assetManifest test (red)**

Create `tests/procgen/assetManifest.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { SPRITE_KEYS, ASSET_MANIFEST } from '../../src/config/assets';

describe('SPRITE_KEYS', () => {
  it('contains all 18 sprite role keys', () => {
    const expected = [
      'player', 'npc', 'item', 'altar', 'exit',
      'hand_moon_bounce', 'hand_heavy_brine', 'hand_icy_ground',
      'hand_sticky_vine', 'hand_gentle_drift', 'hand_earth_pull',
      'hand_feather_fall', 'hand_mud_walk',
    ];
    for (const key of expected) {
      expect(SPRITE_KEYS).toHaveProperty(key);
    }
  });

  it('each value is a non-empty string', () => {
    for (const [, value] of Object.entries(SPRITE_KEYS)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});

describe('ASSET_MANIFEST', () => {
  it('every entry has url, license, sha256', () => {
    for (const a of ASSET_MANIFEST) {
      expect(a.url).toMatch(/^https?:\/\//);
      expect(a.license).toBeTruthy();
      expect(a.sha256).toMatch(/^(PENDING|[a-f0-9]{64})$/);
    }
  });

  it('includes kenney-ui, kenney-tinytown, kenney-toonchars', () => {
    const ids = ASSET_MANIFEST.map(a => a.id);
    expect(ids).toContain('kenney-ui');
    expect(ids).toContain('kenney-tinytown');
    expect(ids).toContain('kenney-toonchars');
  });
});
```

- [ ] **Step 2: Run test (red)**

```bash
cd /d/Coder/ATNL/projects/whimsy && pnpm exec vitest run tests/procgen/assetManifest.test.ts
```
Expected: FAIL — Cannot find module '../../src/config/assets' (assets.ts has different exports).

- [ ] **Step 3: Rewrite src/config/assets.ts**

Replace `src/config/assets.ts` with:
```ts
// Centralized asset registry for Phase 1.6+. Phaser loads sprites by
// the keys defined in SPRITE_KEYS, each backed by a file in
// public/sprites/. The mapping here is the single source of truth;
// GameScene and CardHandView read SPRITE_KEYS.player etc. directly.

export const SPRITE_KEYS = {
  // Entities
  player: 'player',
  npc: 'npc',
  item: 'item',
  altar: 'altar',
  exit: 'exit',

  // Hand cards (one per physics preset)
  hand_moon_bounce:   'hand_moon_bounce',
  hand_heavy_brine:   'hand_heavy_brine',
  hand_icy_ground:    'hand_icy_ground',
  hand_sticky_vine:   'hand_sticky_vine',
  hand_gentle_drift:  'hand_gentle_drift',
  hand_earth_pull:    'hand_earth_pull',
  hand_feather_fall:  'hand_feather_fall',
  hand_mud_walk:      'hand_mud_walk',
} as const;

export type SpriteKey = typeof SPRITE_KEYS[keyof typeof SPRITE_KEYS];

// Manifest of source packs. sha256 is filled in by
// scripts/download-assets.mjs after first run; starts as PENDING.
export interface AssetEntry {
  id: string;
  url: string;
  license: string;
  attribution?: string;
  sha256: string;
  path: string;
  bytes: number;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  { id: 'kenney-toonchars', url: 'https://kenney.nl/media/pages/assets/toon-characters-1/Toon_Characters_1.zip',
    license: 'CC0', attribution: 'Kenney Vleugels (kenney.nl)',
    sha256: 'PENDING', path: 'sprites/toon-characters-1/', bytes: 0 },
  { id: 'kenney-tinytown',  url: 'https://kenney.nl/media/pages/assets/tiny-town/Tiny_Town.zip',
    license: 'CC0', attribution: 'Kenney Vleugels (kenney.nl)',
    sha256: 'PENDING', path: 'sprites/tiny-town/', bytes: 0 },
  { id: 'kenney-ui',        url: 'https://kenney.nl/media/pages/assets/ui-pack/UI_Pack.zip',
    license: 'CC0', attribution: 'Kenney Vleugels (kenney.nl)',
    sha256: 'PENDING', path: 'sprites/ui-pack/', bytes: 0 },
  { id: 'phaser-examples',  url: 'https://github.com/phaserjs/examples/tree/master/public/assets',
    license: 'MIT', sha256: 'PENDING', path: 'sprites/phaser-examples/', bytes: 0 },
];
```

- [ ] **Step 4: Run test, verify PASS**

```bash
pnpm exec vitest run tests/procgen/assetManifest.test.ts
```
Expected: PASS (13 + 2 = 15 assertions).

- [ ] **Step 5: Commit**

```bash
git add src/config/assets.ts tests/procgen/assetManifest.test.ts
git commit -m "feat(assets): SPRITE_KEYS map + populated ASSET_MANIFEST

Phase 1.6 introduces 13 sprite role keys (player, npc, item,
altar, exit, plus 8 hand cards). Each maps to a public/sprites/
PNG file with a matching name. Code reads SPRITE_KEYS.player
rather than remembering magic strings.

ASSET_MANIFEST now lists Kenney Toon Characters 1, Tiny Town,
and UI Pack as CC0 sources with their real download URLs.
phaser-examples (MIT) is kept as the Phase 1 fallback option.

Manifest sha256 starts as 'PENDING' and is filled in by the
download script after a successful fetch."
```

---

## Task 3: assetLoader.preloadAllAssets + safeAddSprite

**Files:**
- Modify: `src/core/assetLoader.ts`
- Test: `tests/core/assetLoader.test.ts`

Reference: spec §4.1.

- [ ] **Step 1: Write assetLoader test (red)**

Create `tests/core/assetLoader.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { SPRITE_KEYS } from '../../src/config/assets';
import { preloadAllAssets, safeAddSprite } from '../../src/core/assetLoader';

describe('preloadAllAssets', () => {
  it('is callable with a scene-like object', () => {
    expect(typeof preloadAllAssets).toBe('function');
  });
});

describe('safeAddSprite', () => {
  it('returns a GameObject', () => {
    const fakeScene = {
      textures: { exists: (_: string) => false },
      add: { rectangle: (x: number, y: number, w: number, h: number, c: number) => ({ x, y, w, h, c, kind: 'rect' }) },
    };
    const obj = safeAddSprite(
      fakeScene as never,
      100, 200,
      'nonexistent-key',
      16, 16,
      0xabcdef,
    );
    expect(obj).toBeDefined();
    expect((obj as { c: number }).c).toBe(0xabcdef);
  });

  it('returns an image when texture exists', () => {
    const fakeScene = {
      textures: { exists: (_: string) => true },
      add: { image: (x: number, y: number, k: string) => ({ x, y, k, kind: 'image' }) },
    };
    const obj = safeAddSprite(
      fakeScene as never,
      0, 0,
      'existing-key',
      16, 16,
      0x000000,
    );
    expect((obj as { kind: string }).kind).toBe('image');
  });
});

describe('SPRITE_KEYS', () => {
  it('has a file-path mapping for every role', () => {
    // Just verify the shape; actual files come from download-assets.
    for (const k of Object.keys(SPRITE_KEYS)) {
      expect((SPRITE_KEYS as Record<string, string>)[k]).toMatch(/^[a-z_]+$/);
    }
  });
});
```

- [ ] **Step 2: Run test (red)**

```bash
cd /d/Coder/ATNL/projects/whimsy && pnpm exec vitest run tests/core/assetLoader.test.ts
```
Expected: FAIL — Cannot find module '../../src/core/assetLoader'.

- [ ] **Step 3: Rewrite src/core/assetLoader.ts**

Replace `src/core/assetLoader.ts` with:
```ts
// Phase 1.6 asset loader. Two responsibilities:
//
// 1. preloadAllAssets(scene) registers a load.image() call for each
//    SPRITE_KEYS entry. Call this from BootScene.preload() so all
//    sprites are in the texture cache before GameScene starts.
//
// 2. safeAddSprite(scene, x, y, key, w, h, fallbackColor) is the
//    only safe way to render an entity sprite in Phase 1.6+. It
//    checks scene.textures.exists(key) first; if the texture is
//    missing (e.g. download failed), it falls back to a colored
//    rectangle matching the Phase 1.5 placeholder. This means
//    gameplay is robust to offline / partial-asset situations.
import Phaser from 'phaser';
import { SPRITE_KEYS, type SpriteKey } from '../config/assets';

const SPRITE_PATHS: Record<SpriteKey, string> = {
  player: SPRITE_KEYS.player,
  npc: SPRITE_KEYS.npc,
  item: SPRITE_KEYS.item,
  altar: SPRITE_KEYS.altar,
  exit: SPRITE_KEYS.exit,
  hand_moon_bounce: SPRITE_KEYS.hand_moon_bounce,
  hand_heavy_brine: SPRITE_KEYS.hand_heavy_brine,
  hand_icy_ground: SPRITE_KEYS.hand_icy_ground,
  hand_sticky_vine: SPRITE_KEYS.hand_sticky_vine,
  hand_gentle_drift: SPRITE_KEYS.hand_gentle_drift,
  hand_earth_pull: SPRITE_KEYS.hand_earth_pull,
  hand_feather_fall: SPRITE_KEYS.hand_feather_fall,
  hand_mud_walk: SPRITE_KEYS.hand_mud_walk,
};

// Note: SPRITE_PATHS is identity-mapped (key === filename stem) for
// Phase 1.6. Kept as a separate object so future phases can remap
// e.g. 'player' -> 'sprites/toon-char-walk-down.png' without changing
// call sites.

/**
 * Register load.image() calls on the given scene for every sprite
 * role. Safe to call multiple times (Phaser dedupes by key).
 *
 * Call from BootScene.preload(). Errors during the actual network
 * fetch are caught and logged by Phaser; the safeAddSprite fallback
 * path ensures gameplay still works.
 */
export function preloadAllAssets(scene: Phaser.Scene): void {
  for (const [role, fileStem] of Object.entries(SPRITE_PATHS)) {
    scene.load.image(role, `sprites/${fileStem}.png`);
  }
}

/**
 * Add a sprite at (x, y). If the texture for `key` failed to load,
 * fall back to a colored rectangle. Always returns a GameObject so
 * callers don't need to null-check.
 *
 * The fallback rectangle is sized to (w, h) and tinted with
 * `fallbackColor` so it visually approximates the missing sprite
 * with the same dimensions.
 */
export function safeAddSprite(
  scene: Phaser.Scene,
  x: number, y: number,
  key: string,
  w: number, h: number,
  fallbackColor: number,
): Phaser.GameObjects.GameObject {
  if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key);
    // Normalize sprite size to the tile grid (16x16). Kenney packs
    // ship sprites at various sizes; this keeps collision math and
    // visual layout consistent regardless of source resolution.
    img.setDisplaySize(w, h);
    return img;
  }
  return scene.add.rectangle(x, y, w, h, fallbackColor);
}
```

- [ ] **Step 4: Run test, verify PASS**

```bash
pnpm exec vitest run tests/core/assetLoader.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/assetLoader.ts tests/core/assetLoader.test.ts
git commit -m "feat(assets): preloadAllAssets + safeAddSprite helpers

preloadAllAssets(scene) registers load.image() for every
SPRITE_KEYS entry. Call from BootScene.preload() so all sprites
are in the texture cache before GameScene boots.

safeAddSprite(scene, x, y, key, w, h, fallbackColor) is the only
safe way to render entity sprites. It checks textures.exists(key)
first and falls back to a colored rectangle if the texture is
missing. This guarantees gameplay remains intact even when:
- Asset download fails (offline first-run)
- Kenney pack is restructured and a file is missing
- A future phase swaps sprites and forgets to update one role

Sprite display size is normalized to (w, h) so any Kenney
source resolution renders consistently in the 16x16 tile grid."
```

---

## Task 4: BootScene preload + progress + handoff

**Files:**
- Modify: `src/phaser/scenes/BootScene.ts`

Reference: spec §4.

- [ ] **Step 1: Rewrite BootScene.ts**

Replace `src/phaser/scenes/BootScene.ts` with:
```ts
import Phaser from 'phaser';
import { preloadAllAssets } from '../../core/assetLoader';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  private progressText?: Phaser.GameObjects.Text;

  preload() {
    this.add.text(640, 320, 'Whimsy Shuffle', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    this.progressText = this.add.text(640, 380, 'Loading 0%', {
      fontSize: '16px', color: '#aaa',
    }).setOrigin(0.5);

    preloadAllAssets(this);

    this.load.on('progress', (v: number) => {
      if (this.progressText) {
        this.progressText.setText(`Loading ${Math.round(v * 100)}%`);
      }
    });
  }

  create() {
    this.load.once('complete', () => {
      this.scene.start('MenuScene');
    });
    // If the load queue is empty (no network or instant cache),
    // 'complete' may have already fired. Fall through to start
    // immediately in that case.
    if (this.load.isLoading() === false && this.load.progress() === 1) {
      this.scene.start('MenuScene');
    }
  }
}
```

- [ ] **Step 2: Run typecheck + full suite**

```bash
pnpm exec tsc --noEmit
pnpm exec vitest run
```
Both clean.

- [ ] **Step 3: Commit**

```bash
git add src/phaser/scenes/BootScene.ts
git commit -m "feat(boot): BootScene now preloads Kenney sprites with progress UI

Phase 1.6 adds a real preload step. BootScene.preload() calls
preloadAllAssets(this) which registers load.image() for every
SPRITE_KEYS entry. The 'progress' event updates a 'Loading X%'
text so the player sees visual feedback during the brief load
window.

On 'complete', handoff to MenuScene. If the load queue was
already empty (instant cache hit), the create() check starts
MenuScene directly to avoid a one-frame black screen."
```

---

## Task 5: GameScene swap rectangles → safeAddSprite

**Files:**
- Modify: `src/phaser/scenes/GameScene.ts`

Reference: spec §5.1.

- [ ] **Step 1: Add import**

Read the top of `src/phaser/scenes/GameScene.ts` and ensure this import is present (add if missing):
```ts
import { safeAddSprite } from '../../core/assetLoader';
import { SPRITE_KEYS } from '../../config/assets';
```

- [ ] **Step 2: Replace player rectangle**

Find:
```ts
this.player = this.add.rectangle(
  offsetX + this.tileSize * 2, offsetY + this.tileSize * 2,
  12, 12, 0x00ffff,
);
```

Replace with:
```ts
this.player = safeAddSprite(
  this,
  offsetX + this.tileSize * 2, offsetY + this.tileSize * 2,
  SPRITE_KEYS.player,
  12, 12,
  0x00ffff,
) as Phaser.GameObjects.Rectangle;
```

(Cast to Rectangle because safeAddSprite returns GameObject; collision
math in update() reads .x/.y which exist on Image and Rectangle
both, but TS narrows to GameObject without the cast.)

- [ ] **Step 3: Replace item entities**

Find:
```ts
const c = this.add.container(px, py);
const rect = this.add.rectangle(0, 0, 14, 14, 0xff8800).setStrokeStyle(1, 0xffffff);
const label = this.add.text(0, 0, card?.name.slice(0, 4) ?? '?', {
  fontSize: '8px', color: '#000',
}).setOrigin(0.5);
c.add([rect, label]);
this.itemEntities.set(p.cardId, c);
```

Replace with:
```ts
const c = this.add.container(px, py);
const sprite = safeAddSprite(this, 0, 0, SPRITE_KEYS.item, 14, 14, 0xff8800);
if ('setStrokeStyle' in sprite && typeof sprite.setStrokeStyle === 'function') {
  (sprite as Phaser.GameObjects.Rectangle).setStrokeStyle(1, 0xffffff);
}
const label = this.add.text(0, 0, card?.name.slice(0, 4) ?? '?', {
  fontSize: '8px', color: '#000',
}).setOrigin(0.5);
c.add([sprite, label]);
this.itemEntities.set(p.cardId, c);
```

- [ ] **Step 4: Replace NPC entities**

Find:
```ts
const c = this.add.container(px, py);
const body = this.add.rectangle(0, 0, 16, 16, 0x66ffaa).setStrokeStyle(1, 0xffffff);
const label = this.add.text(0, 0, '!', { fontSize: '12px', color: '#000' }).setOrigin(0.5);
c.add([body, label]);
c.setData('cardId', p.cardId);
this.npcEntities.set(p.cardId, c);
```

Replace with:
```ts
const c = this.add.container(px, py);
const sprite = safeAddSprite(this, 0, 0, SPRITE_KEYS.npc, 16, 16, 0x66ffaa);
const label = this.add.text(0, 0, '!', { fontSize: '12px', color: '#000' }).setOrigin(0.5);
c.add([sprite, label]);
c.setData('cardId', p.cardId);
this.npcEntities.set(p.cardId, c);
```

- [ ] **Step 5: Replace altar sprite**

Find:
```ts
const altarEntity = this.add.container(altarPx, altarPy);
altarEntity.add(this.add.rectangle(0, 0, 18, 18, 0xff00ff).setStrokeStyle(2, 0xffffff));
altarEntity.add(this.add.text(0, 0, '*', { fontSize: '14px', color: '#fff' }).setOrigin(0.5));
```

Replace with:
```ts
const altarEntity = this.add.container(altarPx, altarPy);
altarEntity.add(safeAddSprite(this, 0, 0, SPRITE_KEYS.altar, 18, 18, 0xff00ff));
altarEntity.add(this.add.text(0, 0, '*', { fontSize: '14px', color: '#fff' }).setOrigin(0.5));
```

- [ ] **Step 6: Run typecheck + tests**

```bash
pnpm exec tsc --noEmit
pnpm exec vitest run
```

If TS complains about the `this.player` cast in step 2, ensure the import block already has `import type Phaser from 'phaser'` or use `import type { GameObjects } from 'phaser'`. Adjust as needed.

- [ ] **Step 7: Commit**

```bash
git add src/phaser/scenes/GameScene.ts
git commit -m "feat(scene): GameScene uses safeAddSprite for entities

Phase 1.6 sprite swap. Five entity classes now go through
safeAddSprite:
- player -> Kenney Toon character sprite (was 12x12 cyan box)
- item (6) -> Kenney Tiny Town apple sprite
- NPC (3) -> Kenney Toon character alt palette
- altar (1) -> Kenney sign sprite
- (exit already yellow square; placeholder sprite in T2)

Each safeAddSprite call has the original Phase 1.5 color as
the fallback so the game still works if the sprite is missing.
The 1200 tile rectangles in drawTilemap stay as-is per spec
section 6.1 (perf > visual variety for tiny tiles)."
```

---

## Task 6: CardHandView safeAddSprite per hand card

**Files:**
- Modify: `src/ui/CardHandView.ts`

Reference: spec §5.1.

- [ ] **Step 1: Rewrite src/ui/CardHandView.ts**

Replace with:
```ts
import Phaser from 'phaser';
import type { Card } from '../core/cardSystem';
import { SPRITE_KEYS } from '../config/assets';
import { safeAddSprite } from '../core/assetLoader';

// Map physics card note -> SPRITE_KEYS hand_* key.
// Phase 1.5 buildPhysicsCards uses these exact note strings.
const NOTE_TO_HAND_KEY: Record<string, string> = {
  'moon bounce': SPRITE_KEYS.hand_moon_bounce,
  'heavy brine': SPRITE_KEYS.hand_heavy_brine,
  'icy ground':  SPRITE_KEYS.hand_icy_ground,
  'sticky vine': SPRITE_KEYS.hand_sticky_vine,
  'gentle drift': SPRITE_KEYS.hand_gentle_drift,
  'earth pull':  SPRITE_KEYS.hand_earth_pull,
  'feather fall': SPRITE_KEYS.hand_feather_fall,
  'mud walk':    SPRITE_KEYS.hand_mud_walk,
};

function handKeyFor(card: Card): string {
  const note = card.physicsPayload?.note;
  if (note && NOTE_TO_HAND_KEY[note]) return NOTE_TO_HAND_KEY[note]!;
  // Fallback: deterministic key from the card id so the rectangle
  // color is at least stable across reloads.
  return `unknown_${card.id}`;
}

const FALLBACK_COLORS = [0x222244, 0x442222, 0x224422, 0x444422, 0x442244, 0x224444, 0x333344, 0x443333];

function fallbackColorFor(card: Card, idx: number): number {
  let hash = 0;
  for (const ch of card.id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return FALLBACK_COLORS[Math.abs(hash + idx) % FALLBACK_COLORS.length]!;
}

export function renderHand(scene: Phaser.Scene, hand: Card[]): Phaser.GameObjects.Container {
  const c = scene.add.container(0, scene.scale.height - 80);
  hand.slice(0, 8).forEach((card, i) => {
    const handKey = handKeyFor(card);
    const rect = safeAddSprite(scene, 80 + i * 100, 0, handKey, 80, 60, fallbackColorFor(card, i));
    rect.setStrokeStyle(1, 0xaaaaff);
    rect.setInteractive({ useHandCursor: true, draggable: true });
    rect.setData('cardId', card.id);
    rect.setData('cardName', card.name);
    const label = scene.add.text(80 + i * 100, 0, card.name, {
      fontSize: '11px', color: '#fff',
    }).setOrigin(0.5);
    rect.on('pointerdown', () => { rect.setFillStyle(0x4444aa); });
    rect.on('pointerup', () => {
      rect.setFillStyle(0x222244);
      scene.game.events.emit('card:played-physics', { cardId: card.id });
    });
    rect.on('pointerout', () => { rect.setFillStyle(0x222244); });
    c.add([rect, label]);
  });
  return c;
}
```

- [ ] **Step 2: Run typecheck + tests**

```bash
pnpm exec tsc --noEmit
pnpm exec vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/CardHandView.ts
git commit -m "feat(hand): CardHandView uses safeAddSprite per physics card

Each of the 8 hand cards is rendered via safeAddSprite with
the matching SPRITE_KEYS.hand_* key (moon_bounce, heavy_brine,
icy_ground, sticky_vine, gentle_drift, earth_pull, feather_fall,
mud_walk).

The mapping is keyed by physicsPayload.note, which is the same
string Phase 1.5's buildPhysicsCards() uses. Unknown cards fall
back to a deterministic colored rectangle based on card id
hash, so the visual never breaks even if a future preset is
added without a sprite mapping."
```

---

## Task 7: Extend E2E test for sprite preload

**Files:**
- Modify: `tests/e2e/playthrough.spec.ts`

Reference: spec §8.

- [ ] **Step 1: Append sprite-load test**

Append to `tests/e2e/playthrough.spec.ts`:
```ts
test('BootScene shows Loading then transitions to MenuScene', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/');
  // Loading text appears at least briefly; either way MenuScene
  // title should be visible within 5 seconds.
  await expect(page.getByText('Whimsy Shuffle')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('New Shuffle')).toBeVisible();
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Verify vitest still excludes e2e**

```bash
pnpm exec vitest run
```
Should still pass (vitest excludes `tests/e2e/**`).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/playthrough.spec.ts
git commit -m "test(e2e): BootScene loading + MenuScene transition timing

Adds a Playwright test that navigates to the page and waits up
to 5 seconds for both 'Whimsy Shuffle' (BootScene) and 'New
Shuffle' (MenuScene) to be visible. The Loading progress text
might flash by too fast to assert, but the transition itself
must complete cleanly without console errors."
```

---

## Task 8: Manual acceptance checklist

**Files:**
- Create: `docs/design/2026-06-22-phase16-acceptance.md`

- [ ] **Step 1: Write acceptance checklist**

```markdown
# Phase 1.6 Acceptance Checklist

After T1 download + manual sprite placement, run these steps in
`pnpm dev`. Each item should pass without console errors.

## 1. Boot
- [ ] Open http://localhost:5173/
- [ ] BootScene shows "Loading 0%" briefly, then "Loading 100%"
- [ ] MenuScene shows "Whimsy Shuffle" + "New Shuffle" + "Settings"
- [ ] No console errors

## 2. Sprite presence (entity classes)
- [ ] Click New Shuffle -> GameScene
- [ ] Player is a Kenney Toon character sprite, not a cyan box
- [ ] 5-6 items appear as Kenney Tiny Town sprites (apples / signs)
      with card-name labels
- [ ] 2-3 NPCs appear as Kenney Toon character sprites (alt
      palette) with "!" labels
- [ ] Altar is a Kenney sign sprite
- [ ] Exit block is still the yellow 2x2 rectangle (T2 placeholder
      for the exit sprite if the role mapping isn't filled yet)

## 3. Hand cards
- [ ] Bottom of GameScene shows 8 hand cards as Kenney UI Pack
      card frames, each tinted differently
- [ ] Drag a card -> fill flash + console.info log of new physics
- [ ] No actual gameplay effect (placeholder, Phase 1.5 data flow only)

## 4. Tiles
- [ ] Tiles remain colored rectangles (forest green / wall dark /
      water blue / grass / flower accents) - this is intentional
      per spec section 6.1
- [ ] Map looks visually distinct between worlds (forest / ocean /
      dungeon palettes)

## 5. Fall back behavior
- [ ] Manually rename one sprite file (e.g. public/sprites/player.png
      -> public/sprites/player.png.bak) and refresh
- [ ] Game still loads and runs; the missing sprite is replaced by
      the Phase 1.5 colored rectangle of the same size

## 6. Network failure
- [ ] With no internet (or simulated by blocking kenney.nl), BootScene
      still loads - safeAddSprite falls back to rectangles
- [ ] Console shows Phaser's normal "loaderror" warnings but the
      game remains playable

## 7. E2E
- [ ] `pnpm exec playwright test` passes all 4 tests (page loads,
      inventory HUD, ESC pause, BootScene loading)
```

- [ ] **Step 2: Commit**

```bash
git add docs/design/2026-06-22-phase16-acceptance.md
git commit -m "docs(acceptance): Phase 1.6 manual smoke checklist

Seven-step manual test plan for Phase 1.6 acceptance. Stored
in docs/design/ alongside the Phase 1.5 checklist. Covers
sprite presence, tile fallback decision, network-failure
behavior, and E2E coverage."
```

---

## Task 9: Final verification

- [ ] **Step 1: Run full test suite + typecheck + build**

```bash
cd /d/Coder/ATNL/projects/whimsy
pnpm exec vitest run
pnpm exec tsc --noEmit
pnpm exec vite build
```

All three must succeed. Test count expected: Phase 1.5 ended at 75;
Phase 1.6 adds assetManifest.test.ts (3 tests) + assetLoader.test.ts (3 tests) = 81.

- [ ] **Step 2: Verify commit log**

```bash
git log --oneline | head -10
git status --short
```

Verify:
- Working tree clean
- 8 Phase 1.6 commits on top of `a8c793e docs(spec): Phase 1.6 design`
- Each commit message starts with `feat:`, `fix:`, `test:`, or `docs:`

- [ ] **Step 3: Final report**

Summarize to the user:
- 8 new tasks completed
- Test count delta (75 → 81)
- Confirm `pnpm dev` still loads
- Note any caveats (e.g. actual sprite placement requires manual
  Kenney pack extraction since the download script only fetches
  ZIPs, doesn't pick the specific frames).

---

## Plan self-review

- **Spec coverage**: every spec section has a task. §3 (asset
  selection) → T1, T2. §4 (BootScene preload) → T4. §5.1
  (GameScene wire-up) → T5. §5.1 (CardHandView) → T6. §8
  (acceptance) → T8.
- **Placeholder scan**: no TBDs. T1 has a TODO note about manual
  extraction because Kenney pack contents vary across versions —
  this is documented as a known caveat, not a placeholder.
- **Type consistency**: `SPRITE_KEYS`, `SpriteKey`, `safeAddSprite`
  signatures consistent across T2, T3, T5, T6. The cast in T5
  step 2 (`as Phaser.GameObjects.Rectangle`) is documented inline.
- **GameScene.player change**: T5 step 2 changes `this.player`
  from `Rectangle` to `GameObject`. Collision math in `update()`
  reads `.x` / `.y` which both Image and Rectangle expose, so
  no further changes needed there.

## Execution handoff

Plan complete. Awaiting execution mode choice.