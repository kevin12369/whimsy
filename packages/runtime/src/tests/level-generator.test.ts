import { describe, it, expect } from 'vitest';
import { generateLevelData } from '../level-generator';

describe('generateLevelData', () => {
  it('flat: produces 1 ground platform and goal at right edge', () => {
    const data = generateLevelData('flat', { enemyCount: 0, starCount: 0, enemySpeed: 80, width: 800, height: 480 });
    expect(data.concept).toBe('flat');
    expect(data.platforms).toHaveLength(1);
    expect(data.platforms[0]!.y).toBe(440);
    expect(data.platforms[0]!.w).toBe(800);
    expect(data.goal).toEqual({ x: 740, y: 380 });
  });

  it('flat: distributes N enemies evenly along ground', () => {
    const data = generateLevelData('flat', { enemyCount: 3, starCount: 0, enemySpeed: 80, width: 800, height: 480 });
    expect(data.enemies).toHaveLength(3);
    // Enemies should be evenly distributed between minX=60 and maxX=720
    const x1 = data.enemies[0]!.x;
    const x2 = data.enemies[1]!.x;
    const x3 = data.enemies[2]!.x;
    expect(x2 - x1).toBeCloseTo(x3 - x2, 5);
    expect(x1).toBeGreaterThan(60);
    expect(x3).toBeLessThan(720);
  });

  it('flat: distributes N stars with y < 420 (above ground)', () => {
    const data = generateLevelData('flat', { enemyCount: 0, starCount: 3, enemySpeed: 80, width: 800, height: 480 });
    expect(data.stars).toHaveLength(3);
    for (const s of data.stars) {
      expect(s.y).toBeLessThan(420);
    }
  });
});

describe('stairs concept', () => {
  it('produces 5 ascending platforms (plus ground fallback)', () => {
    const data = generateLevelData('stairs', { enemyCount: 0, starCount: 0, enemySpeed: 80, width: 800, height: 480 });
    // 5 stairs + 1 ground platform
    expect(data.platforms.length).toBeGreaterThanOrEqual(5);
    // First non-ground platform should be highest
    expect(data.platforms[1]!.y).toBeGreaterThan(data.platforms[5]!.y);
  });

  it('platforms are reachable: gaps < 150', () => {
    const data = generateLevelData('stairs', { enemyCount: 0, starCount: 0, enemySpeed: 80, width: 800, height: 480 });
    for (let i = 1; i < data.platforms.length; i++) {
      const gap = data.platforms[i]!.x - (data.platforms[i - 1]!.x + data.platforms[i - 1]!.w);
      expect(gap).toBeLessThanOrEqual(150);
    }
  });
});

describe('gap concept', () => {
  it('produces 2 platforms with a gap', () => {
    const data = generateLevelData('gap', { enemyCount: 0, starCount: 0, enemySpeed: 80, width: 800, height: 480 });
    expect(data.platforms).toHaveLength(2);
    const gap = data.platforms[1]!.x - (data.platforms[0]!.x + data.platforms[0]!.w);
    expect(gap).toBeGreaterThan(50);
    expect(gap).toBeLessThan(180);
  });
});

describe('boss concept', () => {
  it('produces 1 large ground + 2 small platforms + 1 boss', () => {
    const data = generateLevelData('boss', { enemyCount: 0, starCount: 0, enemySpeed: 80, width: 800, height: 480 });
    expect(data.platforms).toHaveLength(3);
    expect(data.boss).toBeDefined();
    expect(data.boss!.hp).toBeGreaterThan(0);
  });
});
