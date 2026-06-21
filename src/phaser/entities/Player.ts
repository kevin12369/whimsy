import { PLAYER_SPEED } from '../../config/constants';

export interface Keys { up: boolean; down: boolean; left: boolean; right: boolean; }
export interface Vec2 { x: number; y: number; }

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

export function canMoveTo(x: number, y: number, w: number, h: number, tilemap: number[]): boolean {
  if (x < 0 || y < 0 || x >= w || y >= h) return false;
  const t = tilemap[y * w + x];
  if (t === undefined) return false;
  return t !== 1; // 1 = wall
}
