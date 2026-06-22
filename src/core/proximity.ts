const PLAYER_HALF = 6;

function inRange(
  playerX: number, playerY: number,
  entityX: number, entityY: number,
  radiusPx: number,
): boolean {
  // Account for the player bbox half-extent so a player standing
  // right next to an entity (bboxes touching) counts as in range.
  const effectiveRadius = radiusPx + PLAYER_HALF;
  return Math.hypot(playerX - entityX, playerY - entityY) <= effectiveRadius;
}

export function itemInPickupRange(
  playerX: number, playerY: number,
  itemX: number, itemY: number,
  tileSize: number = 16,
  radiusTiles: number = 1,
): boolean {
  return inRange(playerX, playerY, itemX, itemY, radiusTiles * tileSize);
}

export function altarInOpenRange(
  playerX: number, playerY: number,
  altarX: number, altarY: number,
  tileSize: number = 16,
  radiusTiles: number = 1.5,
): boolean {
  return inRange(playerX, playerY, altarX, altarY, radiusTiles * tileSize);
}

export function npcInTalkRange(
  playerX: number, playerY: number,
  npcX: number, npcY: number,
  tileSize: number = 16,
  radiusTiles: number = 2,
): boolean {
  return inRange(playerX, playerY, npcX, npcY, radiusTiles * tileSize);
}
