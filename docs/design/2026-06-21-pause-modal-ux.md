# 2026-06-21 — Pause Modal UX (addendum to Phase 1 spec)

## Scope

This addendum records a UX design decision made during Phase 1
implementation that was **not** present in the original Phase 1 spec
(`docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` §11) or
its implementation plan
(`docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md`).

It is being captured here so future sessions do not regress it or
mistake it for an accidental scope creep — the user explicitly
requested it on 2026-06-21 after testing the deployed build.

## Gap in original spec

The original spec mentioned "pause" only in one place:

> §9 Fallback chain #5: "Browser tab backgrounded during session
> → pause model, resume on focus."

This is automatic background-pause, not a user-initiated menu.
The Phase 1 MenuScene design (§11 task 1.12) had only two buttons:
"New Shuffle" and "Settings" — there was no in-game pause, no
modal dialog, and no ESC binding.

## New design

### Trigger

- Press **ESC** during a GameScene → open the pause modal.
- The modal is a separate Phaser scene (`PauseScene`) launched
  on top of `GameScene` via `scene.launch('PauseScene')`, which
  automatically pauses the underlying GameScene's update loop.

### Modal contents

A semi-transparent black overlay (alpha 0.6) covers the canvas.
Centered stack:

```
            Paused
         [Esc] Resume
        ┌────────────┐
        │   Resume   │   <- returns to GameScene
        └────────────┘
        ┌────────────┐
        │  Settings  │   <- starts SettingsScene (existing)
        └────────────┘
        ┌────────────┐
        │ Exit to    │   <- opens confirm sub-modal
        │   Menu     │
        └────────────┘
```

### Exit confirm

Clicking "Exit to Menu" swaps the modal body for a two-button
confirm screen:

```
        Exit to Menu?
  Phase 1: progress is not saved yet.

        ┌────────────┐
        │ Yes, exit  │   <- starts MenuScene, stops GameScene + PauseScene
        └────────────┘
        ┌────────────┐
        │  Cancel    │   <- returns to pause menu
        └────────────┘
```

ESC on the confirm screen is intentionally ignored — the user
must explicitly pick Yes/No so they cannot accidentally abandon
their run by pressing ESC twice.

### Phase 1 scope limitation

This addendum does **not** implement save/load. Phase 1 is "Pure
Procgen" — no WebLLM, no persistent state. The confirm dialog
explicitly tells the user "progress is not saved yet" so the
limitation is in-product, not hidden.

When Phase 2 or later adds world persistence (localStorage or
backend), the confirm screen gains a third button:

```
        ┌────────────┐
        │ Save & Exit│   <- serialize worldState, then MenuScene
        └────────────┘
```

## Implementation files

| File | Purpose |
|---|---|
| `src/phaser/scenes/PauseScene.ts` | New — modal scene, two-screen state machine |
| `src/phaser/scenes/GameScene.ts` | Add `openPause()` method, bind ESC key |
| `src/main.ts` | Add `PauseScene` to Phaser game config `scene` array |

## Test plan

Manual (until Task 14 E2E is extended):

1. Launch New Shuffle → GameScene loads
2. Press ESC → modal appears, GameScene freezes (player cannot
   move because update() is paused via scene manager)
3. Click Resume → modal closes, GameScene resumes, player can
   move again
4. Press ESC → modal → click Settings → SettingsScene loads
5. Manually return to GameScene (no UI for this in Phase 1,
   would normally press ESC first) — verify state intact
6. Press ESC → modal → Exit to Menu → confirm Yes → MenuScene
7. Press ESC → modal → Exit to Menu → confirm Cancel → back
   to pause menu

## Why this is plan-out-of-scope but accepted

The Phase 1 plan was written before the user played the build.
Two earlier commits (`6e2c862` BootScene transition, `7e5a437`
visible exit + Esc-back-to-menu) were also small UX addenda
that emerged from playing the deployed build. This doc formalizes
the pattern: spec-driven + UX-driven addenda get captured in
`docs/design/` so future implementations can either re-incorporate
the addendum into the main spec or consciously roll it back.

## Future spec integration (optional)

If the user wants this to be official Phase 1 scope:

1. Add §11.14 task to spec: "Pause modal: ESC during gameplay opens
   a centered modal with Resume / Settings / Exit; Exit requires
   confirmation; progress is not saved in Phase 1."
2. Add §11 task to plan: "Task 16: Pause modal"
3. Add E2E test in `tests/e2e/playthrough.spec.ts` covering ESC
   open/close + Resume + Exit confirm

Until then, this file is the single source of truth for the
pause modal behavior.