import { designConcepts } from '../packages/agents/src/concept-designer.ts';
const t0 = Date.now();
const specs = await designConcepts('A 2D space platformer where I play a comet avoiding asteroids');
const t1 = Date.now();
console.log(`elapsed: ${((t1 - t0) / 1000).toFixed(1)}s`);
console.log(`candidates: ${specs.length}`);
for (const s of specs) {
  console.log(`  - ${s.meta.name} (${s.level.concept}, ${s.level.enemyCount} enemies, ${s.level.starCount} stars)`);
  console.log(`    palette: primary=${s.art.palette.primary} enemy=${s.art.palette.enemy}`);
}
