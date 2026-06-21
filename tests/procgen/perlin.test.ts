import { describe, it, expect } from 'vitest';
import { perlin2, generateHeightmap } from '../../src/procgen/perlin';

describe('perlin2', () => {
  it('returns values in [-1, 1]', () => {
    for (let i = 0; i < 100; i++) {
      const v = perlin2(Math.random() * 100, Math.random() * 100, 42);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('is deterministic given the same seed', () => {
    const a = perlin2(0.5, 0.5, 7);
    const b = perlin2(0.5, 0.5, 7);
    expect(a).toBe(b);
  });

  it('differs with different seed', () => {
    const a = perlin2(0.5, 0.5, 1);
    const b = perlin2(0.5, 0.5, 2);
    expect(a).not.toBe(b);
  });
});

describe('generateHeightmap', () => {
  it('produces w*h grid of values in [0, 1]', () => {
    const hm = generateHeightmap(64, 48, 42);
    expect(hm).toHaveLength(64 * 48);
    for (const v of hm) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});