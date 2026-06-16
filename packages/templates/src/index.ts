export { TEMPLATES, getTemplate, getAllTemplates } from './registry';
export { cacheKey, normalizeTheme, hashString } from './cache';
export { sideScrollerComet } from './platformer';
export { verticalShmup, twinStickBattler } from './shooter';
export { tileMatch, sokoban } from './puzzle';
export { recordEnd, getHighScore, clearAll } from './score-store';
export { renderHud, hudStyles } from './hud';
export { LEVEL_DATA, BOSS_DATA } from './level-data';
export type { Template, Theme } from './types';
export {
  parseConfig,
  clampConfig,
  defaultConfig,
  isValidType,
  VALID_TYPES,
} from './game-config';
export type { GameConfig, GameType } from './game-config';
