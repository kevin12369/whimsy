import { describe, it, expect } from 'vitest';
import { fuseItems } from '../../src/core/fusionTable';

describe('fuseItems', () => {
  it('hand-authored fusion: brine comet + vine whip -> Brine Lash', () => {
    const r = fuseItems('brine comet', 'vine whip');
    expect(r?.name).toBe('Brine Lash');
    expect(r?.fusedFrom.type).toBe('item+item');
  });

  it('returns null for unknown pair', () => {
    expect(fuseItems('a', 'b')).toBeNull();
  });
});