// Smaller 10-prompt validity benchmark — ~2 minutes.
// Use this for fast validation. Full 50-prompt version in validity-benchmark.mjs.

import { designConcepts } from '../packages/agents/src/concept-designer.ts';

const PROMPTS = [
  'A 2D space platformer where I play a comet avoiding asteroids',
  'A retro 8-bit platformer with neon colors',
  'A spooky Halloween platformer in a graveyard',
  'A cyberpunk platformer with robots',
  'A medieval platformer with knights and dragons',
  'A pixel art platformer with retro graphics',
  'A minimalist platformer with simple shapes',
  'A dark platformer with deep shadows',
  'A platformer with moving platforms',
  'A platformer with a final boss',
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

console.log(`\n[benchmark-10] Results:`);
console.log(`  success: ${success}/${PROMPTS.length} (${(rate * 100).toFixed(1)}%)`);
console.log(`  total time: ${elapsed.toFixed(1)}s`);
console.log(`  avg per prompt: ${avgTime.toFixed(1)}s`);

console.log(`\n[benchmark-10] Target: >= 70% success rate`);
if (rate >= 0.7) {
  console.log(`[benchmark-10] PASS`);
  process.exit(0);
} else {
  console.log(`[benchmark-10] FAIL`);
  process.exit(1);
}
