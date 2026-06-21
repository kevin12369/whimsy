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