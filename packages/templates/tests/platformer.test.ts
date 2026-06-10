import { describe, it, expect } from 'vitest';
import { PLATFORMER_TEMPLATES, spaceComet } from '../src/platformer';

describe('platformer templates', () => {
  it('exports 5 templates', () => {
    expect(PLATFORMER_TEMPLATES).toHaveLength(5);
  });

  it('each template has a unique id', () => {
    const ids = PLATFORMER_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('spaceComet render returns a complete HTML doc with substituted theme', () => {
    const html = spaceComet.render({
      primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid', flavorText: '',
    });
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html.endsWith('</html>')).toBe(true);
    expect(html).toContain('#3aa6ff');
    expect(html).toContain('comet');
  });

  it('spaceComet contains Phaser and keyboard handler', () => {
    const html = spaceComet.render({
      primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid', flavorText: '',
    });
    expect(html).toContain('cdn.jsdelivr.net');
    expect(html).toContain('phaser');
    expect(html).toContain('keydown');
  });
});
