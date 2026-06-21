export const NPC_TALK_RADIUS_TILES = 2;

export function isInTalkRange(dx: number, dy: number, tileSize: number): boolean {
  return Math.hypot(dx, dy) <= NPC_TALK_RADIUS_TILES * tileSize;
}