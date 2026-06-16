import { describe, it, expect } from 'vitest';
import {
  parseConfig,
  clampConfig,
  defaultConfig,
  VALID_TYPES,
  isValidType,
} from '../src/game-config';
import type { GameConfig } from '../src/game-config';

describe('VALID_TYPES', () => {
  it('exposes 5 game types', () => {
    expect(VALID_TYPES).toEqual([
      'sideScroller',
      'verticalShmup',
      'twinStickBattler',
      'tileMatch',
      'sokoban',
    ]);
  });
});

describe('isValidType', () => {
  it('accepts known types', () => {
    for (const t of VALID_TYPES) expect(isValidType(t)).toBe(true);
  });
  it('rejects unknown', () => {
    expect(isValidType('weird')).toBe(false);
    expect(isValidType('')).toBe(false);
  });
});

describe('parseConfig', () => {
  it('parses clean JSON', () => {
    const r = parseConfig('{"type":"sideScroller","playerSpeed":220,"lives":3}');
    expect(r.type).toBe('sideScroller');
    expect(r.playerSpeed).toBe(220);
    expect(r.lives).toBe(3);
  });

  it('strips markdown fence before parsing', () => {
    const r = parseConfig('```json\n{"type":"tileMatch","moves":20}\n```');
    expect(r.type).toBe('tileMatch');
    expect(r.moves).toBe(20);
  });

  it('falls back to defaultConfig on garbage input', () => {
    const r = parseConfig('not json at all');
    expect(VALID_TYPES).toContain(r.type);
    expect(r.playerSpeed).toBe(defaultConfig().playerSpeed);
  });

  it('falls back to defaultConfig on empty string', () => {
    const r = parseConfig('');
    expect(VALID_TYPES).toContain(r.type);
  });

  it('rewrites invalid type to a random valid type', () => {
    const r = parseConfig('{"type":"weird","playerSpeed":220}');
    expect(VALID_TYPES).toContain(r.type);
    expect(r.type).not.toBe('weird');
    expect(r.playerSpeed).toBe(220); // other valid fields preserved
  });

  it('preserves unknown extra fields (forwards to defaults)', () => {
    const r = parseConfig('{"type":"sokoban","gridSize":7,"extraField":42}');
    expect(r.type).toBe('sokoban');
    expect(r.gridSize).toBe(7);
  });
});

describe('clampConfig', () => {
  it('clamps playerSpeed to [50, 400]', () => {
    const c = clampConfig({ ...defaultConfig(), type: 'sideScroller', playerSpeed: 9999 });
    expect(c.playerSpeed).toBe(400);
  });

  it('clamps playerSpeed min', () => {
    const c = clampConfig({ ...defaultConfig(), type: 'sideScroller', playerSpeed: -100 });
    expect(c.playerSpeed).toBe(50);
  });

  it('clamps lives to [1, 9]', () => {
    const c = clampConfig({ ...defaultConfig(), type: 'sideScroller', lives: 999 });
    expect(c.lives).toBe(9);
  });

  it('clamps boardSize to [6, 10]', () => {
    const c = clampConfig({ ...defaultConfig(), type: 'tileMatch', boardSize: 99 });
    expect(c.boardSize).toBe(10);
  });

  it('clamps gridSize to [5, 8]', () => {
    const c = clampConfig({ ...defaultConfig(), type: 'sokoban', gridSize: 1 });
    expect(c.gridSize).toBe(5);
  });

  it('leaves valid values alone', () => {
    const c = clampConfig({ ...defaultConfig(), type: 'sideScroller', playerSpeed: 200, lives: 3 });
    expect(c.playerSpeed).toBe(200);
    expect(c.lives).toBe(3);
  });
});

describe('defaultConfig', () => {
  it('returns a valid sideScroller config', () => {
    const d = defaultConfig();
    expect(VALID_TYPES).toContain(d.type);
  });
});
