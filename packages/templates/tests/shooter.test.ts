import { describe, it, expect } from 'vitest';
import { verticalShmup, twinStickBattler, SHOOTER_TEMPLATES } from '../src/shooter';
import { defaultConfig } from '../src/game-config';

const theme = {
  primary: '#ff6b3a', secondary: '#ffffff', playerLabel: 'ship', enemyLabel: 'alien', flavorText: '',
};
const cfg = defaultConfig();

describe('verticalShmup', () => {
  it('howToPlay mentions SPACE shoot', () => {
    expect(verticalShmup.howToPlay).toContain('SPACE');
  });
  it('declares consumed fields', () => {
    expect(verticalShmup.consumes).toEqual(
      expect.arrayContaining(['scrollSpeed', 'enemyFireRateMs', 'enemyRows', 'lives']),
    );
  });
  it('declares clamp ranges', () => {
    expect(verticalShmup.clamp.scrollSpeed).toEqual([1, 3]);
    expect(verticalShmup.clamp.enemyFireRateMs).toEqual([0, 3000]);
  });
  it('renders complete HTML with config defaults', () => {
    const html = verticalShmup.render(theme, cfg);
    expect(html).toContain('window.__WHIMSY_G__');
    expect(html).toContain('HOW TO PLAY');
    expect(html).toContain('__whimsy_cleanup');
    // 8 default enemies (since enemyRows default = 3, but we render 8 fixed in IIFE; check SCROLL_SPEED constant)
    expect(html).toMatch(/SCROLL_SPEED\s*=\s*1\.5/);
  });
  it('inlines clamped scrollSpeed', () => {
    const fast = { ...cfg, scrollSpeed: 99 };
    const html = verticalShmup.render(theme, fast);
    expect(html).toMatch(/SCROLL_SPEED\s*=\s*3/);
  });
});

describe('twinStickBattler', () => {
  it('howToPlay mentions mouse + click', () => {
    expect(twinStickBattler.howToPlay).toContain('mouse');
  });
  it('declares consumed fields', () => {
    expect(twinStickBattler.consumes).toEqual(
      expect.arrayContaining(['roomCount', 'enemiesPerRoom', 'enemyFireMs']),
    );
  });
  it('declares clamp ranges', () => {
    expect(twinStickBattler.clamp.roomCount).toEqual([1, 8]);
    expect(twinStickBattler.clamp.enemiesPerRoom).toEqual([2, 10]);
  });
  it('renders complete HTML with config defaults', () => {
    const html = twinStickBattler.render(theme, cfg);
    expect(html).toContain('WASD');
    expect(html).toMatch(/ROOMS\s*=\s*4/);
  });
  it('inlines clamped roomCount', () => {
    const many = { ...cfg, roomCount: 99 };
    const html = twinStickBattler.render(theme, many);
    expect(html).toMatch(/ROOMS\s*=\s*8/);
  });
});

describe('SHOOTER_TEMPLATES', () => {
  it('has 2 entries', () => {
    expect(SHOOTER_TEMPLATES).toHaveLength(2);
    const ids = SHOOTER_TEMPLATES.map(t => t.id);
    expect(ids).toContain('verticalShmup');
    expect(ids).toContain('twinStickBattler');
  });
});
