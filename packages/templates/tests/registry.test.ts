import { describe, it, expect } from 'vitest';
import { TEMPLATES, getTemplate, getAllTemplates } from '../src/registry';

describe('registry', () => {
  it('TEMPLATES contains 15 entries (5 per genre)', () => {
    expect(TEMPLATES.length).toBe(15);
  });

  it('getAllTemplates groups by genre', () => {
    const all = getAllTemplates();
    expect(all.platformer.length).toBe(5);
    expect(all.shooter.length).toBe(5);
    expect(all.puzzle.length).toBe(5);
  });

  it('getTemplate returns a template by id', () => {
    const t = getTemplate('platformer-side-scroller-comet');
    expect(t).toBeDefined();
    expect(t!.id).toBe('platformer-side-scroller-comet');
  });

  it('getTemplate returns undefined for unknown id', () => {
    expect(getTemplate('nope')).toBeUndefined();
  });
});