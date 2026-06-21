import { SESSION_LEVELS } from '../config/constants';
import type { Level } from './cardSystem';

export interface SessionLoop {
  currentLevelIndex: number;
  maxLevels: number;
  done: boolean;
  levels: Level[];
}

export function createSession(levels: Level[] = []): SessionLoop {
  return { currentLevelIndex: 0, maxLevels: SESSION_LEVELS, done: false, levels };
}

export function advanceLevel(s: SessionLoop): SessionLoop {
  if (s.done) return s;
  const next = s.currentLevelIndex + 1;
  if (next >= s.maxLevels) return { ...s, currentLevelIndex: s.maxLevels - 1, done: true };
  return { ...s, currentLevelIndex: next };
}

export function reachedExit(playerTile: { x: number; y: number }, exitTile: { x: number; y: number }): boolean {
  return playerTile.x === exitTile.x && playerTile.y === exitTile.y;
}

// Pixel-level exit trigger: bbox overlap between player (12x12 centered
// on (px, py)) and exit (tileSize*tilesWide x tileSize*tilesTall starting
// at (exitTileX*tileSize, exitTileY*tileSize)). Defaults to a single tile
// exit (tilesWide/tilesTall = 1) — Phase 1 GameScene passes 2 to match
// the visible 2x2 yellow exit block.
export function reachedExitPixel(
  playerCenterX: number,
  playerCenterY: number,
  exitTileX: number,
  exitTileY: number,
  tileSize: number,
  tilesWide: number = 1,
  tilesTall: number = 1,
): boolean {
  const pxL = playerCenterX - 6;
  const pxR = playerCenterX + 6;
  const pyT = playerCenterY - 6;
  const pyB = playerCenterY + 6;
  const exL = exitTileX * tileSize;
  const exR = exL + tileSize * tilesWide;
  const eyT = exitTileY * tileSize;
  const eyB = eyT + tileSize * tilesTall;
  return pxL < exR && pxR > exL && pyT < eyB && pyB > eyT;
}