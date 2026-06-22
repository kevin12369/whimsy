export interface Placement {
  cardId: string;
  tileX: number;
  tileY: number;
}

export interface FloorTilePlacement {
  tileX: number;
  tileY: number;
}

function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) / 0xffffffff);
  };
}

function shuffleInPlace<T>(arr: T[], r: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

function floorTiles(
  tilemap: number[], w: number, h: number,
  excludePad: boolean,
  excludePositions: ReadonlyArray<{ tileX: number; tileY: number }>,
): FloorTilePlacement[] {
  const result: FloorTilePlacement[] = [];
  const taken = new Set(excludePositions.map(p => `${p.tileX},${p.tileY}`));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (excludePad && x < 3 && y < 3) continue;
      if (taken.has(`${x},${y}`)) continue;
      if (tilemap[y * w + x] !== 0) continue;
      result.push({ tileX: x, tileY: y });
    }
  }
  return result;
}

export function spawnItemsForLevel(
  tilemap: number[], w: number, h: number,
  cardIds: string[],
  seed: number,
): Placement[] {
  const tiles = floorTiles(tilemap, w, h, true, []);
  shuffleInPlace(tiles, rng(seed));
  return tiles.slice(0, Math.min(cardIds.length, tiles.length)).map((t, i) => ({
    cardId: cardIds[i]!,
    tileX: t.tileX,
    tileY: t.tileY,
  }));
}

export function spawnNpcsForLevel(
  tilemap: number[], w: number, h: number,
  cardIds: string[],
  seed: number,
  excludeFrom: ReadonlyArray<FloorTilePlacement> = [],
): Placement[] {
  const tiles = floorTiles(tilemap, w, h, true, excludeFrom);
  shuffleInPlace(tiles, rng(seed ^ 0x9e3779b9));
  return tiles.slice(0, Math.min(cardIds.length, tiles.length)).map((t, i) => ({
    cardId: cardIds[i]!,
    tileX: t.tileX,
    tileY: t.tileY,
  }));
}

export function placeFusionAltar(
  tilemap: number[], w: number, h: number,
  seed: number,
): FloorTilePlacement {
  const tiles = floorTiles(tilemap, w, h, true, []);
  if (tiles.length === 0) return { tileX: 0, tileY: 0 };
  const r = rng(seed ^ 0x517cc1b7);
  const cx = w / 2;
  const cy = h / 2;
  const scored = tiles.map(t => {
    const jitter = r() * 2;
    return { t, score: Math.hypot(t.tileX - cx, t.tileY - cy) + jitter };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]!.t;
}
