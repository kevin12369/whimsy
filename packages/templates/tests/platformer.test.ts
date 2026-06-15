import { describe, it, expect } from 'vitest';
import { sideScrollerComet, PLATFORMER_TEMPLATES } from '../src/platformer';
import { LEVEL_DATA, BOSS_DATA } from '../src/level-data';

const defaultTheme = {
  primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid', flavorText: '',
};

describe('sideScrollerComet', () => {
  it('exists with howToPlay', () => {
    expect(sideScrollerComet.id).toBe('sideScrollerComet');
    expect(sideScrollerComet.genre).toBe('platformer');
    expect(sideScrollerComet.howToPlay).toContain('←');
  });

  it('renders complete HTML', () => {
    const html = sideScrollerComet.render(defaultTheme);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('phaser.min.js');
    expect(html).toContain('HOW TO PLAY');
  });

  it('injects all 3 level data as JSON', () => {
    const html = sideScrollerComet.render(defaultTheme);
    expect(html).toContain(JSON.stringify(LEVEL_DATA.sideScrollerComet[0]).slice(0, 20));
    expect(html).toContain(JSON.stringify(LEVEL_DATA.sideScrollerComet[2]).slice(0, 20));
  });

  it('injects boss data', () => {
    const html = sideScrollerComet.render(defaultTheme);
    expect(html).toContain('charge');
    expect(html).toContain(BOSS_DATA.sideScrollerComet.hp.toString());
  });

  it('PLATFORMER_TEMPLATES contains only sideScrollerComet', () => {
    expect(PLATFORMER_TEMPLATES).toHaveLength(1);
    expect(PLATFORMER_TEMPLATES[0]!.id).toBe('sideScrollerComet');
  });
});
