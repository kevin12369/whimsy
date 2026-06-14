import { describe, it, expect } from 'vitest';
import { SAMPLE_PROMPTS, getSampleGame } from '../data/sample-prompts';

describe('sample-prompts', () => {
  it('exposes at least 3 samples', () => {
    expect(SAMPLE_PROMPTS.length).toBeGreaterThanOrEqual(3);
  });

  it('every sample has a unique id', () => {
    const ids = SAMPLE_PROMPTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every sample references a real template', () => {
    for (const s of SAMPLE_PROMPTS) {
      const game = getSampleGame(s.id);
      expect(game).not.toBeNull();
      expect(game!.templateId).toBe(s.templateId);
    }
  });

  it('every sample game renders non-empty HTML containing <canvas or new Phaser.Game', () => {
    for (const s of SAMPLE_PROMPTS) {
      const game = getSampleGame(s.id);
      expect(game).not.toBeNull();
      expect(game!.html.length).toBeGreaterThan(200);
      expect(game!.html).toMatch(/<canvas|Phaser\.Game/);
    }
  });

  it('getSampleGame returns null for unknown id', () => {
    expect(getSampleGame('nope')).toBeNull();
  });
});