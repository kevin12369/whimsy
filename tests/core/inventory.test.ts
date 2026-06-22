import { describe, it, expect } from 'vitest';
import { addToInventory, removeFromInventory, hasItemByName, INVENTORY_MAX } from '../../src/core/inventory';

describe('addToInventory', () => {
  it('inventory holds up to INVENTORY_MAX items', () => {
    let inv: string[] = [];
    for (let i = 0; i < INVENTORY_MAX + 2; i++) inv = addToInventory(inv, `id-${i}`).inv;
    expect(inv).toHaveLength(INVENTORY_MAX);
  });

  it('rejects beyond cap with explicit false return', () => {
    const inv = ['a','b','c','d','e','f'];
    const result = addToInventory(inv, 'g');
    expect(result.added).toBe(false);
    expect(result.inv).toBe(inv);
  });
});

describe('removeFromInventory', () => {
  it('removes a card by id, returns new array', () => {
    expect(removeFromInventory(['a','b','c'], 'b')).toEqual(['a','c']);
  });
  it('returns the same array if id not found', () => {
    expect(removeFromInventory(['a','b'], 'c')).toEqual(['a','b']);
  });
});

describe('hasItemByName', () => {
  it('returns true when inventory contains a card with the given name', () => {
    const inv = ['item-1', 'item-2'];
    const cards = [
      { id: 'item-1', type: 'item' as const, name: 'brine comet', generatedBy: 'fallback' as const, generatedAt: 0 },
      { id: 'item-2', type: 'item' as const, name: 'vine whip', generatedBy: 'fallback' as const, generatedAt: 0 },
    ];
    expect(hasItemByName(inv, cards, 'vine whip')).toBe(true);
  });
  it('returns false when no card matches', () => {
    const inv = ['item-1'];
    const cards = [
      { id: 'item-1', type: 'item' as const, name: 'brine comet', generatedBy: 'fallback' as const, generatedAt: 0 },
    ];
    expect(hasItemByName(inv, cards, 'vine whip')).toBe(false);
  });
});
