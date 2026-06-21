# Whimsy Shuffle Phase 1 Prep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the repository for Phase 1 implementation of Whimsy Shuffle — clear v3 archive, fix 9 plan review findings — so that the 16-task Phase 1 plan can be dispatched cleanly afterward.

**Architecture:** Two tasks. Task 1 deletes the v3 Whimsy AI Studio archive (apps, packages, samples, scripts, screenshot), updates .gitignore + README, and removes v3 GitHub Actions workflows. Task 2 applies 9 fixes (F2, F3, F4, F5, F8, F9, F10, F11, F12) to the existing Phase 1 plan file. Both tasks produce a single commit each; total 2 commits before Phase 1 dispatch begins.

**Tech Stack:** Git, bash (Windows Git Bash), Markdown editing.

**Source spec:** `docs/superpowers/specs/2026-06-21-whimsy-shuffle-phase1-prep-design.md`

**Target Phase 1 plan:** `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md`

---

## Task 1: Repository Reset

**Files:**
- Delete: `apps/` (subtree, 3.5GB)
- Delete: `packages/` (subtree, 1.2MB)
- Delete: `samples/space-mario.html`
- Delete: `scripts/seed.mjs`
- Delete: `whimsy-desktop-linear.png`
- Delete: `.github/workflows/` (any v3 deploy workflows that reference `apps/web` or `apps/desktop`)
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Verify current state**

Run from `d:/Coder/ATNL/projects/whimsy`:

```bash
git status --short
git log --oneline -3
```

Expected:
- Working tree shows `apps/`, `bench/`, `docs/archive/`, `packages/`, `samples/`, `scripts/`, `whimsy-desktop-linear.png` as untracked (or as commits — check both)
- Recent commits include `1219740 docs(spec): Whimsy Shuffle Phase 1 prep plan` on top

If working tree state does not match, **stop and report** to user — the prep doc commit may not have landed.

- [ ] **Step 2: Inspect v3 GitHub Actions workflows**

```bash
ls .github/workflows/
for f in .github/workflows/*.yml; do
  echo "=== $f ==="
  grep -lE 'apps/web|apps/desktop' "$f" 2>/dev/null && echo "MATCH: $f" || true
done
```

Expected output: list of v3 workflow files that mention `apps/web` or `apps/desktop`. Note the filenames. If none, skip the workflow-deletion step (Step 6).

- [ ] **Step 3: Read current .gitignore**

```bash
cat .gitignore
```

Expected: existing entries likely include `node_modules/`, `.next/`, `dist/`, Tauri-related entries, etc. Identify which entries are v3-specific (reference `apps/web/dist`, `apps/desktop/src-tauri/target`, etc.).

- [ ] **Step 4: Read README.md to find apps/ section**

```bash
grep -nE 'apps/|apps\\\\|whimsy-' README.md
```

Expected: line numbers showing where the README mentions v3 structure. Read those lines.

- [ ] **Step 5: Delete v3 archive**

```bash
cd d:/Coder/ATNL/projects/whimsy
rm -rf apps/ packages/ samples/ scripts/ whimsy-desktop-linear.png
ls apps packages samples scripts 2>&1
```

Expected: `No such file or directory` for each.

- [ ] **Step 6: Delete v3 GitHub Actions workflows**

For each v3 workflow filename found in Step 2:

```bash
rm "d:/Coder/ATNL/projects/whimsy/.github/workflows/<v3-workflow-name>.yml"
```

Then verify:

```bash
ls .github/workflows/
```

If folder is empty, also remove it:

```bash
rmdir .github/workflows 2>/dev/null || true
```

- [ ] **Step 7: Update .gitignore**

Write the new `.gitignore` (full replacement):

```gitignore
# Node / package managers
node_modules/
.pnpm-store/

# Build output
dist/
build/
*.tsbuildinfo

# Editor / OS
.vscode/
.idea/
.DS_Store
Thumbs.db

# Vite
.vite/

# Phaser
public/sprites/raw/
public/sprites/atlas/

# Local env
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Test artifacts
coverage/
playwright-report/
test-results/

# Temporary
tmp/
*.tmp
```

- [ ] **Step 8: Update README.md**

Read full current `README.md`. Replace the section that says "## Project structure" (and the `apps/` tree shown there) with a Phase 1 Vite single-app layout per Whimsy Shuffle spec §9:

```markdown
## Project structure

```
whimsy/
  index.html                                <- Vite entry
  package.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts
  playwright.config.ts
  public/
    sprites/                                <- (Task 15) placeholder PNGs
    atlas/                                  <- (Task 15) sprite atlases
    sfx/                                    <- (Task 15) SFX placeholders
    bgm/                                    <- (Task 15) BGM placeholders
  src/
    main.ts                                 <- Phaser game config
    config/                                 <- constants, assets, themes
    core/                                   <- eventBus, cardSystem, worldState
    procgen/                                <- perlin, wfc, biomes, itemTable, deckFallback
    phaser/
      scenes/                               <- Boot, Menu, Game, HUD, Hand
      entities/                             <- Player, NPC, Item, Card, FusionAltar
    llm/                                    <- WebLLM worker (Phase 2)
    ui/                                     <- HUD, settings, card hand, fusion altar
    utils/                                  <- uuid, color, assetLoader
  tests/                                    <- unit + e2e
  scripts/                                  <- build-atlas, download-assets
  .github/
    workflows/
      deploy.yml                            <- GitHub Pages deploy
  docs/
    superpowers/
      specs/                                <- design specs
      plans/                                <- implementation plans
  README.md
```

```

Also remove any mentions of `apps/`, `pnpm-workspace.yaml`, and v3 tech stack references in the "Tech stack" table.

- [ ] **Step 9: Verify all deletions and edits**

```bash
cd d:/Coder/ATNL/projects/whimsy
ls -la
git status --short
du -sh . 2>/dev/null
```

Expected:
- No `apps/`, `packages/`, `samples/`, `scripts/`, `whimsy-desktop-linear.png`
- `git status` shows: `.gitignore` modified, `README.md` modified, plus all deleted paths as `D` lines
- Working dir size around 50KB-5MB (was 3.5GB)

- [ ] **Step 10: Commit reset**

```bash
cd d:/Coder/ATNL/projects/whimsy
git add -A
git status --short
```

Verify: only `.gitignore`, `README.md`, and deletions of `apps/`, `packages/`, `samples/`, `scripts/`, `whimsy-desktop-linear.png`, plus any deleted `.github/workflows/*.yml`. **No untracked files from elsewhere.**

```bash
git commit -m "chore(reset): remove v3 Whimsy AI Studio archive for Phase 1 clean slate"
git log --oneline -3
```

Expected new commit on top of `1219740`:
```
<sha> chore(reset): remove v3 Whimsy AI Studio archive for Phase 1 clean slate
1219740 docs(spec): Whimsy Shuffle Phase 1 prep plan — repo reset + 9 plan fixes + subagent dispatch
4c381f4 docs(spec): apply expert review — 24 fixes to Chinese Whimsy Shuffle design
```

---

## Task 2: Apply 9 Plan Fixes

**Files:**
- Modify: `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md`

Reference: `docs/superpowers/specs/2026-06-21-whimsy-shuffle-phase1-prep-design.md` §2.

- [ ] **Step 1: Locate fix sites in plan**

For each fix F2, F3, F4, F5, F8, F9, F10, F11, F12, find the line in the plan file:

```bash
cd d:/Coder/ATNL/projects/whimsy
grep -n "scene.restart" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "PENDING\|\\[a-f0-9\\]{64}" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "ITEM_TEMPLATES" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "fusionTable\|TABLE: Record" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "16 themes" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "private player" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "registry.get" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
grep -n "createWriteStream" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
```

Note the line numbers for each match.

- [ ] **Step 2: Apply F2 (scene.restart memory leak)**

In Task 9 Step 3, the snippet has:

```ts
if (reachedExit({ x: tx, y: ty }, this.exitPos)) {
  this.session = advanceLevel(this.session);
  gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
  this.scene.restart();
}
```

Replace with:

```ts
if (reachedExit({ x: tx, y: ty }, this.exitPos)) {
  this.session = advanceLevel(this.session);
  gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
  this.scene.start('GameScene', { levelIndex: this.session.currentLevelIndex });
}
```

Also add an `init(data: { levelIndex?: number })` method to `GameScene` class, right after the `create()` method (or above it):

```ts
init(data: { levelIndex?: number }) {
  // Override default level index from data if provided (used on level transitions).
  if (typeof data?.levelIndex === 'number') {
    this.session = { ...this.session, currentLevelIndex: data.levelIndex };
  }
}
```

- [ ] **Step 3: Apply F3 (sha256 PENDING regex)**

In Task 15 Step 1, the test snippet has:

```ts
expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);
```

Replace with:

```ts
expect(a.sha256 === 'PENDING' || a.sha256).toMatch(/^[a-f0-9]{64}$/);
```

Wait — that is invalid syntax. The correct fix:

```ts
expect(['PENDING', /^[a-f0-9]{64}$/].some(p => typeof p === 'string' ? a.sha256 === p : p.test(a.sha256))).toBe(true);
```

Or simpler — use a regex that matches both:

```ts
expect(a.sha256).toMatch(/^(PENDING|[a-f0-9]{64})$/);
```

Use the second form. Replace the line accordingly.

- [ ] **Step 4: Apply F4 (30 ITEM_TEMPLATES)**

In Task 6 Step 1, the `ITEM_TEMPLATES` array currently has 8 entries. Add 22 more entries to bring the total to 30. The full 30-entry array (replace the entire array declaration):

```ts
export const ITEM_TEMPLATES: ReadonlyArray<Omit<Card, 'id' | 'generatedAt' | 'generatedBy'>> = [
  { type:'item', name:'brine comet',     itemPayload:{ spriteKey:'whip_blue',   behavior:'splashes on impact',     stackable:false } },
  { type:'item', name:'vine whip',       itemPayload:{ spriteKey:'whip_red',    behavior:'extends 3 tiles',        stackable:false } },
  { type:'item', name:'pickled star',    itemPayload:{ spriteKey:'orb_yellow',  behavior:'glows when held',       stackable:false } },
  { type:'item', name:'ferment orb',     itemPayload:{ spriteKey:'orb_green',   behavior:'slows nearby liquids',  stackable:false } },
  { type:'item', name:'cyan blade',      itemPayload:{ spriteKey:'sword_cyan',  behavior:'cuts through water',    stackable:false } },
  { type:'item', name:'violet blade',    itemPayload:{ spriteKey:'sword_violet',behavior:'hums near walls',       stackable:false } },
  { type:'item', name:'dill drone',      itemPayload:{ spriteKey:'shield_gold', behavior:'follows player for 5s', stackable:false } },
  { type:'item', name:'rose potion',     itemPayload:{ spriteKey:'potion_pink', behavior:'heals on contact',      stackable:true  } },
  { type:'item', name:'ember shard',     itemPayload:{ spriteKey:'whip_red',    behavior:'leaves a brief trail',  stackable:true  } },
  { type:'item', name:'tide coin',       itemPayload:{ spriteKey:'orb_yellow',  behavior:'rings when dropped',    stackable:true  } },
  { type:'item', name:'moss pebble',     itemPayload:{ spriteKey:'orb_green',   behavior:'grows near walls',       stackable:true  } },
  { type:'item', name:'glass fang',      itemPayload:{ spriteKey:'sword_cyan',  behavior:'shatters on impact',    stackable:false } },
  { type:'item', name:'rune fragment',   itemPayload:{ spriteKey:'sword_violet',behavior:'pulses in time with steps', stackable:false } },
  { type:'item', name:'lantern wisp',    itemPayload:{ spriteKey:'shield_gold', behavior:'casts a 2-tile glow',    stackable:false } },
  { type:'item', name:'brine pearl',     itemPayload:{ spriteKey:'potion_pink', behavior:'distorts gravity in radius', stackable:false } },
  { type:'item', name:'saltspun coin',   itemPayload:{ spriteKey:'whip_blue',   behavior:'skips across water',    stackable:true  } },
  { type:'item', name:'charcoal twig',   itemPayload:{ spriteKey:'whip_red',    behavior:'leaves a black mark',    stackable:true  } },
  { type:'item', name:'amber bead',      itemPayload:{ spriteKey:'orb_yellow',  behavior:'holds last sound briefly', stackable:true  } },
  { type:'item', name:'fern chip',       itemPayload:{ spriteKey:'orb_green',   behavior:'snaps back to player',  stackable:true  } },
  { type:'item', name:'prism chip',      itemPayload:{ spriteKey:'sword_cyan',  behavior:'splits light to 4 tiles', stackable:false } },
  { type:'item', name:'echo shard',      itemPayload:{ spriteKey:'sword_violet',behavior:'repeats last step',     stackable:false } },
  { type:'item', name:'wax bell',        itemPayload:{ spriteKey:'shield_gold', behavior:'rings once per room',    stackable:false } },
  { type:'item', name:'sour drop',       itemPayload:{ spriteKey:'potion_pink', behavior:'reverses direction for 1s', stackable:true  } },
  { type:'item', name:'glass mote',      itemPayload:{ spriteKey:'whip_blue',   behavior:'drifts on collision',    stackable:true  } },
  { type:'item', name:'ash flake',       itemPayload:{ spriteKey:'whip_red',    behavior:'dims light radius',      stackable:true  } },
  { type:'item', name:'sun coin',        itemPayload:{ spriteKey:'orb_yellow',  behavior:'casts warm light for 5s', stackable:false } },
  { type:'item', name:'spore sac',       itemPayload:{ spriteKey:'orb_green',   behavior:'releases spores on break', stackable:false } },
  { type:'item', name:'frost splinter',  itemPayload:{ spriteKey:'sword_cyan',  behavior:'freezes 1 tile of water', stackable:false } },
  { type:'item', name:'gloam thread',    itemPayload:{ spriteKey:'sword_violet',behavior:'darkens 1 tile radius',  stackable:false } },
  { type:'item', name:'marrow bead',     itemPayload:{ spriteKey:'shield_gold', behavior:'absorbs one hit',        stackable:false } },
];
```

Also update the comment above the array from "30 hardcoded item templates" to "30 hardcoded item templates" (already correct, no change). Update the trailing comment "(Task 6 Step 1) ... use the 8 DEFAULT_SPRITE_KEYS pool, mix of stackable" to "30 entries, 8 DEFAULT_SPRITE_KEYS pool, ~half stackable, varied behaviors".

- [ ] **Step 5: Apply F5 (16 fusion entries)**

In Task 11 Step 2, the `TABLE` currently has 4 entries. Add 12 more to reach 16. The full 16-entry `TABLE` (replace the entire `TABLE` declaration):

```ts
const TABLE: Record<string, Omit<FusedItem, 'id' | 'fusedFrom'>> = {
  'brine comet|vine whip':     { name:'Brine Lash',      spriteKey:'whip_blue',   behavior:'extends and splashes on impact', stackable:false },
  'cyan blade|violet blade':   { name:'Prism Sword',     spriteKey:'sword_cyan',  behavior:'hums and refracts',              stackable:false },
  'pickled star|ferment orb':  { name:'Glow Pickle',     spriteKey:'orb_yellow',  behavior:'glows brighter when stored',     stackable:false },
  'dill drone|rose potion':    { name:'Dill Bloom',      spriteKey:'potion_pink', behavior:'follows player and heals',       stackable:false },
  'ember shard|tide coin':     { name:'Sunset Tally',    spriteKey:'whip_red',    behavior:'leaves a glowing trail',         stackable:false },
  'moss pebble|glass fang':    { name:'Green Splinter',  spriteKey:'orb_green',   behavior:'grows a thorn on impact',        stackable:false },
  'rune fragment|lantern wisp':{ name:'Pulse Lantern',   spriteKey:'shield_gold', behavior:'pulses with player heartbeat',   stackable:false },
  'brine pearl|saltspun coin': { name:'Brine Cache',     spriteKey:'potion_pink', behavior:'gravity flips in radius',        stackable:false },
  'charcoal twig|amber bead':  { name:'Ash Memory',      spriteKey:'whip_red',    behavior:'leaves a slowly-fading line',    stackable:false },
  'fern chip|prism chip':      { name:'Prism Fern',      spriteKey:'sword_cyan',  behavior:'splits light into 4 directions', stackable:false },
  'echo shard|wax bell':       { name:'Bell Echo',       spriteKey:'sword_violet',behavior:'repeats the last step tone',     stackable:false },
  'sour drop|glass mote':      { name:'Sour Drift',      spriteKey:'potion_pink', behavior:'reverses on collision',          stackable:false },
  'ash flake|sun coin':        { name:'Ember Coin',      spriteKey:'orb_yellow',  behavior:'dims then brightens a tile',     stackable:false },
  'spore sac|frost splinter':  { name:'Frost Spore',     spriteKey:'sword_cyan',  behavior:'freezes nearby water tiles',    stackable:false },
  'gloam thread|marrow bead':  { name:'Gloam Marrow',    spriteKey:'shield_gold', behavior:'darkens and absorbs one hit',   stackable:false },
  'vine whip|rose potion':     { name:'Vine Bloom',      spriteKey:'potion_pink', behavior:'grows and heals over time',      stackable:false },
};
```

Also update the trailing comment: "8 hand-authored item+item fusions" → "16 hand-authored item+item fusions".

- [ ] **Step 6: Apply F8 (16 themes test comment)**

In Task 6 Step 3, the test snippet:

```ts
it('16 themes produce 16 distinct themeCards (palette or name)', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 16; i++) seen.add(buildFallbackDeck(i).themeCard.name);
  expect(seen.size).toBe(5); // 5 biomes cycled
});
```

Replace with:

```ts
it('5 biomes cycled produce 5 distinct themeCards by name; deck index varies the rest', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 15; i++) seen.add(buildFallbackDeck(i).themeCard.name);
  expect(seen.size).toBe(5); // 5 biomes cycled (forest, ocean, dungeon, scifi, desert)
});
```

- [ ] **Step 7: Apply F9 (player type)**

In Task 9 Step 3, the `GameScene` class declares:

```ts
private player?: Phaser.GameObjects.Rectangle;
private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
```

Replace `private player?: Phaser.GameObjects.Rectangle;` with:

```ts
private player!: Phaser.GameObjects.Rectangle;
```

(Definite assignment `!` because `create()` always sets it before `update()` runs.)

- [ ] **Step 8: Apply F10 (registry type)**

In Task 10 Step 4, the `HandScene` snippet has:

```ts
gameBus.on('card:played-physics', ({ cardId }) => {
  const card = this.registry.get('deck')?.physicsCards.find((c: any) => c.id === cardId);
  ...
});
```

Replace with:

```ts
import type { Deck } from '../../core/cardSystem';

gameBus.on('card:played-physics', ({ cardId }) => {
  const card = this.registry.get<Deck>('deck')?.physicsCards.find((c) => c.id === cardId);
  ...
});
```

(Add `import type { Deck } from '../../core/cardSystem';` at the top of the snippet block.)

- [ ] **Step 9: Apply F11 (createWriteStream import)**

In Task 15 Step 3, the `scripts/download-assets.mjs` snippet has:

```js
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
```

Add `createWriteStream` to that import:

```js
import { writeFileSync, mkdirSync, existsSync, statSync, createWriteStream } from 'node:fs';
```

- [ ] **Step 10: Apply F12 (buildThemeCard test — no change)**

F12 is a clarification, not a code change. **No edit needed.** The existing test in Step 6 (renamed by F8) already covers `buildThemeCard` indirectly via `buildFallbackDeck(i)`.

- [ ] **Step 11: Verify all 9 fixes applied**

```bash
cd d:/Coder/ATNL/projects/whimsy
grep -c "scene.restart" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 0 (was 1+ before F2)

grep -c "ITEM_TEMPLATES" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 2+ (declaration + comment + references)

grep -c "Brine Lash\|Prism Sword\|Glow Pickle\|Dill Bloom\|Sunset Tally\|Green Splinter\|Pulse Lantern\|Brine Cache\|Ash Memory\|Prism Fern\|Bell Echo\|Sour Drift\|Ember Coin\|Frost Spore\|Gloam Marrow\|Vine Bloom" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 16 (one per fusion entry)

grep -n "PENDING\|\\[a-f0-9\\]\\{64\\}" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 1 match with both PENDING and the regex pattern in same line

grep -n "registry.get<Deck>" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 1 (F10)

grep -n "createWriteStream" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 2 (import + use)

grep -n "private player!" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 1 (F9)
```

- [ ] **Step 12: Commit plan fixes**

```bash
cd d:/Coder/ATNL/projects/whimsy
git status --short
```

Expected: only `docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` modified.

```bash
git add docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
git commit -m "docs(plan): apply 9 review findings to Whimsy Shuffle Phase 1 plan"
git log --oneline -4
```

Expected new commit on top of Task 1's commit:
```
<sha> docs(plan): apply 9 review findings to Whimsy Shuffle Phase 1 plan
<sha> chore(reset): remove v3 Whimsy AI Studio archive for Phase 1 clean slate
1219740 docs(spec): Whimsy Shuffle Phase 1 prep plan — repo reset + 9 plan fixes + subagent dispatch
4c381f4 docs(spec): apply expert review — 24 fixes to Chinese Whimsy Shuffle design
```

---

## Final Verification

```bash
cd d:/Coder/ATNL/projects/whimsy
git log --oneline -4
# Expected: 2 new commits on top of 1219740

git status
# Expected: clean working tree

ls apps packages samples scripts 2>&1
# Expected: No such file or directory

du -sh .
# Expected: < 10MB (was 3.5GB)

grep -c "scene.restart" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md
# Expected: 0
```

All 4 conditions met → prep plan complete. Phase 1 dispatch (per spec §3) may begin.

---

## Self-Review

- **Spec coverage:** Spec §1 (repo reset) → Task 1, all 10 steps. Spec §2 (9 plan fixes) → Task 2, 12 steps (F2-F12 each as a step). Spec §3 (dispatch workflow) is a subagent workflow description, not a code task — no plan step needed; subagent-driven-development skill is invoked at execution time.
- **Placeholder scan:** No "TBD" / "TODO" / "implement later". Every code block in fixes F2, F3, F4, F5, F8, F9, F10, F11 is complete and copy-pasteable.
- **Type consistency:** `private player!: Rectangle` matches the F9 fix. `registry.get<Deck>` matches the F10 fix. `createWriteStream` import matches the F11 fix. No contradictions across fixes.
- **Commit isolation:** Task 1 = 1 commit, Task 2 = 1 commit. Total 2 commits, matching spec's "9 fixes, 1 commit" + spec's repo reset.
- **Verification:** Final Verification section has 4 grep/ls checks that map to the spec's verification checklist.

---

## Success Criteria

- [ ] `git log --oneline | head -4` shows: 2 new commits (reset + plan fixes) on top of `1219740`
- [ ] `ls apps/ packages/ samples/ scripts/ 2>/dev/null` returns nothing
- [ ] `git status` clean at HEAD of `feat/ai-studio-mvp`
- [ ] `grep -c "scene.restart" docs/superpowers/plans/2026-06-20-whimsy-shuffle-phase1-plan.md` returns 0
- [ ] Workspace size < 10MB (was 3.5GB)

All green → prep complete; Phase 1 dispatch (per spec §3) is unblocked.
