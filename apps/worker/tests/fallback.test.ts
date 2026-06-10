import { describe, it, expect } from 'vitest';
import { pickFallbackTemplate, buildFallbackHtml } from '../src/fallback';

describe('fallback template picker', () => {
  it('returns a platformer template for platformer genre', () => {
    const t = pickFallbackTemplate('platformer');
    expect(t.genre).toBe('platformer');
  });

  it('returns a shooter template for shooter', () => {
    const t = pickFallbackTemplate('shooter');
    expect(t.genre).toBe('shooter');
  });

  it('returns a puzzle template for puzzle', () => {
    const t = pickFallbackTemplate('puzzle');
    expect(t.genre).toBe('puzzle');
  });

  it('returns a platformer when genre is auto', () => {
    const t = pickFallbackTemplate('auto');
    expect(t.genre).toBe('platformer');
  });

  it('rendered HTML passes a basic structural check', () => {
    const { html } = buildFallbackHtml('shooter');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('keydown');
    expect(html).toContain('cdn.jsdelivr.net');
  });
});
