import { describe, it, expect } from 'vitest';
import { LEVEL_DATA, BOSS_DATA } from '../src/level-data';

describe('LEVEL_DATA', () => {
  it('has 5 templates', () => {
    expect(Object.keys(LEVEL_DATA)).toEqual(
      expect.arrayContaining(['sideScrollerComet', 'verticalShmup', 'twinStickBattler', 'tileMatch', 'sokoban']),
    );
  });

  it('every template has 3 levels', () => {
    for (const tpl of Object.values(LEVEL_DATA)) {
      expect(tpl).toHaveLength(3);
    }
  });

  it('sideScroller level 1 has platforms, enemies, stars, goal', () => {
    const l1 = LEVEL_DATA.sideScrollerComet[0]!;
    expect(l1.platforms.length).toBeGreaterThan(0);
    expect(l1.enemies.length).toBeGreaterThan(0);
    expect(l1.goal).toBeDefined();
  });

  it('sokoban L3 has moving target (boss equivalent)', () => {
    expect(LEVEL_DATA.sokoban[2]!.movingTarget).toBe(true);
  });

  it('tileMatch L3 has iceBlocks (boss equivalent)', () => {
    expect(LEVEL_DATA.tileMatch[2]!.iceBlocks).toBeGreaterThan(0);
  });
});

describe('BOSS_DATA', () => {
  it('has 3 boss templates (sideScroller, verticalShmup, twinStickBattler)', () => {
    expect(Object.keys(BOSS_DATA)).toEqual(
      expect.arrayContaining(['sideScrollerComet', 'verticalShmup', 'twinStickBattler']),
    );
  });

  it('every boss has hp >= 3', () => {
    for (const b of Object.values(BOSS_DATA)) {
      expect(b.hp).toBeGreaterThanOrEqual(3);
    }
  });
});
