// 50-prompt validity benchmark for Concept Designer.
// Tests: designConcepts() succeeds for >= 70% of diverse prompts.

import { designConcepts } from '../packages/agents/src/concept-designer.ts';

const PROMPTS = [
  'A 2D space platformer where I play a comet avoiding asteroids',
  'A retro 8-bit platformer with neon colors',
  'A spooky Halloween platformer in a graveyard',
  'A cheerful platformer with candy and rainbows',
  'A cyberpunk platformer with robots',
  'A medieval platformer with knights and dragons',
  'An underwater platformer with fish and coral',
  'A desert platformer with cacti and snakes',
  'A jungle platformer with vines and monkeys',
  'A forest platformer with trees and mushrooms',
  'A lava-themed platformer with fire',
  'A ice-themed platformer with snow',
  'A cloud-themed platformer floating in the sky',
  'A factory platformer with gears and machinery',
  'A space station platformer with zero gravity',
  'A laboratory platformer with test tubes',
  'A racing platformer where you dodge traffic',
  'A stealth platformer where you avoid guards',
  'A horror platformer with jump scares',
  'A fantasy platformer with magic spells',
  'A western platformer with cowboys',
  'A pirate platformer on a ship',
  'A ninja platformer with shurikens',
  'A samurai platformer with katanas',
  'A superhero platformer',
  'A prehistoric platformer with dinosaurs',
  'A alien invasion platformer',
  'A post-apocalyptic platformer',
  'A steampunk platformer with airships',
  'A pixel art platformer with retro graphics',
  'A minimalist platformer with simple shapes',
  'A colorful platformer with bright pastels',
  'A dark platformer with deep shadows',
  'A vibrant platformer with neon lights',
  'A peaceful platformer in a garden',
  'A chaotic platformer in a storm',
  'A mysterious platformer in fog',
  'A bright platformer under sunshine',
  'A platformer with bouncy platforms',
  'A platformer with moving platforms',
  'A platformer with disappearing platforms',
  'A platformer with many enemies',
  'A platformer with no enemies (peaceful)',
  'A platformer focused on collecting stars',
  'A platformer focused on speedrunning',
  'A platformer with a final boss',
  'A platformer with multiple levels',
  'A platformer with checkpoints',
  'A platformer with power-ups',
  'A simple platformer for beginners',
];

let success = 0;
const failed = [];
const t0 = Date.now();

for (let i = 0; i < PROMPTS.length; i++) {
  const prompt = PROMPTS[i];
  try {
    process.stdout.write(`[${i + 1}/${PROMPTS.length}] ${prompt.slice(0, 50).padEnd(50)} `);
    const specs = await designConcepts(prompt);
    if (specs.length === 3) {
      success++;
      console.log('OK');
    } else {
      failed.push({ prompt, error: 'wrong count: ' + specs.length });
      console.log('FAIL (wrong count)');
    }
  } catch (e) {
    failed.push({ prompt, error: e.message });
    console.log('FAIL (' + e.message.slice(0, 60) + ')');
  }
}

const elapsed = (Date.now() - t0) / 1000;
const rate = success / PROMPTS.length;
const avgTime = elapsed / PROMPTS.length;

console.log(`\n[benchmark] Results:`);
console.log(`  success: ${success}/${PROMPTS.length} (${(rate * 100).toFixed(1)}%)`);
console.log(`  total time: ${elapsed.toFixed(1)}s`);
console.log(`  avg per prompt: ${avgTime.toFixed(1)}s`);

console.log(`\n[benchmark] Target: >= 70% success rate`);
if (rate >= 0.7) {
  console.log(`[benchmark] PASS`);
  process.exit(0);
} else {
  console.log(`[benchmark] FAIL — below threshold`);
  console.log(`\n[benchmark] Failed prompts (first 5):`);
  for (const f of failed.slice(0, 5)) {
    console.log(`  - ${f.prompt.slice(0, 50)}: ${f.error.slice(0, 80)}`);
  }
  process.exit(1);
}
