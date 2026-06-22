import { describe, it, expect } from 'vitest';
import { itemInPickupRange, altarInOpenRange, npcInTalkRange } from '../../src/core/proximity';

const TILE = 16;

describe('itemInPickupRange', () => {
  it('true when player and item are within 1 tile', () => {
    expect(itemInPickupRange(24, 24, 32, 32, TILE)).toBe(true);
  });
  it('false when 2 tiles apart', () => {
    expect(itemInPickupRange(24, 24, 56, 56, TILE)).toBe(false);
  });
  it('true at exactly 1 tile distance', () => {
    expect(itemInPickupRange(24, 24, 24 + TILE, 24, TILE)).toBe(true);
  });
});

describe('altarInOpenRange', () => {
  it('true within 1.5 tiles', () => {
    expect(altarInOpenRange(100, 100, 100 + 24, 100, TILE)).toBe(true);
  });
  it('false at 2 tiles', () => {
    expect(altarInOpenRange(100, 100, 100 + 32, 100, TILE)).toBe(false);
  });
});

describe('npcInTalkRange', () => {
  it('true within 2 tiles', () => {
    expect(npcInTalkRange(100, 100, 100 + 32, 100, TILE)).toBe(true);
  });
  it('false at 3 tiles', () => {
    expect(npcInTalkRange(100, 100, 100 + 48, 100, TILE)).toBe(false);
  });
});
