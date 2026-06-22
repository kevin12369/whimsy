import { describe, it, expect } from 'vitest';
import { fuseItems } from '../../src/core/fusionTable';
import { composeCards } from '../../src/core/cardComposition';

describe('fusion paths', () => {
  it('item+item returns hand-authored FusedItem when recipe exists', () => {
    const r = fuseItems('brine comet', 'vine whip');
    expect(r?.name).toBe('Brine Lash');
    expect(r?.fusedFrom.type).toBe('item+item');
  });

  it('item+item returns null when recipe does not exist', () => {
    expect(fuseItems('marrow bead', 'amber bead')).toBeNull();
  });

  it('composeCards handles non-item pair (item+physics) deterministically', () => {
    const a = { id: 'p1', type: 'physics' as const, name: 'Moon Bounce',
                physicsPayload: { gravity: 200, restitution: 0.95, friction: 0.1, note: 'low gravity' },
                generatedBy: 'fallback' as const, generatedAt: 0 };
    const b = { id: 'i1', type: 'item' as const, name: 'Brine Comet',
                itemPayload: { spriteKey: 'whip_blue', behavior: 'splashes', stackable: false },
                generatedBy: 'fallback' as const, generatedAt: 0 };
    const r = composeCards(a, b);
    expect(r.fusedFrom.type).toBe('card+card');
    expect(r.name).toBe('Moon Bounce Brine Comet');
  });
});
