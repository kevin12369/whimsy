# Whimsy Shuffle Phase 1 — Prep Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to execute §3 dispatch plan. Sections §1 (repo reset) and §2 (plan fixes) are prerequisite commits that must land before §3 begins.
>
> **Language:** English. Internal prep document, not user-facing.

**Goal:** Prepare the repository for Phase 1 implementation of Whimsy Shuffle: clear v3 archive, fix plan review findings, dispatch 16-task subagent workflow.

**Source specs:**
- Game spec: `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md` (English)
- Game spec: `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.zh-CN.md` (Chinese)
- Phase 1 plan: `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` (16 tasks, this doc fixes it)

**Tech Stack:** Git + bash for §1, plan edits for §2, subagent-driven-development for §3.

---

## 1. Repository Reset

**Objective:** Remove v3 Whimsy AI Studio archive (`apps/`, `packages/`, samples, scripts, Linear screenshot) so `projects/whimsy/` becomes a clean Vite root for Phase 1.

**Scope:**

| Delete | Reason | Size |
|---|---|---|
| `apps/web/` | Next.js v3 web app, 0 lines reused | ~80MB source + 3GB .next build |
| `apps/desktop/` | Tauri + React v3 desktop app, 0 lines reused | ~50MB + Tauri build artifacts |
| `apps/worker/` | Empty directory, placeholder | <1KB |
| `packages/` (8 dirs) | v3 monorepo packages (agents/lib/llm/prompt/retry/runtime/sandbox/templates) | 1.2MB |
| `samples/space-mario.html` | v3 Phaser demo, replaced by new Phase 1 game | ~10KB |
| `scripts/seed.mjs` | v3 seed script, no use in Phase 1 | <1KB |
| `whimsy-desktop-linear.png` | v3 Linear design screenshot | 32KB |

**Preserve:**

| Path | Reason |
|---|---|
| `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design*.md` | Whimsy Shuffle spec (game design) |
| `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` | Phase 1 plan (will be edited in §2) |
| `docs/superpowers/specs/2026-06-21-whimsy-shuffle-phase1-prep-design.md` | This doc |
| `docs/archive/2026-06-20-whimsy-shuffle-state.md` | Clean-slate archive note from v3 pivot |
| `docs/retros/2026-06-19-mvp-launch.md` | v3 retro, useful historical context |
| `README.md`, `README.zh-CN.md`, `CONTRIBUTING.md` | Project docs (will edit README to remove apps/ refs) |
| `.gitignore`, `.editorconfig`, `.nvmrc` | Repo config |
| `tsconfig.base.json` | Will be re-used as base for Phase 1 tsconfig |
| `.git/`, `.github/` | Git history and CI |
| `pnpm-workspace.yaml` | Can stay; no `apps/*` to match (harmless) |

**Steps:**

```bash
cd d:/Coder/ATNL/projects/whimsy

# 1. Tag v3 final state for outside-the-repo backup reference
git tag v3-archive-final 4c381f4

# 2. Delete v3 body
rm -rf apps/ packages/ samples/ scripts/ whimsy-desktop-linear.png

# 3. Update .gitignore — strip apps/web/ node_modules + .next entries,
#    add Phase 1 typical Vite + Phaser entries
# 4. Edit README.md — remove "apps/ project structure" section, replace
#    with Phase 1 Vite single-app layout per spec §9
# 5. Delete v3 GitHub Actions workflows that reference apps/web or apps/desktop
#    (if any in .github/workflows/)

# 6. Verify
git status
# Expected: only .gitignore + README.md + .github/workflows/* modified
```

**Commit:**

```bash
git add .gitignore README.md apps packages samples scripts whimsy-desktop-linear.png .github
git commit -m "chore(reset): remove v3 Whimsy AI Studio archive for Phase 1 clean slate"
```

**Expected results:**
- Workspace disk: 3.5GB → ~50KB
- `git log` still has all v3 history (commit `82cc7dd` and earlier), but checkout at HEAD will not have `apps/`, `packages/`, etc.
- `git checkout 82cc7dd -- apps/web` still works to recover v3 if needed

---

## 2. Plan Fixes (9 items, 1 commit)

**Objective:** Apply 9 review findings to `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` in a single commit.

| # | Severity | Location | Current | Fix |
|---|---|---|---|---|
| F2 | HIGH | Task 9 Step 3, `src/phaser/scenes/GameScene.ts` snippet | `this.scene.restart()` (memory leak: re-creates WFC array, tilemap rectangles, event listeners) | `this.scene.start('GameScene', { levelIndex: this.session.currentLevelIndex })` + add `init(data)` method receiving `{levelIndex?: number}` and re-bootstrapping if `data.levelIndex` provided |
| F3 | HIGH | Task 15 Step 1, `tests/core/assets.test.ts` | regex `^[a-f0-9]{64}$` rejects `sha256: 'PENDING'` (literal) | regex `PENDING\|^[a-f0-9]{64}$` |
| F4 | HIGH | Task 6 Step 1, `src/procgen/itemTable.ts` | 8 `ITEM_TEMPLATES` entries; comment says "30" | Add 22 more entries using 8 `DEFAULT_SPRITE_KEYS` pool, mix `stackable: true/false`, varied `behavior` strings |
| F5 | HIGH | Task 11 Step 2, `src/core/fusionTable.ts` | 4 entries in `TABLE`; comment says "16" | Add 12 more hand-authored item+item fusions, both inputs and outputs from `pickItemsForDeck` and `DEFAULT_SPRITE_KEYS` |
| F8 | MEDIUM | Task 6 Step 3, `tests/procgen/deckFallback.test.ts` | comment "16 themes produce 16 distinct" misleading; assertion `seen.size === 5` is correct | Rewrite test comment to: "5 biomes cycled 3x; 15 visually distinct themes (palette + name + quirk); assertion checks `>= 5`" |
| F9 | MEDIUM | Task 9 Step 3, `src/phaser/scenes/GameScene.ts` snippet | `private player?: Phaser.GameObjects.Rectangle` (definite assignment false positive) | `private player!: Phaser.GameObjects.Rectangle` (definite assignment operator; `add.rectangle` always returns Rectangle) |
| F10 | MEDIUM | Task 10 Step 4, `src/phaser/scenes/HandScene.ts` snippet | `this.registry.get('deck')` returns `any` | `this.registry.get<Deck>('deck')` with `import type { Deck }` |
| F11 | MEDIUM | Task 15 Step 3, `scripts/download-assets.mjs` | Uses `createWriteStream` but does not import it | Add `import { createWriteStream } from 'node:fs';` |
| F12 | LOW | Task 6 Step 3, test | `buildThemeCard` test indirectly tested via `buildFallbackDeck`; minor | No code change; clarify comment |

**Not fixed (intentionally):**
- F1 (5 biomes vs 16 themes): spec §11.1.4 was updated to "5 in Phase 1, 16 in Phase 3" in the spec review commit. Plan correctly implements 5. **Already aligned.**
- F6 (apps/web apps/desktop conflict): resolved by §1 deletion. **No plan change needed.**
- F7 (no issue identified): **No plan change needed.**

**Commit:**

```bash
git add docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
git commit -m "docs(plan): apply 9 review findings to Whimsy Shuffle Phase 1 plan"
```

**Expected diff:** +99 / -28 lines (estimated).

---

## 3. Implementation Dispatch (per-task subagent + 2-round review)

**Objective:** Execute the 16-task Phase 1 plan using `superpowers:subagent-driven-development`. Each task gets a fresh subagent with two-stage review.

**Prerequisites (must land before §3 begins):**
- §1 commit applied; `apps/`, `packages/`, `samples/`, `scripts/`, `whimsy-desktop-linear.png` are gone
- §2 commit applied; plan has 9 fixes in place
- Working tree clean; HEAD is at the §1+§2 commit

**Workflow:**

For each task `N` in `0..15`:

1. **Dispatch implementer subagent** with full task text + path context (`projects/whimsy/`) + spec reference (§X.Y in `docs/superpowers/specs/2026-06-20-whimsy-shuffle-design.md`).
   - Subagent uses `superpowers:test-driven-development` for each step.
   - Subagent commits with the task's commit message at the end.

2. **Round 1 review: spec compliance** (different subagent).
   - Verifies every step in the plan was completed.
   - Verifies no scope creep (no extra files, no extra deps).
   - If issues → implementer fixes → re-review.

3. **Round 2 review: code quality** (different subagent).
   - Naming, types, test coverage, file size sanity, no dead code, no debug prints.
   - If issues → implementer fixes → re-review.

4. **Mark task complete** in `TodoWrite`.

5. Move to next task.

After all 16 tasks:

6. **Final review** (one more subagent) — full-file audit, integration test run, build verification.
7. **Hand off** to user with summary of 16 commits + final verification checklist from plan §Final Verification.

**Subagent starting point:** Task 0 (Vite + Phaser scaffold).

**Token budget estimate:**
- 16 implementer subagents
- 32 reviewer subagents (16 spec + 16 quality)
- 1 final review subagent
- Total: 49 subagent invocations
- Per-subagent context: 20-50KB; main loop context stays light (coordinator only)
- Aggregate: ~1-2.5M tokens for the full Phase 1

**Pause conditions:**
- BLOCKED: stop, ask user
- Plan ambiguity: stop, ask user
- All tasks complete: stop, present summary

**Out of scope for this prep doc:**
- Phase 2 (WebLLM enhancement) — separate spec/plan cycle
- Phase 3 (16 themes, content release) — separate spec/plan cycle

---

## Self-Review (post-write)

1. **Placeholder scan:** No "TBD" / "TODO". The 9 fixes have explicit current/fix values. ✓
2. **Internal consistency:** §1 deletion list matches §1 commit. §2 fix list matches §2 commit. §3 references §1+§2 as prerequisites. ✓
3. **Scope check:** This doc is a 3-step prep plan, not a feature spec. Each section is independently verifiable. ✓
4. **Ambiguity check:**
   - §1 says "delete apps/" — unambiguous, lists 3 sub-dirs
   - §2 says "9 fixes, 1 commit" — explicitly enumerated
   - §3 says "16 tasks" — matches plan

---

## Verification Checklist (for user to mark after §1-§3 complete)

- [ ] `git log --oneline | head -3` shows: §2 commit on top, §1 commit below
- [ ] `ls apps/ packages/ samples/ scripts/ 2>/dev/null` — none exist
- [ ] `git status` clean at HEAD of `feat/ai-studio-mvp`
- [ ] `grep -c "scene.restart" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` — 0
- [ ] `grep -c "ITEM_TEMPLATES" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` — 2 (declaration + use)
- [ ] 16 commits in subagent history, each prefixed with `feat(phase1-task-XX):` or similar

---

## Open Questions (none for this prep)

All decisions resolved. No follow-up questions.
