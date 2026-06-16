import { describe, it, expect } from 'vitest';
import { sideScrollerComet, PLATFORMER_TEMPLATES } from '../src/platformer';
import { defaultConfig } from '../src/game-config';

const theme = {
  primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid', flavorText: '',
};
const cfg = defaultConfig();

describe('sideScrollerComet', () => {
  it('exists with howToPlay', () => {
    expect(sideScrollerComet.id).toBe('sideScrollerComet');
    expect(sideScrollerComet.howToPlay).toContain('←');
  });

  it('declares consumed config fields', () => {
    expect(sideScrollerComet.consumes).toEqual(
      expect.arrayContaining(['playerSpeed', 'jumpVelocity', 'gravity', 'enemyCount', 'enemySpeed', 'spawnIntervalMs', 'lives']),
    );
  });

  it('declares clamp ranges', () => {
    expect(sideScrollerComet.clamp.playerSpeed).toEqual([50, 400]);
    expect(sideScrollerComet.clamp.jumpVelocity).toEqual([200, 600]);
    expect(sideScrollerComet.clamp.lives).toEqual([1, 9]);
  });

  it('renders complete HTML', () => {
    const html = sideScrollerComet.render(theme, cfg);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('phaser.min.js');
    expect(html).toContain('HOW TO PLAY');
  });

  it('inlines the clamped playerSpeed into Phaser JS', () => {
    const fast = { ...cfg, playerSpeed: 9999 };
    const html = sideScrollerComet.render(theme, fast);
    // playerSpeed is clamped to 400; expect "400" somewhere in the IIFE
    expect(html).toMatch(/PLAYER_SPEED\s*=\s*400/);
  });

  it('uses playerLabel as Phaser body key', () => {
    const html = sideScrollerComet.render({ ...theme, playerLabel: 'ship' }, cfg);
    expect(html).toContain("'ship'");
  });

  it('PLATFORMER_TEMPLATES contains only sideScrollerComet', () => {
    expect(PLATFORMER_TEMPLATES).toHaveLength(1);
    expect(PLATFORMER_TEMPLATES[0]!.id).toBe('sideScrollerComet');
  });
});
