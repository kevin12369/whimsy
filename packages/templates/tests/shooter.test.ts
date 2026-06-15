import { describe, it, expect } from 'vitest';
import { verticalShmup, twinStickBattler, SHOOTER_TEMPLATES } from '../src/shooter';
import { LEVEL_DATA, BOSS_DATA } from '../src/level-data';

const defaultTheme = {
  primary: '#ff6b3a', secondary: '#ffffff', playerLabel: 'ship', enemyLabel: 'alien', flavorText: '',
};

describe('verticalShmup', () => {
  it('howToPlay mentions SPACE shoot', () => {
    expect(verticalShmup.howToPlay).toContain('SPACE');
  });
  it('renders complete HTML with injected levels', () => {
    const html = verticalShmup.render(defaultTheme);
    expect(html).toContain('phaser.min.js');
    expect(html).toContain('HOW TO PLAY');
    expect(html).toContain(JSON.stringify(LEVEL_DATA.verticalShmup[0]).slice(0, 15));
  });
  it('injects 3-phase boss', () => {
    const html = verticalShmup.render(defaultTheme);
    expect(html).toContain('phases');
    expect(html).toContain('3');
  });
});

describe('twinStickBattler', () => {
  it('howToPlay mentions mouse + click', () => {
    expect(twinStickBattler.howToPlay).toContain('mouse');
  });
  it('renders complete HTML', () => {
    const html = twinStickBattler.render(defaultTheme);
    expect(html).toContain('WASD');
    expect(html).toContain(JSON.stringify(LEVEL_DATA.twinStickBattler[0]).slice(0, 15));
  });
  it('injects spiral boss with 800ms fire rate', () => {
    const html = twinStickBattler.render(defaultTheme);
    expect(html).toContain('spiral');
    expect(html).toContain('800');
  });
});

describe('SHOOTER_TEMPLATES', () => {
  it('has 2 entries (verticalShmup + twinStickBattler)', () => {
    expect(SHOOTER_TEMPLATES).toHaveLength(2);
    const ids = SHOOTER_TEMPLATES.map(t => t.id);
    expect(ids).toContain('verticalShmup');
    expect(ids).toContain('twinStickBattler');
  });
});
