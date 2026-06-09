import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../src/parser';

describe('buildPrompt', () => {
  it('returns system, user, expectedSizeHint', () => {
    const out = buildPrompt({ text: 'space mario', genre: 'platformer', locale: 'en' });
    expect(out.system).toMatch(/Phaser/);
    expect(out.user).toContain('space mario');
    expect(out.expectedSizeHint).toBeGreaterThan(0);
  });

  it('auto genre still produces a valid system prompt', () => {
    const out = buildPrompt({ text: 'x', genre: 'auto', locale: 'en' });
    expect(out.system).toMatch(/genre/i);
  });

  it('system prompt forbids markdown fences and external assets', () => {
    const out = buildPrompt({ text: 'x', genre: 'platformer', locale: 'en' });
    expect(out.system).toMatch(/no markdown/i);
    expect(out.system).toMatch(/no external assets/i);
  });

  it('system prompt pins Phaser CDN version', () => {
    const out = buildPrompt({ text: 'x', genre: 'platformer', locale: 'en' });
    expect(out.system).toContain('cdn.jsdelivr.net');
    expect(out.system).toContain('phaser@3.70');
  });

  it('user prompt length is bounded by truncation', () => {
    const longText = 'a'.repeat(2000);
    const out = buildPrompt({ text: longText, genre: 'platformer', locale: 'en' });
    expect(out.user.length).toBeLessThan(3000);
  });

  it('size hint is approximately 50 KB for a platformer', () => {
    const out = buildPrompt({ text: 'x', genre: 'platformer', locale: 'en' });
    expect(out.expectedSizeHint).toBeGreaterThan(20_000);
    expect(out.expectedSizeHint).toBeLessThan(100_000);
  });
});
