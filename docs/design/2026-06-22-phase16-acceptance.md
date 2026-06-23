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
- [ ] Exit block is the yellow 2x2 rectangle (Phase 1.5 fallback
      is fine; the exit sprite role was not filled yet)

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

## Setup note for the player

Phase 1.6 was committed with the safeAddSprite path verified end
to end (tests pass + tsc clean + vite build clean). However,
**the actual Kenney sprite files are not committed** because:

1. `public/sprites/` is gitignored in the Phase 0 prep plan.
2. The download script (`scripts/download-assets.mjs`) only fetches
   the 3 Kenney ZIPs. Manual extraction is needed to pick one
   frame per role and rename to the expected file stem.

To finish setup for visual acceptance:

```bash
node scripts/download-assets.mjs
# unzips the 3 packs under public/sprites/{packname}/
ls public/sprites/toon-characters-1/  # inspect frame filenames
# pick e.g. a walk-down frame for the player character:
cp public/sprites/toon-characters-1/Toon_Character_1_Walk\ Down_a.png public/sprites/player.png
cp public/sprites/toon-characters-1/Toon_Character_1_Walk\ Down_b.png public/sprites/npc.png
# (etc. for each SPRITE_KEYS.role)
```

The game will work **without** these files (safeAddSprite falls
back to colored rectangles) — the visual upgrade requires the
manual cp step above. This is documented as a known caveat in the
Phase 1.6 spec, section "Risk notes".
