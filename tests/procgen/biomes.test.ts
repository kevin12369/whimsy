import { describe, it, expect } from 'vitest';
import { BIOMES, biomeWeights } from '../../src/procgen/biomes';

describe('biomes', () => {
  it('defines exactly 5 biomes', () => {
    expect(BIOMES).toHaveLength(5);
  });

  it('each biome has 5 hex colors', () => {
    for (const b of BIOMES) expect(b.palette).toHaveLength(5);
  });

  it('biomeWeights gives a valid weights record for any biome id', () => {
    for (const b of BIOMES) {
      const w = biomeWeights(b.id);
      expect(w[0]).toBeGreaterThan(0);
    }
  });
});
