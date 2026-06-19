import { describe, it, expect } from 'vitest';
import { compileSpec } from '../compiler';
import type { GameSpec } from '../spec';

describe('compileSpec', () => {
  const validSpec: GameSpec = {
    meta: { name: 'Test', flavor: 'A test game', templateHint: 'platformer' },
    mechanics: { gravity: 900, jumpVelocity: 460, moveSpeed: 220, enemySpeed: 80 },
    art: {
      palette: { primary: '#3aa6ff', secondary: '#ffffff', enemy: '#ff6b6b', bg: '#02030a' },
      style: 'geometric',
    },
    level: { concept: 'flat', enemyCount: 2, starCount: 1 },
  };

  it('returns config with spec-derived fields', () => {
    const { config } = compileSpec(validSpec);
    expect(config.type).toBe('sideScroller');
    expect(config.primary).toBe('#3aa6ff');
    expect(config.enemyColor).toBe('#ff6b6b');
    expect(config.playerSpeed).toBe(220);
    expect(config.jumpVelocity).toBe(460);
    expect(config.gravity).toBe(900);
    expect(config.enemySpeed).toBe(80);
  });

  it('returns levelData for the concept', () => {
    const { levelData } = compileSpec(validSpec);
    expect(levelData.concept).toBe('flat');
    expect(levelData.platforms).toHaveLength(1);
  });

  it('attaches levelData to config for template access', () => {
    const { config } = compileSpec(validSpec);
    expect((config as any).levelData).toBeDefined();
  });

  it('throws on invalid spec (zod fail)', () => {
    const bad = { ...validSpec, mechanics: { ...validSpec.mechanics, gravity: 9999 } };
    expect(() => compileSpec(bad as any)).toThrow();
  });

  it('compiles stairs concept correctly', () => {
    const { levelData } = compileSpec({ ...validSpec, level: { concept: 'stairs', enemyCount: 0, starCount: 0 } });
    expect(levelData.concept).toBe('stairs');
    expect(levelData.platforms.length).toBeGreaterThanOrEqual(5);
  });

  it('compiles boss concept with boss field', () => {
    const { levelData } = compileSpec({ ...validSpec, level: { concept: 'boss', enemyCount: 0, starCount: 0 } });
    expect(levelData.boss).toBeDefined();
  });
});
