import { describe, it, expect } from 'vitest';
import { SHOOTER_TEMPLATES, spaceDefender } from '../src/shooter';

describe('shooter templates', () => {
  it('exports 5 templates', () => {
    expect(SHOOTER_TEMPLATES).toHaveLength(5);
  });

  it('spaceDefender renders with theme injected', () => {
    const html = spaceDefender.render({
      primary: '#ff00ff', secondary: '#fff', playerLabel: 'ship', enemyLabel: 'ufo', flavorText: '',
    });
    expect(html).toContain('#ff00ff');
    expect(html).toContain('ship');
    expect(html).toContain('keydown');
  });
});
