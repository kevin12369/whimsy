// Demo: spec → v3 buildHtml() integration
// Generates a playable HTML file from a spec, then writes to bench/demo-output.html
// Open it in any browser to play.

import { designConcepts } from '../packages/agents/src/concept-designer.ts';
import { compileSpec } from '../packages/runtime/src/compiler.ts';
import { clampConfig, sideScrollerComet } from '../packages/templates/src/index.ts';
import { writeFileSync } from 'fs';

const PROMPT = process.argv[2] || 'A 2D space platformer where I play a comet avoiding asteroids';
const OUTPUT = 'bench/demo-output.html';

console.log(`[demo] prompt: ${PROMPT}`);

const t0 = Date.now();
const specs = await designConcepts(PROMPT);
console.log(`[demo] ${specs.length} candidates in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// Pick the first candidate for demo
const spec = specs[0];
console.log(`[demo] selected: ${spec.meta.name} (${spec.level.concept})`);

const { config, levelData } = compileSpec(spec);
console.log(`[demo] compiled:`, levelData.platforms.length, 'platforms,', levelData.enemies.length, 'enemies');

// Bridge to v3 buildHtml:
// v3 buildHtml takes (theme, cfg). We map spec to theme + cfg.
// Theme is what v3 uses for colors; spec.art.palette provides them.
// cfg is what v3 reads; we set playerSpeed, jumpVelocity, gravity, enemyCount, enemySpeed.
const theme = {
  primary: spec.art.palette.primary,
  secondary: spec.art.palette.secondary,
  enemyColor: spec.art.palette.enemy,
  playerLabel: spec.meta.name,
  enemyLabel: 'asteroid',
  flavorText: spec.meta.flavor,
};

const v3Config = clampConfig({
  ...config,
  type: 'sideScroller',
  primary: spec.art.palette.primary,
  enemyColor: spec.art.palette.enemy,
  playerSpeed: spec.mechanics.moveSpeed,
  jumpVelocity: spec.mechanics.jumpVelocity,
  gravity: spec.mechanics.gravity,
  enemyCount: spec.level.enemyCount,
  enemySpeed: spec.mechanics.enemySpeed,
});

console.log(`[demo] v3 config:`, v3Config);

const html = sideScrollerComet.render(theme, v3Config);
writeFileSync(OUTPUT, html);
console.log(`[demo] wrote ${OUTPUT} (${html.length} bytes)`);
console.log(`[demo] open in browser: file://d:/Coder/ATNL/projects/whimsy/${OUTPUT}`);
