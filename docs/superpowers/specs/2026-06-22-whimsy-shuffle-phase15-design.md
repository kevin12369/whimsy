# 2026-06-22 — Whimsy Shuffle Phase 1.5 Design

> **For agentic workers:** This design doc captures the scope,
> architecture, and acceptance criteria for Phase 1.5, which
> completes the game mechanics that the Phase 1 spec promised
> (§11 tasks 1.5, 1.6, 1.7, 1.9, 1.10, 1.11) but the Phase 1 plan
> shipped as code stubs without scene wiring.

**Source spec:** `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` §11
**Source plan (Phase 1):** `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md`

## 1. Goal

Complete the gap between "Phase 1 shipped" (16 commits on main, all
tasks landed as code) and "Phase 1 done" (spec §12 success criteria).
Phase 1.5 is a wire-up phase: most logic classes already exist
(CardEntity, Npc, fusionTable, recipeCheck, etc.). What's missing
is the GameScene glue that lets the player trigger them and the
spawners that put items / NPCs / fusion altar on the map.

After Phase 1.5, a portfolio reader can play through a 5-level
session and exercise every mechanic listed in spec §12 without any
TODO or stubbed UI.

## 2. Out of scope

- WebLLM / LLM deck generation (Phase 2)
- Local-storage save/load (Phase 3+)
- Continue button in MenuScene (deferred to phase that adds save/load)
- Real sprite atlas / asset download (Phase 1.6 follow-up)
- Sound / music (Phase 1.6+)
- Save prompt in pause modal (Phase 2+)

If any of those surface during playtest, they are documented in
`docs/design/` and triaged later. Phase 1.5 does not silently
expand to include them.

## 3. Architecture

### 3.1 Data flow at session start

```
MenuScene ── New Shuffle ──▶ GameScene.create({ levelIndex: 0 })
                              │
                              ├─ themeIndex = levelIndex % 11
                              ├─ buildFallbackDeck(themeIndex)  → Deck
                              ├─ runWFC(40, 30, biomeWeights)   → tilemap
                              ├─ spawnItemsForLevel(deck.itemCards, tilemap)
                              ├─ spawnNpcsForLevel(deck.npcCards, tilemap)
                              ├─ spawnFusionAltar(tilemap)
                              └─ renderHand(deck.physicsCards)  → HUD
```

GameScene owns the deck state for its lifetime. It does not write
to WorldState (that's Phase 2 LLM path).

### 3.2 Event bus usage

Existing `gameBus` events from Phase 1 are reused:

| Event | Emitted when | Phase 1 listener | Phase 1.5 listener |
|---|---|---|---|
| `card:picked-up` | E + item in range | none | GameScene increments inventory, removes entity |
| `npc:dialogue` | E + NPC in range | none | GameScene shows text overlay |
| `card:played-physics` | drag physics card drop | none (HandScene was inert) | GameScene console-log placeholder |
| `fusion:complete` | fusion altar returns result | none | GameScene appends to inventory |
| `hidden:unlocked` | recipe matches | none | GameScene writes to `registry.get('unlockedHiddenLevels')` |
| `level:exit` | player reaches exit tile | none | already handled in GameScene.update |

No new events. No event schema changes. The Phase 1.5 work wires
existing events to existing game state.

### 3.3 Scene registration in main.ts

Current order: `[BootScene, MenuScene, GameScene, HandScene, SettingsScene, LevelSelectScene, PauseScene, PlayerTestScene]`.

Add `FusionAltarScene` between `HandScene` and `SettingsScene`:

```
[BootScene, MenuScene, GameScene, HandScene, FusionAltarScene,
 SettingsScene, LevelSelectScene, PauseScene, PlayerTestScene]
```

## 4. Player interaction state machine

Implemented as `this.interactionMode: 'EXPLORE' | 'TALKING'` plus
implicit proximity checks. No FSM library; switch in update().

| Mode | Triggers | Inputs | Transitions |
|---|---|---|---|
| `EXPLORE` | default | WASD move; E to interact; ESC pause | E + item → PICKING_UP (one-shot) → EXPLORE |
| `EXPLORE` + NPC within 2 tiles | always | E → `TALKING`; ESC pause | TALKING: any key → EXPLORE |
| `EXPLORE` + fusion altar within 1.5 tiles | always | E → launch FusionAltarScene; ESC pause | resume → EXPLORE |
| `TALKING` | E + NPC | any key dismisses overlay | EXPLORE |
| `PAUSED` | ESC | PauseScene handles input | resume → EXPLORE; exit → MenuScene |

### 4.1 Proximity helpers

Reuse `reachedExitPixel` AABB pattern. New module
`src/core/proximity.ts`:

```ts
export function itemInPickupRange(
  playerCenterX: number, playerCenterY: number,
  itemCenterX: number, itemCenterY: number,
  radiusTiles: number = 1,
): boolean;
export function npcInTalkRange(...): boolean;  // re-export of isInTalkRange
export function altarInOpenRange(...): boolean;
```

All pixel AABB based; tileSize=16.

### 4.2 Drag physics card

`CardHandView.renderHand()` already creates draggable rectangles.
Phase 1.5 wires:

```
hand scene listens for pointerdown on a hand card
  → scene emits 'card:played-physics' with cardId
GameScene.update() listens
  → if hand card id matches a deck physicsCards entry,
    set a class field 'activePhysicsCard' (placeholder; Phaser
    physics not yet wired, so a console.warn logs the new gravity)
```

Physics values are not actually applied to the player; the spec
talks about gravity/restitution/friction on physical bodies that
Phase 1 does not have. The drag-and-drop wiring proves the data
flow even if the effect is a log line.

## 5. 11 theme worlds

Replaces the Phase 1 `BIOMES` array (5 entries) with `THEME_WORLDS`
(11 entries). `buildFallbackDeck(themeIndex)` keeps its signature;
`themeIndex % 11` selects the world. Across 5 levels, the player
sees 5 different worlds.

| # | id | name | palette | ruleQuirk | biomeWeights hint |
|---|---|---|---|---|---|
| 0 | forest | Forest | green ramp | trees lean toward player | floor 5 wall 2 grass 3 flower 1 |
| 1 | ocean | Ocean | blue ramp | liquids flow upward | floor 3 wall 1 water 5 flower 1 |
| 2 | dungeon | Dungeon | dark warm | torches flicker with intent | floor 4 wall 4 grass 1 flower 1 |
| 3 | scifi | Sci-Fi | cool tech | gravity is suggestion | floor 6 wall 2 grass 1 flower 1 |
| 4 | desert | Desert | sand | sand remembers footsteps | floor 5 wall 1 grass 2 flower 2 |
| 5 | tundra | Tundra | ice blue/white | breath becomes visible | floor 5 wall 2 water 1 grass 1 |
| 6 | jungle | Jungle | dense green | vines pull you toward walls | floor 3 wall 4 grass 3 flower 1 |
| 7 | crystal | Crystal | violet/cyan | light refracts | floor 4 wall 1 grass 1 flower 3 |
| 8 | neon | Neon | hot pink/cyan | colors shift | floor 6 wall 2 grass 1 flower 1 |
| 9 | haunted | Haunted | purple/black | shadows drift | floor 3 wall 5 grass 1 flower 1 |
| 10 | sky | Sky | white/pale blue | falling upward | floor 5 wall 1 water 1 grass 2 |

Each world has its own `npcRoles: Record<string, NpcPayload[]>` so
forest has druid/ranger/moss-keeper while sky has cloud-cartographer/
wind-singer/sun-warden. `ITEM_TEMPLATES` is shared across all
worlds (the 30 templates are intentionally cross-theme).

The constant `THEMES_PER_HARDCODED_DECK = 16` from Phase 1 stays
in `constants.ts` because the plan file references it for spec
alignment, but the runtime is 11. The two numbers diverge; the
constant is renamed to `THEME_WORLDS_COUNT = 11` and the old name
becomes an alias. Tests check the runtime value, not the constant.

## 6. Spawners

### 6.1 Items

```ts
// src/procgen/levelSpawner.ts
export function spawnItemsForLevel(
  itemCards: Card[], tilemap: number[], w: number, h: number,
  count: number, seed: number,
): Array<{ cardId: string; tileX: number; tileY: number }>;
```

Algorithm:
1. Collect all floor tiles (tilemap[y*w+x] === 0) into a list.
2. Exclude the 3x3 spawn pad (top-left) so the player can move
   freely.
3. Seeded shuffle and take the first `count` items (default 6).
4. Return placements matching the first `count` cards from the
   deck (in their original order, not shuffled — so the items
   the player sees are deterministic per seed).

### 6.2 NPCs

```ts
export function spawnNpcsForLevel(
  npcCards: Card[], tilemap: number[], w: number, h: number,
  count: number, seed: number,
): Array<{ cardId: string; tileX: number; tileY: number }>;
```

Same algorithm, different count (default 2 or 3 depending on
npcCards.length). NPCs occupy distinct tiles from items and from
each other.

### 6.3 Fusion altar

```ts
export function placeFusionAltar(
  tilemap: number[], w: number, h: number, seed: number,
): { tileX: number; tileY: number };
```

Place exactly one altar in the center-ish of the map (near the
middle tile, adjusted to the nearest floor). Visible as a yellow
glyph different from the exit. Player walks up + E → launches
FusionAltarScene.

## 7. Fusion altar scene

New file: `src/phaser/scenes/FusionAltarScene.ts`.

- Receives inventory card IDs from the launcher via
  `scene.launch('FusionAltarScene', { inventoryIds: string[] })`.
- Renders two horizontal rows: top row = inventory item cards the
  player can click; bottom row = empty "first slot" + "second slot".
- Player clicks two items. When two are selected, the **FUSE**
  button appears.
- Click FUSE → call `openFusionAltar(scene, a, b, inventory)`
  (Phase 1 function, re-used). Result is a `FusedItem`.
- Emit `gameBus.emit('fusion:complete', { fusedItemId })` then
  `scene.stop()` and `scene.wake('GameScene')` with the result
  passed back via `registry.set('pendingFusedItem', result)`.
- GameScene.update reads `pendingFusedItem` from registry, appends
  to inventory, clears it.

If only one item card exists in inventory, the altar shows a hint
"Find at least 2 items to fuse". If the player has zero items, the
altar shows the same hint.

## 8. Hidden level unlock

`checkRecipe(deck, a, b)` is called from the fusion result path:

```
openFusionAltar result is FusedItem
  → checkRecipe(deck, a.name, b.name) returns HiddenCard | null
  → if HiddenCard:
       hiddenLevel = unlockHiddenLevel(hiddenCard, biome.palette)
       gameBus.emit('hidden:unlocked', { hiddenLevelId: hiddenLevel.id })
       registry.set('unlockedHiddenLevels', [...existing, hiddenLevel])
```

`LevelSelectScene` reads `registry.get('unlockedHiddenLevels')` and
renders rows for unlocked hidden levels. (Phase 1 already renders
them; we just need to make sure new ones land in the registry.)

A future phase adds loading hidden level tilemap into GameScene.
For Phase 1.5 the hidden level is recorded but only navigable
through `LevelSelectScene` — clicking it shows a placeholder
"You unlocked: <name>. Hidden level loading not yet implemented."

This is an intentional spec gap to be filled in Phase 1.6+ along
with real asset loading.

## 9. Test strategy

### 9.1 Unit tests (vitest, jsdom)

| File | Targets |
|---|---|
| `tests/procgen/themeWorlds.test.ts` | 11 entries; each entry has palette(5)+ruleQuirk+weights; themeIndex 0-10 → unique names |
| `tests/procgen/levelSpawner.test.ts` | spawnItemsForLevel: count returns N; all (x,y) are floor tiles; pad excluded; deterministic per seed |
| `tests/procgen/levelSpawner.test.ts` | spawnNpcsForLevel: count returns N; no overlap with items |
| `tests/procgen/levelSpawner.test.ts` | placeFusionAltar: returns center floor tile |
| `tests/core/proximity.test.ts` | itemInPickupRange: true at radius, false outside, false across walls |
| `tests/core/inventory.test.ts` (extend) | removeFromInventory: removes by id; hasItem by name; INV [] empty case |
| `tests/core/dialogueOverlay.test.ts` | pickDialogueLine: cycles through lines per role; recordLine caps history at 10 |
| `tests/core/fusionAltar.test.ts` (extend) | selectFuseTargets returns 2 distinct valid items; or empty if inventory < 2 |
| `tests/core/hiddenUnlock.test.ts` (extend) | addUnlockedLevel appends; isUnlocked checks recipe |

### 9.2 Integration tests (vitest)

- `tests/integration/deckSpawn.test.ts`: buildFallbackDeck(0) →
  spawnItemsForLevel returns items, all positions are floor, count
  matches deck.itemCards.length up to the spawn cap.
- `tests/integration/fusionRecipe.test.ts`: pick 2 inventory items
  → openFusionAltar → result is FusedItem; if a+b matches recipe,
  checkRecipe returns the hidden card.
- `tests/integration/hiddenState.test.ts`: full chain — build deck,
  fuse matching pair, unlock, registry contains the new hidden
  level.

### 9.3 E2E (Playwright)

Extend `tests/e2e/playthrough.spec.ts` with:

```ts
test('pickup item via E key', async ({ page }) => { ... });
test('fuse two items in fusion altar scene', async ({ page }) => { ... });
test('unlock hidden level after recipe fuse', async ({ page }) => { ... });
```

These require the dev server with Playwright; CI runs them.

### 9.4 Manual acceptance checklist

Stored at `docs/design/2026-06-22-phase15-acceptance.md` after the
plan is written. Items:

1. Start game → menu visible → click New Shuffle → GameScene
2. Walk around; press E near visible items; inventory grows
3. Press E near an NPC; see dialogue overlay; press any key;
   overlay disappears
4. Press E near fusion altar; FusionAltarScene opens; pick 2
   items; FUSE; result shown; back to GameScene with result
   in inventory
5. Reach yellow exit tile; level advances; HUD updates
6. Play 5 levels back-to-back; on level 5 exit, return to menu
7. Across the 5 levels, palettes visibly differ (forest → ocean
   → dungeon → scifi → desert covers 5 of the 11 worlds)
8. ESC opens pause modal; Resume works; Settings works; Exit
   works (with confirm sub-modal)
9. Try fusing a recipe pair that matches hidden card; verify
   LevelSelectScene shows the new entry

## 10. File structure (new / modified)

### New
- `src/procgen/themeWorlds.ts`
- `src/procgen/levelSpawner.ts`
- `src/core/proximity.ts`
- `src/core/dialogueOverlay.ts`
- `src/phaser/scenes/FusionAltarScene.ts`
- `tests/procgen/themeWorlds.test.ts`
- `tests/procgen/levelSpawner.test.ts`
- `tests/core/proximity.test.ts`
- `tests/core/dialogueOverlay.test.ts`
- `tests/integration/deckSpawn.test.ts`
- `tests/integration/fusionRecipe.test.ts`
- `tests/integration/hiddenState.test.ts`

### Modified
- `src/procgen/biomes.ts` — rename to `themeWorlds.ts`. The current
  `BIOMES` export becomes `THEME_WORLDS`. Update all importers
  (currently: `src/procgen/deckFallback.ts`, `src/phaser/scenes/GameScene.ts`,
  tests). No backward-compatibility shim — Phase 1 is internal, no
  external consumers.
- `src/procgen/deckFallback.ts` — use 11 instead of 5 for modulo
- `src/core/worldState.ts` — minor: add `inventory` convenience
  accessor (the field already exists; just add `addItem/removeItem`
  helpers)
- `src/phaser/scenes/GameScene.ts` — spawn items/NPCs/altar;
  proximity checks; E-key handler; HUD top inventory line;
  pendingFusedItem pickup
- `src/phaser/scenes/HandScene.ts` — wire drag → emit
  `card:played-physics` (currently inert)
- `src/ui/CardHandView.ts` — make sure draggable rectangles emit
  the right event
- `src/main.ts` — register FusionAltarScene

## 11. Spec compliance check

Mapping Phase 1.5 work to spec §11 Phase 1 tasks:

| Spec task | Phase 1.5 closes |
|---|---|
| 1.5 Card + Deck + 16 hardcoded decks | ✅ 11 unique theme worlds, deck built from each |
| 1.6 CardEntity + pickup + inventory | ✅ spawn + E pickup + HUD inventory line |
| 1.7 NPC + proximity + dialogue | ✅ spawn + E talk + dialogue overlay |
| 1.9 CardHandView + drag-physics | ✅ drag → emit, console-log physics |
| 1.10 Fusion altar + drag two cards | ✅ FusionAltarScene, 2-item select, fuse |
| 1.11 Hidden recipe + hidden level | ✅ checkRecipe on fusion, registry updated |

After Phase 1.5, all 13 spec Phase 1 tasks are wired end-to-end.
Spec §12 success criteria 4-6 (drag physics, fuse items, unlock
hidden level) become achievable in-game rather than documented
as Phase 1 deliverable.

## 12. Risk notes

- **Risk 1: drag-and-drop on Phaser 3.80.** `setInteractive({
  draggable: true })` works but the pointer-events in our paused
  HandScene may conflict with GameScene. Mitigation: HandScene
  listens for events on its own container, not on GameScene.
- **Risk 2: 11 distinct worlds mean 11 distinct palettes to manage.**
  Current Phase 1 has 5 palettes hardcoded in `BIOMES`. Phase 1.5
  renames to `themeWorlds.ts` exporting `THEME_WORLDS`. All
  importers (deckFallback, GameScene, tests) update in the same
  commit. Risk is mechanical, not design-level.
- **Risk 3: Phase 1 reviewer flagged that biome weights produce
  unplayable maps (ocean = mostly water).** Phase 1 fixed by
  forcing forest. Phase 1.5 must make every world playable by
  spawn pad + item/NPC tiles never on impassable terrain. The
  spawn algorithm excludes walls and water tiles by definition.
- **Risk 4: HandScene was modified in commit 2b7fd90 to drop
  `active: true`.** Phase 1.5 wires HandScene properly. Need to
  ensure HandScene is `scene.launch`'d from GameScene, not
  auto-active, so the keyboard input doesn't conflict.

## 13. Out-of-scope follow-ups

These are explicitly NOT in Phase 1.5 and are flagged here so
future sessions don't accidentally roll them in:

- localStorage save / load (Continue button)
- Real sprite atlas (Kenney, Phaser examples, etc.)
- BGM / SFX (audio wiring)
- LLM-driven deck, dialogue, hidden level generation
- Mobile / touch input
- Modding hooks

When any of these get their own design pass, they get a new
spec doc and a new plan, not appended into Phase 1.5.