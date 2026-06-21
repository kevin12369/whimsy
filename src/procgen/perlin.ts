// Classic 2D Perlin noise. Pure function. Deterministic per seed.
const PERMUTATION = new Uint8Array(512);
function seedPerm(seed: number) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates with seeded RNG
  let s = seed | 0;
  const rng = () => { s = (s * 1664525 + 1013904223) | 0; return ((s >>> 0) / 0xffffffff); };
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const pi = p[i]!;
    const pj = p[j]!;
    p[i] = pj;
    p[j] = pi;
  }
  for (let i = 0; i < 512; i++) PERMUTATION[i] = p[i & 255]!;
}

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
}

export function perlin2(x: number, y: number, seed: number = 0): number {
  seedPerm(seed);
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const pa = PERMUTATION[X]!;
  const pb = PERMUTATION[X + 1]!;
  const pa1 = PERMUTATION[pa + Y]!;
  const pb1 = PERMUTATION[pb + Y]!;
  const pa2 = PERMUTATION[pa + Y + 1]!;
  const pb2 = PERMUTATION[pb + Y + 1]!;
  return lerp(
    lerp(grad(pa1, x, y), grad(pb1, x - 1, y), u),
    lerp(grad(pa2, x, y - 1), grad(pb2, x - 1, y - 1), u),
    v
  ) * 0.5;
}

export function generateHeightmap(w: number, h: number, seed: number, scale = 0.08, octaves = 4): number[] {
  const out = new Array<number>(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let amp = 1, freq = scale, sum = 0, norm = 0;
      for (let o = 0; o < octaves; o++) {
        sum += perlin2(x * freq, y * freq, seed + o) * amp;
        norm += amp;
        amp *= 0.5;
        freq *= 2;
      }
      out[y * w + x] = (sum / norm + 1) / 2; // normalize to [0,1]
    }
  }
  return out;
}

export function heightmapToTilemap(hm: number[], w: number, h: number, waterLevel = 0.35, wallLevel = 0.7): number[] {
  // 0 = floor, 1 = wall, 2 = water
  const out = new Array<number>(w * h);
  for (let i = 0; i < hm.length; i++) {
    const v = hm[i]!;
    out[i] = v < waterLevel ? 2 : v > wallLevel ? 1 : 0;
  }
  return out;
}