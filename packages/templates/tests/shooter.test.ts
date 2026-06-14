import { describe, it, expect } from 'vitest';
import { SHOOTER_TEMPLATES, twinStickBattler } from '../src/shooter';

describe('shooter templates', () => {
  it('exports 5 templates', () => {
    expect(SHOOTER_TEMPLATES).toHaveLength(5);
  });

  it('twinStickBattler renders with theme injected', () => {
    const html = twinStickBattler.render({
      primary: '#ff00ff', secondary: '#fff', playerLabel: 'ship', enemyLabel: 'ufo', flavorText: '',
    });
    expect(html).toContain('ship');
    // #ff00ff as int = 16711935
    expect(html).toContain('16711935');
    expect(html).toContain('pointerdown');
  });

  it('every shooter template has a flavorText', () => {
    for (const t of SHOOTER_TEMPLATES) {
      expect(t.defaultTheme.flavorText.length).toBeGreaterThan(5);
    }
  });
});