import { describe, it, expect } from 'vitest';
import { computeMove, canMoveTo } from '../../src/phaser/entities/Player';

describe('computeMove', () => {
  it('moves right when D pressed', () => {
    const next = computeMove({ x: 10, y: 10 }, { up: false, down: false, left: false, right: true }, 1, 180);
    expect(next.x).toBeGreaterThan(10);
    expect(next.y).toBe(10);
  });

  it('diagonal normalized (no faster than cardinal)', () => {
    const card = computeMove({ x: 0, y: 0 }, { up: true, down: false, left: false, right: true }, 1, 180);
    const diag = Math.hypot(card.x, card.y);
    expect(diag).toBeCloseTo(180, 5);
  });
});

describe('canMoveTo', () => {
  const tilemap = [0, 0, 1, 0, 0];
  it('returns true for floor', () => {
    expect(canMoveTo(1, 0, 5, 1, tilemap)).toBe(true);
  });
  it('returns false for wall', () => {
    expect(canMoveTo(2, 0, 5, 1, tilemap)).toBe(false);
  });
  it('returns false for out-of-bounds', () => {
    expect(canMoveTo(-1, 0, 5, 1, tilemap)).toBe(false);
  });
});
