import { designConcepts } from '../packages/agents/src/concept-designer.ts';
try {
  const specs = await designConcepts('platformer');
  console.log('OK', specs.length);
  for (const s of specs) console.log(' -', s.meta.name);
} catch (e) {
  console.error('FAIL:', e.message);
}
