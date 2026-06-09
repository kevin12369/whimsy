import { describe, it, expect } from 'vitest';
import { GENRE_SYSTEM_PROMPTS, getGenreSystemPrompt } from '../src/genres';

describe('genre registry', () => {
  it('defines prompts for all MVP genres', () => {
    expect(Object.keys(GENRE_SYSTEM_PROMPTS).sort()).toEqual(
      ['platformer', 'puzzle', 'shooter'].sort()
    );
  });

  it('returns a non-empty prompt for each genre', () => {
    for (const g of ['platformer', 'shooter', 'puzzle'] as const) {
      const p = getGenreSystemPrompt(g);
      expect(p.length).toBeGreaterThan(100);
    }
  });

  it('platformer prompt mentions gravity and jump', () => {
    const p = getGenreSystemPrompt('platformer').toLowerCase();
    expect(p).toContain('gravity');
    expect(p).toContain('jump');
  });

  it('shooter prompt mentions projectiles and enemies', () => {
    const p = getGenreSystemPrompt('shooter').toLowerCase();
    expect(p).toContain('projectile');
    expect(p).toContain('enem');
  });

  it('puzzle prompt forbids physics', () => {
    const p = getGenreSystemPrompt('puzzle').toLowerCase();
    expect(p).toContain('no physics');
  });
});
