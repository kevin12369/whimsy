// Compact level data. Each template has 3 levels. Field names kept short to keep
// the injected JSON small (<500B per level).

export interface PlatformerLevel {
  platforms: Array<{ x: number; y: number; w: number; h: number }>;
  movingPlatforms?: Array<{ x: number; y: number; w: number; h: number; dx: number; dy: number; sp: number }>;
  enemies: Array<{ x: number; y: number; sp: number }>;
  stars: Array<{ x: number; y: number }>;
  goal: { x: number; y: number };
  gravity: number;
}

export interface ShmupLevel {
  enemyCount: number;
  enemySpeed: number;
  enemyFireRateMs: number;
  playerSpeed: number;
  scrollSpeed: number;
}

export interface TwinStickLevel {
  rooms: number;
  enemiesPerRoom: number;
  enemySpeed: number;
  enemyFireMs: number;
}

export interface TileMatchLevel {
  moves: number;
  targetScore: number;
  iceBlocks: number;
}

export interface SokobanLevel {
  grid: number; // 5 / 6 / 7
  boxes: Array<{ x: number; y: number }>;
  targets: Array<{ x: number; y: number }>;
  movingTarget: boolean;
}

export const LEVEL_DATA = {
  sideScrollerComet: [
    // L1 — basic platforms + 2 enemies + 5 stars + flag
    {
      gravity: 800,
      platforms: [
        { x: 0, y: 430, w: 800, h: 40 },
        { x: 200, y: 340, w: 80, h: 20 },
        { x: 400, y: 280, w: 80, h: 20 },
        { x: 600, y: 340, w: 80, h: 20 },
      ],
      enemies: [{ x: 500, y: 400, sp: -100 }, { x: 700, y: 310, sp: -80 }],
      stars: [{ x: 240, y: 320 }, { x: 440, y: 260 }, { x: 640, y: 320 }, { x: 320, y: 410 }, { x: 700, y: 410 }],
      goal: { x: 770, y: 400 },
    },
    // L2 — moving platform + 3 enemies
    {
      gravity: 800,
      platforms: [
        { x: 0, y: 430, w: 250, h: 40 },
        { x: 0, y: 300, w: 100, h: 20 },
        { x: 600, y: 430, w: 200, h: 40 },
        { x: 400, y: 250, w: 100, h: 20 },
      ],
      movingPlatforms: [{ x: 250, y: 350, w: 80, h: 20, dx: 100, dy: 0, sp: 60 }],
      enemies: [{ x: 350, y: 400, sp: -120 }, { x: 550, y: 220, sp: -100 }, { x: 700, y: 400, sp: -90 }],
      stars: [{ x: 290, y: 330 }, { x: 450, y: 230 }, { x: 670, y: 410 }, { x: 150, y: 410 }, { x: 50, y: 280 }, { x: 750, y: 410 }],
      goal: { x: 770, y: 400 },
    },
    // L3 — fragmented + boss path
    {
      gravity: 900,
      platforms: [
        { x: 0, y: 430, w: 150, h: 40 },
        { x: 220, y: 380, w: 60, h: 20 },
        { x: 340, y: 320, w: 60, h: 20 },
        { x: 460, y: 260, w: 60, h: 20 },
        { x: 580, y: 320, w: 60, h: 20 },
        { x: 700, y: 380, w: 100, h: 20 },
      ],
      enemies: [
        { x: 230, y: 350, sp: -140 },
        { x: 350, y: 290, sp: -120 },
        { x: 470, y: 230, sp: -100 },
        { x: 590, y: 290, sp: -130 },
        { x: 720, y: 350, sp: -150 },
      ],
      stars: [{ x: 250, y: 360 }, { x: 370, y: 300 }, { x: 490, y: 240 }, { x: 610, y: 300 }, { x: 740, y: 360 }],
      goal: { x: 760, y: 350 },
    },
  ] as PlatformerLevel[],

  verticalShmup: [
    { enemyCount: 8, enemySpeed: 60, enemyFireRateMs: 0, playerSpeed: 200, scrollSpeed: 1 },
    { enemyCount: 12, enemySpeed: 80, enemyFireRateMs: 1500, playerSpeed: 220, scrollSpeed: 1.2 },
    { enemyCount: 16, enemySpeed: 100, enemyFireRateMs: 800, playerSpeed: 240, scrollSpeed: 1.5 },
  ] as ShmupLevel[],

  twinStickBattler: [
    { rooms: 3, enemiesPerRoom: 4, enemySpeed: 60, enemyFireMs: 0 },
    { rooms: 4, enemiesPerRoom: 5, enemySpeed: 75, enemyFireMs: 2000 },
    { rooms: 5, enemiesPerRoom: 7, enemySpeed: 90, enemyFireMs: 1500 },
  ] as TwinStickLevel[],

  tileMatch: [
    { moves: 20, targetScore: 1000, iceBlocks: 0 },
    { moves: 25, targetScore: 1500, iceBlocks: 0 },
    { moves: 30, targetScore: 2500, iceBlocks: 5 },
  ] as TileMatchLevel[],

  sokoban: [
    { grid: 5, boxes: [{ x: 1, y: 2 }], targets: [{ x: 3, y: 2 }], movingTarget: false },
    { grid: 6, boxes: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }], targets: [{ x: 4, y: 4 }, { x: 1, y: 4 }, { x: 4, y: 1 }], movingTarget: false },
    { grid: 7, boxes: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }], targets: [{ x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }], movingTarget: true },
  ] as SokobanLevel[],
} as const;

export const BOSS_DATA = {
  sideScrollerComet: { x: 700, y: 300, w: 60, h: 60, hp: 3, attackPattern: 'charge', speed: 250 },
  verticalShmup: { x: 400, y: 100, w: 50, h: 50, hp: 9, attackPattern: 'phases', phases: 3, fireRate: 600 },
  twinStickBattler: { x: 400, y: 225, w: 40, h: 40, hp: 5, attackPattern: 'spiral', fireRate: 800 },
} as const;
