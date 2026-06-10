import { describe, it, expect } from 'vitest';
import { PUZZLE_TEMPLATES, colorMatch } from '../src/puzzle';

describe('puzzle templates', () => {
  it('exports 5 templates', () => {
    expect(PUZZLE_TEMPLATES).toHaveLength(5);
  });

  it('colorMatch uses theme colors', () => {
    const html = colorMatch.render({
      primary: '#00aa00', secondary: '#aa0000', playerLabel: 'cursor', enemyLabel: 'tile', flavorText: '',
    });
    expect(html).toContain('#00aa00');
    expect(html).toContain('keydown');
  });
});
