// WFC-like tile sampler (left-to-right, top-to-bottom). Pure function. Deterministic per seed.
// NOTE: This is a simplified scanline sampler inspired by WFC adjacency rules, not a full
// constraint-propagation WFC. Output shape follows plan: flat Tile[] of length w*h.
// TODO(Task 6+): consider { width, height, tiles } shape when wiring into renderer.
export type Tile = 0|1|2|3|4; // floor, wall, water, decoration-grass, decoration-flower

export interface WFCOptions {
  seed: number;
  weights: Record<Tile, number>;
  adjacency?: Partial<Record<Tile, Tile[]>>;
}

const DEFAULT_ADJ: Record<Tile, Tile[]> = {
  0: [0, 1, 2, 3, 4],
  1: [0, 1, 3],
  2: [0, 2, 4],
  3: [0, 1, 3],
  4: [0, 2, 4],
};

function rng(seed: number) {
  let s = seed | 0;
  return () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 0xffffffff); };
}

export function runWFC(w: number, h: number, opts: WFCOptions): Tile[] {
  const adj: Record<Tile, Tile[]> = { ...DEFAULT_ADJ, ...(opts.adjacency ?? {}) };
  const r = rng(opts.seed);
  const out: Tile[] = new Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const candidates: Tile[] = [0,1,2,3,4];
      const up: Tile | null = y > 0 ? out[(y-1)*w + x]! : null;
      const left: Tile | null = x > 0 ? out[y*w + (x-1)]! : null;
      const allowed = candidates.filter(t => {
        // noUncheckedIndexedAccess: adj[Tile] returns Tile[] | undefined.
        // If a tile has no adjacency entry configured, treat as fully allowed.
        if (up !== null) {
          const a = adj[up];
          if (a && !a.includes(t)) return false;
        }
        if (left !== null) {
          const a = adj[left];
          if (a && !a.includes(t)) return false;
        }
        return true;
      });
      const pool: Tile[] = allowed.length ? allowed : [0];
      const total: number = pool.reduce<number>((s, t) => s + (opts.weights[t] ?? 1), 0);
      let pick = r() * total;
      let chosen: Tile = 0;
      for (const t of pool) {
        pick -= (opts.weights[t] ?? 1);
        if (pick <= 0) { chosen = t; break; }
      }
      out[y*w + x] = chosen;
    }
  }
  return out;
}
