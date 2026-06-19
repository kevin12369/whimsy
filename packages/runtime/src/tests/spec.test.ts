import { describe, it, expect } from 'vitest';
import { gameSpecSchema, type GameSpec } from '../spec';

describe('gameSpecSchema', () => {
  it('accepts a valid spec', () => {
    const spec: GameSpec = {
      meta: { name: 'Asteroid Field', flavor: 'You are a comet', templateHint: 'platformer' },
      mechanics: { gravity: 900, jumpVelocity: 460, moveSpeed: 220, enemySpeed: 80 },
      art: {
        palette: { primary: '#3aa6ff', secondary: '#ffffff', enemy: '#ff6b6b', bg: '#02030a' },
        style: 'geometric',
      },
      level: { concept: 'flat', enemyCount: 2, starCount: 1 },
    };
    expect(() => gameSpecSchema.parse(spec)).not.toThrow();
  });

  it('rejects out-of-range gravity', () => {
    const bad = {
      meta: { name: 'X', flavor: 'Y', templateHint: 'platformer' },
      mechanics: { gravity: 9999, jumpVelocity: 460, moveSpeed: 220, enemySpeed: 80 },
      art: { palette: { primary: '#3aa6ff', secondary: '#ffffff', enemy: '#ff6b6b', bg: '#02030a' }, style: 'geometric' },
      level: { concept: 'flat', enemyCount: 2, starCount: 1 },
    };
    expect(() => gameSpecSchema.parse(bad)).toThrow();
  });

  it('rejects unknown templateHint', () => {
    const bad = {
      meta: { name: 'X', flavor: 'Y', templateHint: 'mario' },
      mechanics: { gravity: 900, jumpVelocity: 460, moveSpeed: 220, enemySpeed: 80 },
      art: { palette: { primary: '#3aa6ff', secondary: '#ffffff', enemy: '#ff6b6b', bg: '#02030a' }, style: 'geometric' },
      level: { concept: 'flat', enemyCount: 2, starCount: 1 },
    };
    expect(() => gameSpecSchema.parse(bad)).toThrow();
  });

  it('rejects bad hex color', () => {
    const bad = {
      meta: { name: 'X', flavor: 'Y', templateHint: 'platformer' },
      mechanics: { gravity: 900, jumpVelocity: 460, moveSpeed: 220, enemySpeed: 80 },
      art: { palette: { primary: 'blue', secondary: '#ffffff', enemy: '#ff6b6b', bg: '#02030a' }, style: 'geometric' },
      level: { concept: 'flat', enemyCount: 2, starCount: 1 },
    };
    expect(() => gameSpecSchema.parse(bad)).toThrow();
  });
});
