# 2026-06-22 — Whimsy Shuffle Phase 1.7 Design

> **For agentic workers:** This design captures Phase 1.7, which
> closes two spec-required mechanics that Phase 1.5 stubbed out:
> hidden level tilemap loading (spec §11 task 1.11) and physics
> drag real application (spec §11 task 1.9). It also rewrites
> spec §11 task 1.3 from top-down to platformer because that's
> the only way physics drag produces visible gameplay effect.

**Source spec:** `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` §11
**Source plan (Phase 1):** `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md`

## 1. Goal

Phase 1.5 ships a fully playable top-down game but two spec
mechanics are stubbed:
- Drag a physics card → `console.info` placeholder (no actual
  physics change).
- Unlock a hidden level via fusion → registry updated but
  LevelSelectScene shows "Hidden level loading not yet implemented"
  text instead of letting the player enter the level.

Phase 1.7 closes both gaps. Because the player physics model has
to change for drag to be visible, the spec §11 task 1.3
("top-down, WASD + mouse aim") is rewritten to platformer.

After Phase 1.7, a portfolio reader can:
- Drag a physics card and watch the player jump differently
- Fuse a hidden recipe pair, see the level appear in Level Select,
  enter it, play through it, and exit

## 2. Out of scope

- Multiple hand-authored hidden levels (Phase 1.7 ships 1 — `box_world`)
- LLM-generated hidden level content (Phase 2+)
- True side-scroll camera follow (Phase 1.7 fits the whole map to viewport)
- Sound effects on jump / land / fuse (Phase 1.8+)
- Save/load + Continue button (deferred)
- FusionAltar UI redesign (deferred; separate doc)
- Top-down mode (removed; spec 1.3 rewritten)

If any of these come up during Phase 1.7, log a follow-up note but
do not expand scope.

## 3. Spec amendment

Spec §11 task 1.3 currently reads:

> 1.3 Player controller (top-down, WASD + mouse aim)
> Done when: Player can move, collide with walls

**Rewritten** for Phase 1.7:

> 1.3 Player controller (platformer side-scroll, WASD + Space jump + mouse aim)
> Done when: Player can run, jump over gaps, collide with walls and platforms, fall onto the ground

This is the only spec text change. All other §11 tasks stay as-is.
The amendment is captured in §11 of the new design and at the
top of the Phase 1.7 spec file (we'll add a note that this is
the amendment to the Phase 1 spec).

## 4. Architecture

### 4.1 Phaser physics configuration

Main `src/main.ts` Phaser config gains a `physics` block:

```ts
physics: {
  default: 'arcade',
  arcade: {
    gravity: { x: 0, y: 800 },
    debug: false,
  },
},
```

The 800 default gravity is what `defaultPhysics()` in
`physicsApply.ts` already produces, so no surprises on level start.

### 4.2 Player as physics sprite

`src/phaser/entities/Player.ts` changes from a static `Rectangle`
helper to a Phaser physics sprite. The exact class isn't a
`Phaser.Physics.Arcade.Sprite` subclass because we want to keep
`computeMove()` style code paths for tests. Instead the new
`Player` class:

- holds a `Phaser.GameObjects.Rectangle` for visual rendering
- has a `Phaser.Physics.Arcade.Body` attached via `scene.physics.add.existing(rect, false)`
- exposes `setVelocity(x, y)`, `setGravityY(y)`, `setDrag(x)`, `setBounce(value)`

The existing `Player.ts` exports `computeMove()` and `canMoveTo()`
are still used by **unit tests** for the math. They are no
longer called from `GameScene.update()` because Phaser Arcade
handles movement + collision in the physics step.

### 4.3 GameScene flow

```
GameScene.create({ mode, levelIndex?, deck?, hiddenLevelId? }):
  if hiddenLevelId: load config from HIDDEN_LEVELS[hiddenLevelId]
  else: deck-based level (Phase 1.5 path)
  build tilemap (WFC with weights from config)
  force floor pads (3x3 around player spawn + exit + each entity)
  spawn items / NPCs / altar
  add player sprite at playerSpawn position (tileX, tileY)
  enable physics body, set body.gravity.y, body.drag.x
  bind WASD + Space to body.setVelocityX / setVelocityY on jump

GameScene.update(dt):
  if mode === 'platformer':
    - left/right keys -> body.setVelocityX(±speed)
    - space + body.onFloor() -> body.setVelocityY(-jumpSpeed)
    - proximity checks (item, NPC, altar, exit) unchanged from Phase 1.5
  if reachedExit: advanceLevel / return to MenuScene
```

### 4.4 Physics drag real application

```
1. Player drags physics card in HUD
2. CardHandView.rect.pointerup -> scene.game.events.emit('card:played-physics', { cardId })
3. HandScene listener (Phase 1.5):
     - look up deck.physicsCards by cardId
     - currentPhysics = applyPhysics(currentPhysics, payload)  // cumulative
     - events.emit('physics:changed', currentPhysics)
4. GameScene listener (Phase 1.7 NEW):
     - listens for 'physics:changed' on scene.events
     - this.player.body.setGravityY(currentPhysics.gravity)
     - this.player.body.setDrag(currentPhysics.friction, 0)
     - this.player.body.setBounce(currentPhysics.restitution)
     - visual feedback: hand card flashes, console.info logs the change
```

Note: `setDrag(x, y)` takes the per-axis drag coefficient in
Phaser Arcade. We set `drag.x` from the card's `friction` and
leave `drag.y = 0` so vertical motion is governed by gravity +
bounce alone.

### 4.5 Hidden level loading

```
1. Player fuses recipe pair in FusionAltarScene
2. checkRecipe + unlockHiddenLevel -> registry.set('unlockedHiddenLevels', [...existing, hl])
3. (Existing Phase 1.5 path)

4. MenuScene shows three buttons: New Shuffle, Level Select, Settings
5. LevelSelectScene reads registry.unlockedHiddenLevels and renders rows
6. Click hidden row -> scene.start('GameScene', { hiddenLevelId: hl.id, mode: 'platformer' })

7. GameScene.init({ hiddenLevelId }):
     - if hiddenLevelId: load HIDDEN_LEVELS[hiddenLevelId]
     - else: deck-based level (Phase 1.5 path)
8. GameScene.create() builds the level from the chosen config
```

## 5. Data flow

### 5.1 Hidden level JSON shape

`src/config/hiddenLevels.ts`:

```ts
export type Tile = 0 | 1 | 2 | 3 | 4;

export interface HiddenLevelConfig {
  id: string;
  name: string;
  paletteOverride: string[];
  ruleQuirk: string;
  tilemapSpec: {
    width: number;          // 60 cols typical
    height: number;         // 18 rows typical
    seed: number;           // for WFC
    weights: Record<Tile, number>;
  };
  playerSpawn: { tileX: number; tileY: number };
  exitPos: { tileX: number; tileY: number };
  npcs: Array<{ tileX: number; tileY: number; role: string; dialogue: string }>;
  items: Array<{ tileX: number; tileY: number; itemName: string }>;
  physicsOverrides?: { gravity?: number; friction?: number; restitution?: number };
}

export const HIDDEN_LEVELS: Record<string, HiddenLevelConfig> = {
  'box_world': {
    id: 'box_world',
    name: 'Box World',
    paletteOverride: ['#3a0ca3', '#7209b7', '#b5179e', '#f72585', '#4cc9f0'],
    ruleQuirk: 'a hidden world has opened',
    tilemapSpec: {
      width: 60, height: 18, seed: 999,
      weights: { 0: 5, 1: 2, 2: 0, 3: 3, 4: 1 },
    },
    playerSpawn: { tileX: 2, tileY: 14 },
    exitPos: { tileX: 58, tileY: 14 },
    npcs: [
      { tileX: 20, tileY: 14, role: 'box warden', dialogue: 'You found Box World. Welcome.' },
    ],
    items: [],
    physicsOverrides: { gravity: 600 },  // lighter gravity = floaty feel
  },
};
```

`HIDDEN_LEVELS` is the data source. The same `runWFC` function
that Phase 1.5 uses for regular levels also drives hidden
levels — only the seed, weights, width, and height come from
the config.

### 5.2 Player physics body type

We do NOT subclass `Phaser.Physics.Arcade.Sprite` because that
makes unit testing harder (Phaser scenes don't load cleanly in
jsdom). Instead `Player` keeps a `Rectangle` for visuals and
attaches a Phaser `Body` to it via `scene.physics.add.existing()`.

The Player class exposes a thin wrapper that takes a `physicsState`
and applies it to the body:

```ts
class Player {
  private currentPhysics: PhysicsState = defaultPhysics();

  applyPhysics(p: PhysicsState) {
    this.currentPhysics = p;
    if (!this.body) return;
    this.body.setGravityY(0, p.gravity);
    this.body.setDrag(p.friction, 0);
    this.body.setBounce(p.restitution);
  }

  update(keys, sceneHeight) {
    if (!this.body) return;
    const vx = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    const speed = 200;
    this.body.setVelocityX(vx * speed);
    // Space jump: only when onFloor
    if (keys.space && this.body.onFloor()) {
      const jumpSpeed = -Math.sqrt(2 * p.gravity * 40);  // ~30px high jump
      this.body.setVelocityY(jumpSpeed);
    }
  }
}
```

`sceneHeight` is the tile-y of the floor for the player. It's
set at create time from the tilemap (playerSpawn.tileY).

### 5.3 PlayerTestScene (Phase 1 dev helper)

`PlayerTestScene` was a sandbox used during Phase 1 development.
It still works under platformer — its WASD listener now uses
the new `Player.update()`. We don't break it; we just make sure
it loads with the new physics config (it already does, since
the physics block is in main.ts).

A `tests/integration/playerTestSceneLoads.test.ts` will confirm
that the test scene's `create()` does not throw under the new
physics-enabled game config.

## 6. File structure

### New
- `src/config/hiddenLevels.ts` — `HIDDEN_LEVELS` map + types
- `src/phaser/entities/Player.ts` — REWRITE — physics sprite wrapper
- `tests/core/hiddenLevels.test.ts`
- `tests/core/physicsState.test.ts`
- `tests/integration/hiddenLevelLoad.test.ts`
- `tests/integration/physicsFlow.test.ts`

### Modified
- `src/main.ts` — add `physics: { default: 'arcade', ... }` block
- `src/phaser/scenes/GameScene.ts` — major rewrite: physics body, jump handler, hidden level path
- `src/phaser/scenes/LevelSelectScene.ts` — wire clickable rows that scene.start to GameScene
- `src/phaser/scenes/MenuScene.ts` — add 'Level Select' button
- `src/phaser/scenes/HandScene.ts` — listener update for physics:changed now also emits to GameScene.events (already does this in Phase 1.5; verify)
- `src/procgen/wfc.ts` — keep as-is (works for any w/h/seed/weights)

### Spec amendment
- `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` §11 task 1.3 — replace 'top-down' with 'platformer'

## 7. Acceptance checklist

After Phase 1.7 ships, the player can:

1. New Shuffle -> enter a level (platformer, side-scroll)
2. Walk with A/D or Left/Right arrow keys
3. Press Space to jump (only when feet on ground)
4. Drag a physics card in the HUD:
   - "moon bounce" (gravity 200) -> player jumps higher, falls slower
   - "heavy brine" (gravity 1400) -> player jumps shorter, falls fast
   - "icy ground" (low friction) -> player slides after key release
   - "sticky vine" (high friction) -> player stops abruptly
5. Fuse two items whose names match a deck hidden recipe
6. Return to menu (Esc -> Exit), see "Level Select" button
7. Click Level Select -> see base 5 levels + 1 unlocked hidden row
8. Click hidden row -> GameScene loads box world
9. Walk to box world exit -> return to LevelSelectScene

## 8. Risk notes

- **Risk 1**: Phaser Arcade physics is non-deterministic across
  browsers. Frame rate, timestep, and collision tuning vary.
  We set `physics.arcade.fps: 60` to lock it down.
- **Risk 2**: Player physics sprite + tilemap tile collision needs
  the tilemap rendered as a `Phaser.GameObjects.TileSprite` or as
  multiple bodies. Phase 1.7 uses multiple bodies (one per tile)
  for simplicity. A future task can swap to a tile map layer.
- **Risk 3**: Drag physics card sets `body.gravity.y` mid-air.
  The jump in progress at the moment of drag gets a new gravity.
  Visually this may feel jarring. Mitigation: disable drag mid-air
  by checking `body.onFloor()` before applying.
- **Risk 4**: Top-down spec task 1.3 rewrite is a backward-incompat
  change. The portfolio reader who clones after this commit sees
  platformer, not top-down. This is acceptable per user choice.

## 9. Future tasks (out of scope here)

- More hand-authored hidden levels (currently just `box_world`)
- LLM-generated hidden level content
- Save/load + Continue button
- Sound (BGM/SFX)
- Camera scroll for larger levels
- Mobile / touch input

When any of these get their own design pass, they get a new
spec doc and a new plan, not appended into Phase 1.7.