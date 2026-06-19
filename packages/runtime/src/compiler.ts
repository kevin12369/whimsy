import { defaultConfig, type GameConfig } from './config';
import { gameSpecSchema, type GameSpec } from './spec';
import { generateLevelData, type LevelData } from './level-generator';

export interface CompiledGame {
  config: GameConfig;
  levelData: LevelData;
}

export function compileSpec(spec: GameSpec): CompiledGame {
  // 1. Validate (throws on invalid)
  const validated = gameSpecSchema.parse(spec);

  // 2. Build base config
  const baseConfig = defaultConfig('sideScroller');

  // 3. Generate level data
  const levelData = generateLevelData(validated.level.concept, {
    enemyCount: validated.level.enemyCount,
    starCount: validated.level.starCount,
    enemySpeed: validated.mechanics.enemySpeed,
    width: 800,
    height: 480,
  });

  // 4. Build config with spec-derived overrides
  // templateHint is always 'sideScroller' (only platformer is supported in MVP)
  const config: GameConfig = {
    ...baseConfig,
    type: 'sideScroller',
    primary: validated.art.palette.primary,
    secondary: validated.art.palette.secondary,
    enemyColor: validated.art.palette.enemy,
    playerSpeed: validated.mechanics.moveSpeed,
    jumpVelocity: validated.mechanics.jumpVelocity,
    gravity: validated.mechanics.gravity,
    enemySpeed: validated.mechanics.enemySpeed,
  };

  // Attach levelData as extra field (template reads it)
  (config as any).levelData = levelData;

  return { config, levelData };
}
