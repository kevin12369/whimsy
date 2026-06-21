import { PLAYER_SPEED } from '../../config/constants';

export interface Keys { up: boolean; down: boolean; left: boolean; right: boolean; }
export interface Vec2 { x: number; y: number; }

// Player bbox half-extent (player is 12x12 -> half = 6).
export const PLAYER_HALF = 6;

export function computeMove(pos: Vec2, keys: Keys, dt: number, speed = PLAYER_SPEED): Vec2 {
  let dx = 0, dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  const len = Math.hypot(dx, dy);
  if (len > 0) { dx /= len; dy /= len; }
  return { x: pos.x + dx * speed * dt, y: pos.y + dy * speed * dt };
}

// True if any corner of the player bbox (centered on x,y with half-extent)
// lies in a wall or out of bounds.
export function canMoveTo(centerX: number, centerY: number, w: number, h: number, tilemap: number[]): boolean {
  const left = centerX - PLAYER_HALF;
  const right = centerX + PLAYER_HALF;
  const top = centerY - PLAYER_HALF;
  const bottom = centerY + PLAYER_HALF;
  // Tile each bbox edge by floor(), which keeps the bbox on its current
  // tile until the edge actually crosses into the next pixel column/row.
  const txL = Math.floor(left / 16);
  const txR = Math.floor(right / 16);
  const tyT = Math.floor(top / 16);
  const tyB = Math.floor(bottom / 16);
  for (let ty = tyT; ty <= tyB; ty++) {
    for (let tx = txL; tx <= txR; tx++) {
      if (tx < 0 || ty < 0 || tx >= w || ty >= h) return false;
      const t = tilemap[ty * w + tx];
      if (t === undefined) return false;
      if (t === 1) return false; // wall
    }
  }
  return true;
}