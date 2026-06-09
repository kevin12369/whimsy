import { describe, it, expect } from 'vitest';
import type { Genre, Locale, PromptInput, PromptOutput } from '../src/types';

describe('prompt types', () => {
  it('accepts valid Genre values', () => {
    const genres: Genre[] = ['platformer', 'shooter', 'puzzle', 'auto'];
    expect(genres).toHaveLength(4);
  });

  it('accepts valid Locale values', () => {
    const locales: Locale[] = ['en', 'zh'];
    expect(locales).toHaveLength(2);
  });

  it('shapes PromptInput correctly', () => {
    const input: PromptInput = { text: 'space mario', genre: 'platformer', locale: 'en' };
    expect(input.text).toBe('space mario');
  });

  it('shapes PromptOutput correctly', () => {
    const output: PromptOutput = { system: 's', user: 'u', expectedSizeHint: 50000 };
    expect(output.expectedSizeHint).toBe(50000);
  });
});
