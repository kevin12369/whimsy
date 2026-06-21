import { describe, it, expect } from 'vitest';
import { addToInventory, INVENTORY_MAX } from '../../src/core/inventory';

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
