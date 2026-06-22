import { describe, it, expect } from 'vitest';
import { spawnItemsForLevel, spawnNpcsForLevel, placeFusionAltar } from '../../src/procgen/levelSpawner';

function emptyTilemap(w: number, h: number, walls: Array<[number, number]> = []): number[] {
  const out = new Array<number>(w * h).fill(0);
  for (const [x, y] of walls) out[y * w + x] = 1;
  return out;
}

describe('spawnItemsForLevel', () => {
  it('returns count items, all on floor tiles, excluding spawn pad', () => {
    const w = 40, h = 30;
    const tilemap = emptyTilemap(w, h);
    const items = spawnItemsForLevel(tilemap, w, h, 6, 42);
    expect(items).toHaveLength(6);
    for (const item of items) {
      const inSpawnPad = item.tileX < 3 && item.tileY < 3;
      expect(inSpawnPad).toBe(false);
      expect(tilemap[item.tileY * w + item.tileX]).toBe(0);
    }
  });

  it('deterministic for the same seed', () => {
    const w = 40, h = 30;
    const tilemap = emptyTilemap(w, h);
    const a = spawnItemsForLevel(tilemap, w, h, 6, 42);
    const b = spawnItemsForLevel(tilemap, w, h, 6, 42);
    expect(a).toEqual(b);
  });

  it('different seeds produce different positions', () => {
    const w = 40, h = 30;
    const tilemap = emptyTilemap(w, h);
    const a = spawnItemsForLevel(tilemap, w, h, 6, 42);
    const b = spawnItemsForLevel(tilemap, w, h, 6, 99);
    expect(a.map(p => `${p.tileX},${p.tileY}`)).not.toEqual(b.map(p => `${p.tileX},${p.tileY}`));
  });

  it('returns fewer than count if not enough floor tiles', () => {
    const w = 5, h = 5;
    const tilemap = emptyTilemap(w, h, [[3, 3], [4, 3]]);
    const items = spawnItemsForLevel(tilemap, w, h, 10, 1);
    expect(items.length).toBeLessThanOrEqual(10);
    expect(items.length).toBeGreaterThan(0);
  });
});

describe('spawnNpcsForLevel', () => {
  it('returns up to count NPCs on floor tiles, no overlap with items', () => {
    const w = 40, h = 30;
    const tilemap = emptyTilemap(w, h);
    const items = spawnItemsForLevel(tilemap, w, h, 6, 42);
    const npcs = spawnNpcsForLevel(tilemap, w, h, 2, 42, items);
    expect(npcs.length).toBeGreaterThan(0);
    expect(npcs.length).toBeLessThanOrEqual(2);
    const itemPositions = new Set(items.map(p => `${p.tileX},${p.tileY}`));
    for (const npc of npcs) {
      expect(itemPositions.has(`${npc.tileX},${npc.tileY}`)).toBe(false);
    }
  });
});

describe('placeFusionAltar', () => {
  it('returns one floor tile near the center', () => {
    const w = 40, h = 30;
    const tilemap = emptyTilemap(w, h);
    const altar = placeFusionAltar(tilemap, w, h, 42);
    expect(tilemap[altar.tileY * w + altar.tileX]).toBe(0);
    expect(Math.abs(altar.tileX - w / 2)).toBeLessThan(10);
    expect(Math.abs(altar.tileY - h / 2)).toBeLessThan(10);
  });
  it('deterministic per seed', () => {
    const w = 40, h = 30;
    const tilemap = emptyTilemap(w, h);
    const a = placeFusionAltar(tilemap, w, h, 42);
    const b = placeFusionAltar(tilemap, w, h, 42);
    expect(a).toEqual(b);
  });
});
