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

// canMoveTo now takes PIXEL center coordinates (matching the player sprite
// position). Internally it expands to the 12x12 player bbox and rejects
// movement if any corner of the bbox lands in a wall or out of bounds.
//
// Tile size is 16. Player bbox is 12x12 centered on (x,y). So player at
// tile (2,2) center is at pixel (32, 32), with bbox spanning [26..37] x [26..37].
describe('canMoveTo (pixel-center bbox collision)', () => {
  const tilemap = [0, 0, 1, 0, 0]; // 1x5 row, wall at tile index 2
  it('returns true when bbox fits inside a floor tile', () => {
    // center at (24, 8) -> bbox [18..29] x [2..13], round -> tile 1
    expect(canMoveTo(24, 8, 5, 1, tilemap)).toBe(true);
  });
  it('returns false when bbox overlaps a wall tile', () => {
    // center at (40, 8) -> bbox [34..45], round -> tiles 2 and 3 (wall at 2)
    expect(canMoveTo(40, 8, 5, 1, tilemap)).toBe(false);
  });
  it('returns false for out-of-bounds (bbox crosses negative)', () => {
    // center at (0, 8) -> bbox [-6..5], round -> tiles -1 and 0
    expect(canMoveTo(0, 8, 5, 1, tilemap)).toBe(false);
  });
  it('returns true when bbox straddles two floor tiles', () => {
    // center at (32, 8) -> bbox [26..37], tiles 2 (wall!) and 3 — wall wins
    // better: a wall-free tilemap here
    const clear = [0, 0, 0, 0, 0];
    expect(canMoveTo(32, 8, 5, 1, clear)).toBe(true);
  });
});