import { describe, it, expect } from 'vitest';
import { buildFallbackDeck } from '../../src/procgen/deckFallback';
import { runWFC } from '../../src/procgen/wfc';
import { biomeWeightsFor } from '../../src/procgen/themeWorlds';
import { spawnItemsForLevel } from '../../src/procgen/levelSpawner';

describe('deck + spawn integration', () => {
  it('items from deck land on floor tiles of the WFC output', () => {
    const w = 40, h = 30;
    const deck = buildFallbackDeck(0);
    const tilemap = runWFC(w, h, { seed: 7, weights: biomeWeightsFor('forest') });
    const placements = spawnItemsForLevel(tilemap, w, h, Math.min(6, deck.itemCards.length), 7);
    expect(placements.length).toBeGreaterThan(0);
    for (const p of placements) {
      expect(tilemap[p.tileY * w + p.tileX]).toBe(0);
    }
  });

  it('all 11 themeIndex values produce a spawnable 5-level session', () => {
    const w = 40, h = 30;
    for (let i = 0; i < 11; i++) {
      const deck = buildFallbackDeck(i);
      const worldId = deck.themeCard.name.toLowerCase() as never;
      const tilemap = runWFC(w, h, { seed: i + 1, weights: biomeWeightsFor(worldId) });
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) tilemap[y * w + x] = 0;
      }
      const items = spawnItemsForLevel(tilemap, w, h, 6, i + 1);
      expect(items.length).toBeGreaterThan(0);
    }
  });
});
