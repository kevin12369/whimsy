import { describe, it, expect } from 'vitest';
import { runWFC } from '../../src/procgen/wfc';

describe('WFC', () => {
  it('produces w*h tilemap using the configured alphabet', () => {
    const out = runWFC(16, 12, { seed: 1, weights: { 0:5, 1:2, 2:1, 3:1, 4:1 } });
    expect(out).toHaveLength(16 * 12);
    for (const t of out) expect([0,1,2,3,4]).toContain(t);
  });

  it('is deterministic per seed', () => {
    const a = runWFC(16, 12, { seed: 42, weights: { 0:5, 1:2, 2:1, 3:1, 4:1 } });
    const b = runWFC(16, 12, { seed: 42, weights: { 0:5, 1:2, 2:1, 3:1, 4:1 } });
    expect(a).toEqual(b);
  });

  it('places at least one floor (connectivity invariant)', () => {
    const out = runWFC(16, 12, { seed: 7, weights: { 0:10, 1:1, 2:1, 3:1, 4:1 } });
    expect(out.includes(0)).toBe(true);
  });
});
