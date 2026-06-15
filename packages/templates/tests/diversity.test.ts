import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../src/registry';

const defaultTheme = {
  primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'player', enemyLabel: 'enemy', flavorText: '',
};

function simpleHash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

describe('template diversity', () => {
  it('5 templates render() output is byte-level independent', () => {
    const hashes = TEMPLATES.map((t) => simpleHash(t.render(defaultTheme)));
    expect(new Set(hashes).size).toBe(TEMPLATES.length);
  });

  it('every template has unique mechanism (mechanism tag in output)', () => {
    const mechanisms = TEMPLATES.map((t) => {
      const html = t.render(defaultTheme);
      // Pull a unique mechanism marker from each template
      if (html.includes("addKey('W')")) return 'twin-stick';
      if (html.includes('enemyFireRateMs') && html.includes('keydown-SPACE')) return 'shmup';
      if (html.includes('Math.abs(selected.x-x)+Math.abs(selected.y-y)')) return 'tile-match';
      if (html.includes('movingTarget')) return 'sokoban';
      if (html.includes('stars.add')) return 'platformer-physics';
      return 'unknown';
    });
    expect(new Set(mechanisms).size).toBe(TEMPLATES.length);
  });
});
