import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../src/registry';

const defaultTheme = {
  primary: '#3aa6ff',
  secondary: '#ffffff',
  playerLabel: 'player',
  enemyLabel: 'enemy',
  flavorText: '',
};

function simpleHash(s: string): string {
  // 32-bit djb2-like hash for test uniqueness.
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

describe('template diversity', () => {
  it('15 templates render() output is byte-level independent (no spread clones)', () => {
    const hashes = TEMPLATES.map((t) => simpleHash(t.render(defaultTheme)));
    const unique = new Set(hashes);
    expect(unique.size).toBe(TEMPLATES.length);
  });

  it('every genre has 5 independent mechanisms', () => {
    for (const genre of ['platformer', 'shooter', 'puzzle'] as const) {
      const inGenre = TEMPLATES.filter((t) => t.genre === genre);
      const hashes = inGenre.map((t) => simpleHash(t.render(defaultTheme)));
      const unique = new Set(hashes);
      expect(unique.size).toBe(inGenre.length);
    }
  });

  it('every template has a non-empty flavorText for grid display', () => {
    for (const t of TEMPLATES) {
      expect(t.defaultTheme.flavorText.length).toBeGreaterThan(10);
    }
  });
});