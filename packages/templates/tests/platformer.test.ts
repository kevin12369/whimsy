import { describe, it, expect } from 'vitest';
import { PLATFORMER_TEMPLATES, sideScrollerComet } from '../src/platformer';

describe('platformer templates', () => {
  it('exports 5 templates', () => {
    expect(PLATFORMER_TEMPLATES).toHaveLength(5);
  });

  it('each template has a unique id', () => {
    const ids = PLATFORMER_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sideScrollerComet render returns a complete HTML doc with substituted theme', () => {
    const html = sideScrollerComet.render({
      primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid', flavorText: '',
    });
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html.endsWith('</html>')).toBe(true);
    expect(html).toContain('comet');
    // Color is rendered as a hex int: #3aa6ff = 0x3aa6ff = 3843839
    expect(html).toContain('3843839');
  });

  it('sideScrollerComet contains Phaser and keyboard handler', () => {
    const html = sideScrollerComet.render({
      primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid', flavorText: '',
    });
    expect(html).toContain('cdn.jsdelivr.net');
    expect(html).toContain('phaser');
    expect(html).toContain('keydown');
  });

  it('every platformer template has a flavorText', () => {
    for (const t of PLATFORMER_TEMPLATES) {
      expect(t.defaultTheme.flavorText.length).toBeGreaterThan(5);
    }
  });
});