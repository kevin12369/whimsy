import { describe, it, expect } from 'vitest';
import { PUZZLE_TEMPLATES, tileMatch } from '../src/puzzle';

describe('puzzle templates', () => {
  it('exports 5 templates', () => {
    expect(PUZZLE_TEMPLATES).toHaveLength(5);
  });

  it('tileMatch uses theme colors', () => {
    const html = tileMatch.render({
      primary: '#00aa00', secondary: '#aa0000', playerLabel: 'cursor', enemyLabel: 'tile', flavorText: '',
    });
    // #00aa00 = 43520, #aa0000 = 11141120
    expect(html).toContain('43520');
    expect(html).toContain('11141120');
    expect(html).toContain('pointerdown');
  });

  it('every puzzle template has a flavorText', () => {
    for (const t of PUZZLE_TEMPLATES) {
      expect(t.defaultTheme.flavorText.length).toBeGreaterThan(5);
    }
  });
});