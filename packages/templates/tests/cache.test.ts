import { describe, it, expect } from 'vitest';
import { cacheKey, normalizeTheme } from '../src/cache';

describe('cache helpers', () => {
  it('cacheKey is stable for same genre + theme', () => {
    const a = cacheKey('platformer', { primary: '#ff0000', playerLabel: 'comet' });
    const b = cacheKey('platformer', { primary: '#ff0000', playerLabel: 'comet' });
    expect(a).toBe(b);
  });

  it('cacheKey differs on theme change', () => {
    const a = cacheKey('platformer', { primary: '#ff0000', playerLabel: 'comet' });
    const b = cacheKey('platformer', { primary: '#00ff00', playerLabel: 'comet' });
    expect(a).not.toBe(b);
  });

  it('cacheKey differs on genre change', () => {
    const a = cacheKey('platformer', { primary: '#ff0000' });
    const b = cacheKey('shooter', { primary: '#ff0000' });
    expect(a).not.toBe(b);
  });

  it('normalizeTheme lowercases hex and trims', () => {
    const t = normalizeTheme({ primary: '#FF00AA', playerLabel: '  comet  ' });
    expect(t.primary).toBe('#ff00aa');
    expect(t.playerLabel).toBe('comet');
  });
});
