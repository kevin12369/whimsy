import { describe, it, expect } from 'vitest';
import { tileMatch, sokoban, PUZZLE_TEMPLATES } from '../src/puzzle';
import { defaultConfig } from '../src/game-config';

const theme = { primary: '#9b59b6', secondary: '#ffffff', playerLabel: 'tile', enemyLabel: 'block', flavorText: '' };
const cfg = defaultConfig();

describe('tileMatch', () => {
  it('howToPlay mentions swap', () => {
    expect(tileMatch.howToPlay).toContain('swap');
  });
  it('declares consumed fields', () => {
    expect(tileMatch.consumes).toEqual(
      expect.arrayContaining(['boardSize', 'moves', 'targetScore', 'iceBlocks']),
    );
  });
  it('declares clamp ranges', () => {
    expect(tileMatch.clamp.boardSize).toEqual([6, 10]);
    expect(tileMatch.clamp.moves).toEqual([10, 50]);
  });
  it('renders complete HTML', () => {
    const html = tileMatch.render(theme, cfg);
    expect(html).toContain('window.__WHIMSY_G__');
    expect(html).toContain('HOW TO PLAY');
    expect(html).toContain('__whimsy_cleanup');
  });
  it('inlines clamped boardSize', () => {
    const big = { ...cfg, boardSize: 99 };
    const html = tileMatch.render(theme, big);
    expect(html).toMatch(/SIZE\s*=\s*10/);
  });
});

describe('sokoban', () => {
  it('howToPlay mentions U for undo', () => {
    expect(sokoban.howToPlay).toContain('U');
  });
  it('declares consumed fields', () => {
    expect(sokoban.consumes).toEqual(
      expect.arrayContaining(['gridSize', 'boxCount', 'movingTarget']),
    );
  });
  it('declares clamp ranges', () => {
    expect(sokoban.clamp.gridSize).toEqual([5, 8]);
    expect(sokoban.clamp.boxCount).toEqual([1, 8]);
  });
  it('renders complete HTML', () => {
    const html = sokoban.render(theme, cfg);
    expect(html).toContain('HOW TO PLAY');
  });
  it('inlines clamped gridSize', () => {
    const huge = { ...cfg, gridSize: 99 };
    const html = sokoban.render(theme, huge);
    expect(html).toMatch(/GRID\s*=\s*8/);
  });
  it('uses movingTarget from config', () => {
    const mt = { ...cfg, movingTarget: true };
    const html = sokoban.render(theme, mt);
    expect(html).toContain('MOVING');
  });
});

describe('PUZZLE_TEMPLATES', () => {
  it('has 2 entries', () => {
    expect(PUZZLE_TEMPLATES).toHaveLength(2);
    const ids = PUZZLE_TEMPLATES.map(t => t.id);
    expect(ids).toContain('tileMatch');
    expect(ids).toContain('sokoban');
  });
});
