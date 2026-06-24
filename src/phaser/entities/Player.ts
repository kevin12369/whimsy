import { PLAYER_SPEED } from '../../config/constants';

export interface Keys { up: boolean; down: boolean; left: boolean; right: boolean; }
export interface Vec2 { x: number; y: number; }

// Player bbox half-extent (player is 12x12 -> half = 6).
export const PLAYER_HALF = 6;
export const DASH_DISTANCE = 48; // 3 tiles
export const DASH_COOLDOWN_MS = 1600;

let dashCooldownTimer = 0;
let dashActive = false;

export function isDashReady(): boolean {
  return dashCooldownTimer <= 0;
}

export function getDashCooldown(): number {
  return dashCooldownTimer;
}

export function triggerDash(): void {
  if (dashCooldownTimer > 0) return;
  dashActive = true;
  dashCooldownTimer = DASH_COOLDOWN_MS;
}

/** Same as triggerDash but with a custom cooldown (for companion passives) */
export function triggerDashWithCooldown(cooldownMs: number): void {
  if (dashCooldownTimer > 0) return;
  dashActive = true;
  dashCooldownTimer = cooldownMs;
}

export function isDashing(): boolean {
  return dashActive;
}

export function updateDashCooldown(dtMs: number): void {
  if (dashCooldownTimer > 0) {
    dashCooldownTimer -= dtMs;
    if (dashCooldownTimer < 0) dashCooldownTimer = 0;
  }
  // Dash lasts for exactly one movement tick
  if (dashActive) {
    dashActive = false;
  }
}

export function computeMove(pos: Vec2, keys: Keys, dt: number, speed = PLAYER_SPEED): Vec2 {
  let dx = 0, dy = 0;
  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;
  const len = Math.hypot(dx, dy);
  if (len > 0) { dx /= len; dy /= len; }
  let moveSpeed = speed;
  if (dashActive) {
    // Cover DASH_DISTANCE in one frame regardless of dt
    moveSpeed = DASH_DISTANCE / Math.max(dt, 0.001);
  }
  return { x: pos.x + dx * moveSpeed * dt, y: pos.y + dy * moveSpeed * dt };
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
