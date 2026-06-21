import { describe, it, expect } from 'vitest';
import { composeCards } from '../../src/core/cardComposition';

describe('composeCards', () => {
  it('composes two cards into a FusedItem', () => {
    const r = composeCards(
      { id: '1', type: 'physics', name: 'Moon Bounce', physicsPayload: { gravity: 200, restitution: 0.95, friction: 0.1, note: 'n' }, generatedBy: 'fallback', generatedAt: 0 },
      { id: '2', type: 'item',    name: 'Box',         itemPayload: { spriteKey: 'orb_green', behavior: 'b', stackable: false }, generatedBy: 'fallback', generatedAt: 0 },
    );
    expect(r.fusedFrom.type).toBe('card+card');
    expect(r.name).toBe('Moon Bounce Box');
  });
});