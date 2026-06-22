# Phase 1.5 Acceptance Checklist

Run these steps in a fresh `pnpm dev` session after Task 10 lands.
Each item should pass without console errors.

## 1. Boot
- [ ] Open http://localhost:5173/
- [ ] Title "Whimsy Shuffle" visible
- [ ] "New Shuffle" + "Settings" buttons visible
- [ ] No console errors

## 2. Enter GameScene
- [ ] Click "New Shuffle"
- [ ] HUD top-left shows "Level 1/5 | World: <name>"
- [ ] 1-6 orange item rectangles visible on the map
- [ ] 2-3 green NPC rectangles with "!" visible
- [ ] 1 magenta altar glyph visible somewhere in the middle area
- [ ] Yellow exit block visible bottom-right with "EXIT" label

## 3. Pickup flow
- [ ] Walk toward an orange item (WASD)
- [ ] Top-center prompt changes to "[E] Pick up: <name>"
- [ ] Press E
- [ ] Orange rectangle disappears
- [ ] INV line updates to show the item name

## 4. NPC talk flow
- [ ] Walk toward a green "!" NPC
- [ ] Top-center prompt changes to "[E] Talk to <role>"
- [ ] Press E
- [ ] Bottom-center shows "<role>: <line>" overlay for 4 seconds

## 5. Fusion altar flow
- [ ] Walk toward magenta altar glyph
- [ ] Top-center prompt: "[E] Open Fusion Altar"
- [ ] Press E
- [ ] FusionAltarScene opens
- [ ] Pick 2 inventory items, click FUSE
- [ ] Result text shows in middle: "Fused: <name>"
- [ ] Click Back -> return to GameScene
- [ ] New fused item appears in INV

## 6. Hidden unlock
- [ ] Find a recipe pair (item card name that matches the deck's
      hidden card unlockRecipe). Easiest way: read the deck from
      DevTools or just try several combinations.
- [ ] Fuse that pair -> FusionAltarScene triggers hidden:unlocked
- [ ] Open menu (Esc) -> check Level Select (if accessible from menu)

## 7. Level progression
- [ ] Walk into yellow EXIT block
- [ ] Scene restarts with "Level 2/5 | World: <new name>"
- [ ] Repeat for levels 2-4
- [ ] On level 5 exit, return to MenuScene

## 8. Pause modal
- [ ] Press ESC any time during gameplay
- [ ] Modal overlay shows Paused + Resume / Settings / Exit to Menu
- [ ] Click Resume -> modal closes, player can move
- [ ] Click Exit -> confirm screen
- [ ] Click Yes -> MenuScene
- [ ] Click Cancel -> back to pause menu

## 9. 11 worlds visible
- [ ] Across 5 levels, the world name in HUD changes
- [ ] Palettes visually shift between forest/ocean/dungeon/scifi/
      desert/tundra/jungle/crystal/neon/haunted/sky

## 10. Hand drag (placeholder)
- [ ] Physics cards render at the bottom of GameScene
- [ ] Drag a card -> fill flash + console log of new physics
- [ ] No actual gameplay effect (Phase 1.5 ships the data flow only)
