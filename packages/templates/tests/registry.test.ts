import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplate, getAllTemplates } from '../src/registry';

describe('registry', () => {
  it('TEMPLATES contains 5 entries (1 platformer + 2 shooter + 2 puzzle)', () => {
    expect(TEMPLATES.length).toBe(5);
  });

  it('getAllTemplates groups by genre', () => {
    const all = getAllTemplates();
    expect(all.platformer).toHaveLength(1);
    expect(all.shooter).toHaveLength(2);
    expect(all.puzzle).toHaveLength(2);
  });

  it('getTemplate returns sideScrollerComet by id', () => {
    const t = getTemplate('sideScrollerComet');
    expect(t).toBeDefined();
    expect(t!.id).toBe('sideScrollerComet');
  });

  it('getTemplate returns twinStickBattler by id', () => {
    expect(getTemplate('twinStickBattler')!.genre).toBe('shooter');
  });

  it('getTemplate returns undefined for unknown id', () => {
    expect(getTemplate('nope')).toBeUndefined();
  });

  it('every template has a howToPlay field', () => {
    for (const t of TEMPLATES) {
      expect(t.howToPlay).toBeTruthy();
      expect(t.howToPlay.length).toBeGreaterThan(5);
    }
  });
});
