export interface LevelData {
  concept: 'flat' | 'stairs' | 'gap' | 'boss';
  platforms: Array<{ x: number; y: number; w: number; h: number }>;
  enemies: Array<{ x: number; y: number; vx: number }>;
  stars: Array<{ x: number; y: number }>;
  goal: { x: number; y: number };
  boss?: { x: number; y: number; w: number; h: number; hp: number; speed: number };
}

export interface LevelGenOptions {
  enemyCount: number;
  starCount: number;
  enemySpeed: number;
  width: number;
  height: number;
}

export function generateLevelData(
  concept: 'flat' | 'stairs' | 'gap' | 'boss',
  opts: LevelGenOptions,
): LevelData {
  switch (concept) {
    case 'flat': return generateFlat(opts);
    case 'stairs': return generateStairs(opts);
    case 'gap': return generateGap(opts);
    case 'boss': return generateBoss(opts);
  }
}

function generateFlat(opts: LevelGenOptions): LevelData {
  return {
    concept: 'flat',
    platforms: [{ x: 0, y: 440, w: opts.width, h: 40 }],
    enemies: distributeEnemies(opts.enemyCount, 60, opts.width - 80, 416, opts.enemySpeed),
    stars: distributeStars(opts.starCount, 100, opts.width - 60, 50, 380),
    goal: { x: opts.width - 60, y: 440 - 60 },
  };
}

function generateStairs(opts: LevelGenOptions): LevelData {
  const xStep = (opts.width - 200) / 4;
  const stairs = Array.from({ length: 5 }, (_, i) => ({
    x: 20 + i * xStep,
    y: 440 - i * 50,
    w: 140,
    h: 20,
  }));
  // Ground at the bottom for fallback
  const platforms = [{ x: 0, y: 440, w: opts.width, h: 40 }, ...stairs];
  return {
    concept: 'stairs',
    platforms,
    enemies: distributeEnemies(opts.enemyCount, 100, opts.width - 100, 200, opts.enemySpeed),
    stars: distributeStars(opts.starCount, 100, opts.width - 100, 50, 350),
    goal: { x: opts.width - 60, y: 100 },
  };
}

function generateGap(opts: LevelGenOptions): LevelData {
  const gap = 120;
  const platformW = (opts.width - gap) / 2;
  const platforms = [
    { x: 0, y: 440, w: platformW, h: 40 },
    { x: platformW + gap, y: 440, w: platformW, h: 40 },
  ];
  return {
    concept: 'gap',
    platforms,
    enemies: distributeEnemies(opts.enemyCount, 60, opts.width - 80, 416, opts.enemySpeed),
    stars: distributeStars(opts.starCount, 50, opts.width - 50, 50, 380),
    goal: { x: opts.width - 60, y: 380 },
  };
}

function generateBoss(opts: LevelGenOptions): LevelData {
  const platforms = [
    { x: 0, y: 440, w: opts.width, h: 40 },
    { x: 50, y: 360, w: 80, h: 20 },
    { x: opts.width - 130, y: 360, w: 80, h: 20 },
  ];
  return {
    concept: 'boss',
    platforms,
    enemies: distributeEnemies(opts.enemyCount, 100, opts.width - 100, 416, opts.enemySpeed),
    stars: distributeStars(opts.starCount, 60, opts.width - 60, 50, 320),
    goal: { x: 0, y: 0 },
    boss: {
      x: opts.width / 2 - 30,
      y: 440 - 80,
      w: 60,
      h: 80,
      hp: 5,
      speed: 180,
    },
  };
}

function distributeEnemies(count: number, minX: number, maxX: number, y: number, speed: number) {
  if (count === 0) return [];
  const step = (maxX - minX) / (count + 1);
  return Array.from({ length: count }, (_, i) => ({
    x: minX + step * (i + 1),
    y,
    vx: i % 2 === 0 ? -speed : speed,
  }));
}

function distributeStars(count: number, minX: number, maxX: number, minY: number, maxY: number) {
  if (count === 0) return [];
  const step = (maxX - minX) / (count + 1);
  return Array.from({ length: count }, (_, i) => ({
    x: minX + step * (i + 1),
    y: minY + ((i * 53) % (maxY - minY)),
  }));
}
