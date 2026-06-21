import { describe, it, expect } from 'vitest';
import { buildFallbackDeck } from '../../src/procgen/deckFallback';

describe('buildFallbackDeck', () => {
  it('builds a complete deck for any of 16 themes', () => {
    for (let i = 0; i < 16; i++) {
      const d = buildFallbackDeck(i);
      expect(d.themeCard.type).toBe('theme');
      expect(d.physicsCards).toHaveLength(8);
      expect(d.itemCards.length).toBeGreaterThanOrEqual(20);
      expect(d.itemCards.length).toBeLessThanOrEqual(30);
      expect(d.npcCards).toHaveLength(3);
      expect(d.hiddenCards.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('5 biomes cycled produce 5 distinct themeCards by name; deck index varies the rest', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 15; i++) seen.add(buildFallbackDeck(i).themeCard.name);
    expect(seen.size).toBe(5);
  });
});
