import { chat } from '../packages/lib/src/llm.ts';
import { SPEC_FEW_SHOT_EXAMPLES } from '../packages/agents/src/spec-templates.ts';

const PROMPT = `You are a game designer. Generate exactly 3 distinct game design candidates as a JSON array. Each must satisfy the GameSpec schema strictly.

Allowed level concepts: 'flat' | 'stairs' | 'gap' | 'boss'
- flat: single platform, easy
- stairs: ascending platforms, medium
- gap: 2 platforms with gap, requires jump timing
- boss: 1 large enemy, hardest

Allowed mechanics ranges:
- gravity: 400-1500
- jumpVelocity: 300-700
- moveSpeed: 120-360
- enemySpeed: 40-250

Rules:
- 3 candidates must differ in concept OR mechanics
- palette colors must be visually distinct across candidates
- enemyCount: 0-6, starCount: 0-5
- art.style: 'geometric' | 'pixel' | 'rounded'

Output ONLY a JSON array, no prose, no markdown fences.

Few-shot examples:
${SPEC_FEW_SHOT_EXAMPLES.map((e, i) => `\nExample ${i + 1}:\n${JSON.stringify(e, null, 2)}`).join('\n')}

Now design 3 candidates for: "A 2D space platformer where I play a comet avoiding asteroids"`;

const raw = await chat({ model: 'deepseek-coder:6.7b', system: '', user: PROMPT, temperature: 0.8, maxTokens: 2500 });
console.log('=== RAW (first 1000 chars) ===');
console.log(raw.slice(0, 1000));
console.log('=== LENGTH:', raw.length);
