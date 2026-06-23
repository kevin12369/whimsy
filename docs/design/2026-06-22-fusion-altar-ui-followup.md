# 2026-06-22 — FusionAltarScene UI Followup (out of scope)

## Decision

After Phase 1.5 commit `673d0bd` shipped a minimum-viable FusionAltarScene
(Back button + ESC exit), the user reviewed the result and flagged
the UI as not yet polished. After discussion we agreed to record
the desired improvements as a follow-up design and **defer
implementation** rather than extend Phase 1.5 scope further.

## What Phase 1.5 shipped

- 6 inventory cards rendered as a horizontal row (top of scene).
- Two slot rectangles (center) showing "Slot 1" / "Slot 2" placeholder text.
- Click two cards → they highlight purple, slots update on first
  selection (visual feedback was a TODO before this fix).
- FUSE button at y=580, Back button at y=660.
- ESC keybinding cancels fusion.
- Result text overlay shows "Fused: <name>" for 3 seconds before
  scene closes.
- Hidden unlock: if recipe matches, `unlockedHiddenLevels` registry
  entry is appended.

## Known issues observed during playtest

1. **Layout density**: 5 vertical bands (title / inventory row / slot row /
   FUSE / Back) crammed into 720p viewport. Bottom edge feels cramped.
2. **Back discoverability**: Back was hidden behind FUSE in commit
   `673d0bd`'s predecessor, fixed only by moving y. A more visually
   distinct Back (text link, not a button) would be clearer.
3. **Slot placeholders**: "Slot 1" / "Slot 2" text is shown until a
   card is selected. With both slots empty, the player has to guess
   that "select a card first".
4. **No keyboard support**: only mouse clicks work. No number-key
   shortcuts, no Enter to FUSE, no Tab focus management.
5. **No card flying animation**: when a card is selected it just
   changes color. A satisfying slot fly-in would be expected in
   any modern fusion UI.
6. **Result feedback is transient**: 3 seconds of yellow text, then
   back to GameScene. The new fused item is also added to inventory
   but the player has no time to read its stats.
7. **No undo**: once a card is selected, only way to deselect is to
   click it again. No "clear slots" button.
8. **Hidden unlock is invisible to the player**: the recipe match fires
   `gameBus.emit('hidden:unlocked', ...)` and pushes to registry, but
   there's no UI feedback inside the scene. The player doesn't know
   they just unlocked a hidden level.
9. **Inconsistent style with PauseScene**: PauseScene uses three
   rounded buttons; FusionAltarScene uses text labels. Visual
   inconsistency between modals.
10. **Hard-coded coordinates**: y=580, y=660, etc. Resizing the
    canvas (Phase 1.6 might add a 1080p mode) breaks the layout.

## Proposed redesign

### A. Layout (P0 — recommended next iteration)

```
┌────────────────────────────────────┐
│   [Fusion Altar]      [Esc]       │   title + hint, height 50
│                                    │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐      │   inventory cards
│   │glass│ │vine│ │fern│ │marr│      │   smaller, click to pick
│   │fang│ │whip│ │chip│ │bead│      │
│   └────┘ └────┘ └────┘ └────┘      │
│                                    │
│         ┌──────┐  ┌──────┐         │   slot boxes (now with
│         │      │  │      │         │   border highlight when
│         │  ?   │  │  ?   │         │   filled)
│         └──────┘  └──────┘         │
│                                    │
│        ┌────────────────┐          │   big FUSE button
│        │      FUSE      │          │   height 60, width 240
│        └────────────────┘          │
│                                    │
│        [Back to GameScene]          │   text link, low-emphasis
└────────────────────────────────────┘
```

### B. Keyboard interactions (P0)

- 1-6: toggle inventory card matching the visible index
- Enter or Space: FUSE (when 2 selected)
- Escape: cancel
- Backspace: clear both slots

### C. ModalScene base class (P1)

Extract a `ModalScene` base class so PauseScene and FusionAltarScene
share:
- Semi-transparent background overlay
- Title + ESC-to-close binding
- Consistent text styles

Phase 1.5 modals (PauseScene, FusionAltarScene, SettingsScene) would
each be 30-50 lines shorter.

### D. Card fly-in animation (P2)

When a card is selected:
- Original card scales 1.0 → 0.5 over 200ms
- A duplicate of the card tweens to the slot position over 300ms
- Slot scales 0.8 → 1.0 + glow effect on landing

This needs Phaser tween API (already used in GameScene for floating
text).

### E. Hidden unlock feedback (P1)

When a recipe matches:
- Result text changes to "Fused: X (RECIPE MATCHED!)"
- A small "Hidden level unlocked: <name>" line appears below
- For 5 seconds before returning to GameScene

Currently the recipe match is silent; the only feedback is via
registry, which the player doesn't see in the altar scene.

### F. Style unification (P2)

- All modal text uses a single `STYLE.title` / `STYLE.body` / `STYLE.hint` constants object
- Buttons share a `makeButton(scene, label, onClick, primary: boolean)` helper
- Color palette pulled from `themeWorlds[current].palette` so the altar scene matches the current world

### G. Responsive layout (P3)

Replace hard-coded coordinates with:
- `scene.scale.width / 2` for horizontal centers
- `scene.scale.height * 0.1` for top margin, etc.

Lets Phase 1.6 swap canvas resolution without rewriting every modal.

## Effort estimate

| Option | Effort | Files touched |
|---|---|---|
| A only (layout) | 30-45 min | FusionAltarScene.ts |
| A + B (layout + keyboard) | 1 hour | FusionAltarScene.ts |
| A + B + E (with feedback) | 1.5 hours | FusionAltarScene.ts |
| C (ModalScene base) | 1-2 hours | new ModalScene.ts + refactor PauseScene + FusionAltarScene |
| D (animations) | 1 hour | FusionAltarScene.ts |
| F (style unification) | 30 min | new modalStyles.ts |
| G (responsive) | 1 hour | all modal scenes |

If implemented together as one focused effort: **3-4 hours** for
A+B+C+E+F+G with a clean shared style. Without C/G, a 1-hour fix
of A+B+E alone would already feel like a big improvement.

## Triggers for re-evaluation

- Playtest shows new players confused by the altar
- Phase 2 adds save/load and the altar becomes a frequent destination
- Mobile port (Phase 4+) requires responsive layouts anyway

## Out of scope for now

- Real card sprite assets (Phase 1.6 — `scripts/download-assets.mjs`)
- Sound feedback on FUSE / cancel (Phase 1.6+)
- Animation easing curves tuned for "satisfying" feel (D, above)

This document exists so the next session knows where Phase 1.5
stopped on the altar UI and what's already been considered.