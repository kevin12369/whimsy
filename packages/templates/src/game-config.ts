// packages/templates/src/game-config.ts

export type GameType = 'sideScroller' | 'verticalShmup' | 'twinStickBattler' | 'tileMatch' | 'sokoban';

export const VALID_TYPES: GameType[] = [
  'sideScroller',
  'verticalShmup',
  'twinStickBattler',
  'tileMatch',
  'sokoban',
];

export function isValidType(s: unknown): s is GameType {
  return typeof s === 'string' && (VALID_TYPES as string[]).includes(s);
}

export interface GameConfig {
  type: GameType;

  // theme
  primary: string;
  secondary: string;
  enemyColor: string;
  playerLabel: string;
  enemyLabel: string;

  // sideScroller
  playerSpeed?: number;
  jumpVelocity?: number;
  gravity?: number;
  enemyCount?: number;
  enemySpeed?: number;
  spawnIntervalMs?: number;

  // verticalShmup
  scrollSpeed?: number;
  enemyFireRateMs?: number;
  enemyRows?: number;

  // twinStickBattler
  roomCount?: number;
  enemiesPerRoom?: number;
  enemyFireMs?: number;

  // tileMatch
  boardSize?: number;
  moves?: number;
  targetScore?: number;
  iceBlocks?: number;

  // sokoban
  gridSize?: number;
  boxCount?: number;
  movingTarget?: boolean;

  // shared
  lives?: number;
}

interface ClampSpec {
  min: number;
  max: number;
  int: boolean;
}

const CLAMP: Record<string, ClampSpec> = {
  // sideScroller
  playerSpeed: { min: 50, max: 400, int: true },
  jumpVelocity: { min: 200, max: 600, int: true },
  gravity: { min: 400, max: 1200, int: true },
  enemyCount: { min: 1, max: 15, int: true },
  enemySpeed: { min: 50, max: 300, int: true },
  spawnIntervalMs: { min: 500, max: 3000, int: true },
  // shmup
  scrollSpeed: { min: 1, max: 3, int: false },
  enemyFireRateMs: { min: 0, max: 3000, int: true },
  enemyRows: { min: 1, max: 5, int: true },
  // twinStick
  roomCount: { min: 1, max: 8, int: true },
  enemiesPerRoom: { min: 2, max: 10, int: true },
  enemyFireMs: { min: 0, max: 3000, int: true },
  // tileMatch
  boardSize: { min: 6, max: 10, int: true },
  moves: { min: 10, max: 50, int: true },
  targetScore: { min: 500, max: 5000, int: true },
  iceBlocks: { min: 0, max: 10, int: true },
  // sokoban
  gridSize: { min: 5, max: 8, int: true },
  boxCount: { min: 1, max: 8, int: true },
  // shared
  lives: { min: 1, max: 9, int: true },
};

function clampNum(key: string, raw: unknown): number | undefined {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return undefined;
  const spec = CLAMP[key];
  if (!spec) return Math.round(raw);
  let v = Math.max(spec.min, Math.min(spec.max, raw));
  if (spec.int) v = Math.round(v);
  return v;
}

export function clampConfig(raw: GameConfig): GameConfig {
  const out: GameConfig = { ...raw };
  for (const [k, spec] of Object.entries(CLAMP)) {
    const key = k as keyof GameConfig;
    if ((raw as any)[key] !== undefined) {
      (out as any)[key] = clampNum(k, (raw as any)[key]);
    }
  }
  return out;
}

const DEFAULT_PRIMARY = '#3aa6ff';
const DEFAULT_SECONDARY = '#ffffff';
const DEFAULT_ENEMY = '#ff4444';
const DEFAULT_PLAYER_LABEL = 'hero';
const DEFAULT_ENEMY_LABEL = 'enemy';

export function defaultConfig(): GameConfig {
  return {
    type: 'sideScroller',
    primary: DEFAULT_PRIMARY,
    secondary: DEFAULT_SECONDARY,
    enemyColor: DEFAULT_ENEMY,
    playerLabel: DEFAULT_PLAYER_LABEL,
    enemyLabel: DEFAULT_ENEMY_LABEL,
    playerSpeed: 220,
    jumpVelocity: 460,
    gravity: 900,
    enemyCount: 5,
    enemySpeed: 200,
    spawnIntervalMs: 1400,
    scrollSpeed: 1.5,
    enemyFireRateMs: 1500,
    enemyRows: 3,
    roomCount: 4,
    enemiesPerRoom: 5,
    enemyFireMs: 1500,
    boardSize: 8,
    moves: 20,
    targetScore: 1500,
    iceBlocks: 0,
    gridSize: 6,
    boxCount: 3,
    movingTarget: false,
    lives: 3,
  };
}

function randomType(): GameType {
  return VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]!;
}

function isHexColor(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s);
}

function sanitizeTheme(c: GameConfig): GameConfig {
  return {
    ...c,
    primary: isHexColor(c.primary ?? '') ? c.primary! : DEFAULT_PRIMARY,
    secondary: isHexColor(c.secondary ?? '') ? c.secondary! : DEFAULT_SECONDARY,
    enemyColor: isHexColor(c.enemyColor ?? '') ? c.enemyColor! : DEFAULT_ENEMY,
    playerLabel: typeof c.playerLabel === 'string' && c.playerLabel.length > 0 && c.playerLabel.length <= 32
      ? c.playerLabel
      : DEFAULT_PLAYER_LABEL,
    enemyLabel: typeof c.enemyLabel === 'string' && c.enemyLabel.length > 0 && c.enemyLabel.length <= 32
      ? c.enemyLabel
      : DEFAULT_ENEMY_LABEL,
  };
}

export function parseConfig(raw: string): GameConfig {
  // Try to find a JSON object somewhere in the LLM's output.
  const stripped = raw
    .replace(/^[\s\S]*?```(?:json|JSON)?\s*\n/, '')
    .replace(/\n```\s*$/, '')
    .trim();
  const m = stripped.match(/\{[\s\S]*\}/);
  let parsed: any = {};
  if (m) {
    try {
      parsed = JSON.parse(m[0]);
    } catch {
      parsed = {};
    }
  }
  // Build a merged config: defaults first, parsed over, then theme sanitized,
  // type validated, and numbers clamped.
  const d = defaultConfig();
  const merged: GameConfig = { ...d, ...parsed };
  merged.type = isValidType(parsed.type) ? parsed.type : randomType();
  const sanitized = sanitizeTheme(merged);
  return clampConfig(sanitized);
}
