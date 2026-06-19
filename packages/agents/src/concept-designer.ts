import { chat } from '@whimsy/lib';
import { gameSpecSchema, type GameSpec } from '@whimsy/runtime';
import { z } from 'zod';
import { SPEC_FEW_SHOT_EXAMPLES } from './spec-templates';

const SYSTEM_PROMPT = `You are a game designer. Generate exactly 3 distinct game design candidates as a JSON array. Each must satisfy the GameSpec schema strictly.

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

Output ONLY a JSON array, no prose, no markdown fences.`;

const MAX_ATTEMPTS = 3;

export async function designConcepts(userPrompt: string): Promise<GameSpec[]> {
  let lastError: string | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const systemMessage = lastError
      ? `${SYSTEM_PROMPT}\n\nPrevious attempt failed: ${lastError}\nFix and try again.`
      : SYSTEM_PROMPT;

    const userMessage = `Few-shot examples (study the schema and variation patterns):\n${SPEC_FEW_SHOT_EXAMPLES.map((e, i) => `\nExample ${i + 1}:\n${JSON.stringify(e, null, 2)}`).join('\n')}\n\nNow design 3 candidates for: "${userPrompt}"`;

    const raw = await chat({
      model: 'deepseek-coder:6.7b',
      system: systemMessage,
      user: userMessage,
      temperature: 0.8,
      maxTokens: 2500,
    });

    // Strip markdown fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();

    try {
      const parsed = JSON.parse(cleaned);
      const validated = z.array(gameSpecSchema).parse(parsed);
      return validated;
    } catch (e) {
      lastError = (e as Error).message;
    }
  }
  throw new Error(`Failed to design concepts after ${MAX_ATTEMPTS} attempts`);
}
