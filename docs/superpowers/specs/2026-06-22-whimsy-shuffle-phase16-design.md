# 2026-06-22 — Whimsy Shuffle Phase 1.6 Design

> **For agentic workers:** This design captures the polish phase
> that replaces Phase 1.5's color-rectangle placeholders with
> Kenney CC0 sprite art. No game mechanics change.

**Source spec:** `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` §10.8 (asset pipeline Phase 1)
**Source plan (Phase 1):** `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` Task 15 (asset manifest + download + atlas)

## 1. Goal

Phase 1.5 ships a fully playable game but every entity is a flat
color rectangle (player = 12×12 cyan, items = 14×14 orange, NPCs
= 16×16 green `!`, altar = 18×18 magenta `*`, tiles = 3 colors
of wall/floor/water). The mechanics work; the visual is bleak.

Phase 1.6 downloads Kenney CC0 sprite packs, registers them in
Phaser via a BootScene preload, and replaces every rectangle
placeholder with a real sprite. The game logic, tile layout,
collision detection, and HUD layout all stay the same.

After Phase 1.6, the game looks like a casual sandbox rather
than a wireframe.

## 2. Out of scope

- Sound / BGM (Phase 1.7+)
- Animation polish (Phase 1.7+)
- Larger viewport (1920×1080) — Phase 1.6 stays 1280×720
- Mobile / touch input
- LLM-driven dynamic art generation
- FusionAltar UI redesign (tracked in `docs/design/2026-06-22-fusion-altar-ui-followup.md`, deferred)

If any of these come up during Phase 1.6, log a follow-up design
note but don't expand scope.

## 3. Asset selection

### 3.1 Kenney CC0 packs

| Pack | URL | Purpose | ~size |
|---|---|---|---|
| **Toon Characters 1** | `kenney.nl/assets/toon-characters-1` | player + NPC + sign (exit) | ~3 MB |
| **Tiny Town** | `kenney.nl/assets/tiny-town` | tile (grass + stone + water + flowers) | ~5 MB |
| **UI Pack** | `kenney.nl/assets/ui-pack` | 8 hand card frames (one per physics card) | ~1 MB |

Total download: ~9 MB compressed (≈13 MB unpacked). Well within
GitHub Pages' 1 GB asset budget.

All three are CC0 (no attribution required, but the Attribution
page already lists Kenney).

### 3.2 Sprite key mapping

`src/config/assets.ts` exports a typed mapping so code reads
`SPRITE_KEYS.player` rather than remembering magic strings.

```ts
export const SPRITE_KEYS = {
  // Entities
  player:      'char_a_p1_0',    // Toon, facing down
  npc:         'char_b_p1_0',    // Toon, different palette
  item:        'apple',          // Tiny Town generic pickup
  altar:       'sign_round',     // altarpiece style
  exit:        'sign_arrow',     // post-style exit sign

  // Tiles
  tile_floor:  'tile_grass',
  tile_wall:   'tile_stone',
  tile_water:  'tile_water',
  tile_grass:  'tile_grassAccent',
  tile_flower: 'tile_flower_red',

  // Hand cards (8 distinct UI Pack frames)
  hand_moon_bounce:   'card_blue',
  hand_heavy_brine:   'card_red',
  hand_icy_ground:    'card_green',
  hand_sticky_vine:   'card_yellow',
  hand_gentle_drift:  'card_purple',
  hand_earth_pull:    'card_brown',
  hand_feather_fall:  'card_pink',
  hand_mud_walk:      'card_grey',
} as const;
```

Notes on key values:
- These are placeholders; the actual filenames are looked up
  from Kenney's ZIP extract. The plan T2 step will run
  `unzip -l` against the downloaded archives to pick real files
  matching the role (e.g. a small character for `npc`, a sign
  with an arrow for `exit`).
- After the first run, the actual filenames + sha256 are written
  to `ASSET_MANIFEST` so future runs can verify integrity.

### 3.3 Single PNG vs atlas

Decision: **single PNG per sprite**, no atlas. Phase 1.6 is small
enough (≤19 sprites) that an atlas would add complexity without
benefit. Each Kenney PNG is 5–50 KB; the 19 sprites total ~500 KB
uncompressed. Phaser `load.image(key, path)` is a one-liner.

If Phase 1.7 needs more sprites (animated idle/walk frames,
particle effects), we can introduce free-tex-packer then.

## 4. BootScene preload

Currently `BootScene` is just a 32-px title that hands off to
MenuScene. Phase 1.6 extends it to a real preloader.

```
BootScene.create():
  this.load.image(SPRITE_KEYS.player, 'sprites/player.png')
  this.load.image(SPRITE_KEYS.npc,    'sprites/npc.png')
  ... 19 sprites total ...

  this.load.on('progress', (v: number) => {
    // Update a 'Loading 42%' text in the scene.
    progressText.setText(`Loading ${Math.round(v * 100)}%`);
  });

  this.load.once('complete', () => {
    this.scene.start('MenuScene');
  });
```

The title text stays as the initial display, replaced by the
progress percentage once `progress` events start firing.

### 4.1 Graceful fall back

If a sprite fails to load (network error, missing file), the
game must remain playable. `assetLoader.preloadAllAssets(scene)`
catches load errors and records them; downstream code checks
`scene.textures.exists(key)` before adding an image and falls
back to a colored rectangle if missing.

```ts
function safeAddSprite(scene: Phaser.Scene, x: number, y: number, key: string, fallbackColor: number): Phaser.GameObjects.GameObject {
  if (scene.textures.exists(key)) {
    return scene.add.image(x, y, key);
  }
  return scene.add.rectangle(x, y, 16, 16, fallbackColor);
}
```

This guarantees a missing Kenney asset never breaks gameplay;
the player just sees the old Phase 1.5 rectangle.

## 5. Wire-up changes

### 5.1 GameScene

Every `this.add.rectangle(...)` in `GameScene.create()` becomes
`safeAddSprite(this, x, y, SPRITE_KEYS.player, 0x00ffff)`. The
remaining color-rectangle code stays as the fallback path.

Affected sections (current code lines, approximate):
- Tilemap draw: `drawTilemap` — stays as colored rectangles
  (see §6.1 for the performance reasoning).
- Player sprite: 1 sprite at center.
- Item entities: 6 sprites, one per spawn. Labels stay (card name).
- NPC entities: 3 sprites, one per spawn. `!` label stays.
- Altar: 1 sprite. `*` label stays.
- Exit block: 1 sprite. `EXIT` label stays.

The 8 physics hand cards in `CardHandView.ts` use `SPRITE_KEYS.hand_*`
keys. CardHandView is launched by HandScene which is launched
by GameScene after BootScene, so by the time the hand renders,
all sprites are loaded.

### 5.2 Cards in FusionAltarScene

Phase 1.6 keeps the inventory cards as text labels for now (no
sprite swap). Tracking the FusionAltar UI redesign in the
followup doc (§2).

### 5.3 HUD text

HUD (Level / World / INV / prompt) stays as Phaser text. Sprite
art for HUD chrome is out of scope.

## 6. Performance

### 6.1 Tilemap draw

1200 sprite draws per level is heavy. Options:

A. **Use a single big sprite as the level background** — pre-render
   all 1200 tiles into one `RenderTexture` at level start, then
   render the texture as one image. Single draw call.

B. **Use Phaser tileSprite or createMultiple** — create 1200
   images in one call, batched.

C. **Keep Phase 1.5 rectangles for tiles** — only replace player /
   item / NPC / altar / exit. Tiles stay as colored rectangles
   matching the world palette.

**Decision: C.** Tiles are tiny (16×16) and many. The Phase 1.5
rectangle approach renders 1200 rectangles in ~5ms which is fine.
Visual variety comes from the 5 distinct palette colors (forest
green, ocean blue, dungeon dark, scifi cyan, desert sand), not
from per-tile sprite art. Replacing tiles with sprites adds
~50ms of load time and ~10ms of draw time per frame for marginal
visual gain.

So Phase 1.6 sprite art covers: **player, item, NPC, altar, exit,
8 hand cards**. Tiles remain colored rectangles. This is a
deliberate scope trim.

### 6.2 Sprite size

Player sprite is 16×16 to match tile size (currently 12×12 box).
NPC sprite 16×16. Item sprite 14×14. Altar 18×18. Exit sign
16×16. All match or slightly exceed the Phase 1.5 rectangle
sizes so collision math stays identical (12 px half-extent
player, 8 px half-extent NPC, etc.).

## 7. File structure

### New
- `public/sprites/{player,npc,item,altar,exit}.png`
- `public/sprites/hand_{moon_bounce,heavy_brine,...}.png` (8 cards)

### Modified
- `src/config/assets.ts` — add `SPRITE_KEYS` mapping + populate
  `ASSET_MANIFEST` with real filenames + sha256 after download.
- `src/core/assetLoader.ts` — add `preloadAllAssets(scene)`,
  `safeAddSprite(scene, x, y, key, fallbackColor)`.
- `src/phaser/scenes/BootScene.ts` — preload + progress UI.
- `src/phaser/scenes/GameScene.ts` — `safeAddSprite` for player,
  item, NPC, altar, exit. Tilemap rectangles stay.
- `src/ui/CardHandView.ts` — `safeAddSprite` per hand card.

### New tests
- `tests/core/assetLoader.test.ts` — SPRITE_KEYS shape,
  preloadAllAssets is callable, safeAddSprite returns Rectangle
  when texture missing.

### New doc
- `docs/design/2026-06-22-phase16-acceptance.md` — manual smoke
  checklist, including visual checklist for each entity type.

## 8. Acceptance checklist (preview)

After Phase 1.6, on a fresh `pnpm dev`:

1. Boot shows "Whimsy Shuffle" title, then "Loading 0%"…100%, then
   MenuScene.
2. New Shuffle → GameScene. Player is a Kenney toon character
   sprite, not a cyan rectangle.
3. 5–6 items appear as small Kenney apple/coin sprites with
   card-name labels.
4. 2–3 NPCs appear as different-color Kenney toon sprites with
   `!` label.
5. The altar is a Kenney sign-style sprite. The exit is a Kenney
   arrow sign.
6. The 8 hand cards at the bottom of the screen are UI Pack
   card frames, each tinted differently. Drag works.
7. No console errors, no missing-asset warnings in DevTools.
8. Tiles remain colored rectangles (forest green / wall dark /
   water blue) — this is intentional, not a regression.

## 9. Risk notes

- **Risk 1**: Network-dependent. `download-assets.mjs` requires
  internet. Mitigation: script skips missing URLs, graceful
  fall back to rectangles. CI without internet still works.
- **Risk 2**: License drift. Kenney CC0 has been stable for years
  but if a pack is removed, the download fails. Mitigation: ASSET_MANIFEST
  has placeholder URLs that can be replaced if needed.
- **Risk 3**: Sprite size mismatch. If a Kenney sprite is 32×32
  instead of 16×16, the player visually overlaps multiple tiles.
  Mitigation: scale each sprite to 16×16 in `safeAddSprite` via
  `setScale(16 / sprite.width)` so any size renders uniformly.
- **Risk 4**: Token plan exhaustion mid-task. Phase 1.6 is heavy
  on real-world operations (file downloads, unzip, atlas inspection)
  — subagent dispatch may hit limits. Mitigation: inline execution
  is the documented fallback (worked for Phase 1.5).

## 10. Future tasks (out of scope here)

- Sprite atlas (free-tex-packer) for larger Phase 1.7 batches
- Animated idle/walk frames for player + NPCs
- Particle effects for pickup / FUSE / hidden unlock
- Per-world sprite palette swapping (e.g. desert uses sand tiles)
- BGM / SFX
- FusionAltar UI redesign (tracked in
  `docs/design/2026-06-22-fusion-altar-ui-followup.md`)
