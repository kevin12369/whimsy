import { describe, it, expect } from 'vitest';
import { tileMatch, sokoban, PUZZLE_TEMPLATES } from '../src/puzzle';
import { LEVEL_DATA } from '../src/level-data';

const defaultTheme = { primary: '#9b59b6', secondary: '#ffffff', playerLabel: 'tile', enemyLabel: 'block', flavorText: '' };

describe('tileMatch', () => {
  it('howToPlay mentions swap', () => {
    expect(tileMatch.howToPlay).toContain('swap');
  });
  it('renders complete HTML with board data', () => {
    const html = tileMatch.render(defaultTheme);
    expect(html).toContain('phaser.min.js');
    expect(html).toContain('8x8');
    expect(html).toContain('HOW TO PLAY');
  });
  it('injects iceBlocks for L3', () => {
    const html = tileMatch.render(defaultTheme);
    expect(html).toContain(LEVEL_DATA.tileMatch[2]!.iceBlocks.toString());
  });
});

describe('sokoban', () => {
  it('howToPlay mentions U for undo', () => {
    expect(sokoban.howToPlay).toContain('U');
  });
  it('renders complete HTML with grid data', () => {
    const html = sokoban.render(defaultTheme);
    expect(html).toContain('5');
    expect(html).toContain('7');
  });
  it('injects moving target flag for L3', () => {
    const html = sokoban.render(defaultTheme);
    expect(html).toMatch(/moving[A-Z]\w+|true/);
  });
});

describe('PUZZLE_TEMPLATES', () => {
  it('has 2 entries (tileMatch + sokoban)', () => {
    expect(PUZZLE_TEMPLATES).toHaveLength(2);
    const ids = PUZZLE_TEMPLATES.map(t => t.id);
    expect(ids).toContain('tileMatch');
    expect(ids).toContain('sokoban');
  });
});
