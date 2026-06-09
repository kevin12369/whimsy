import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('re-exports buildPrompt', () => {
    expect(typeof api.buildPrompt).toBe('function');
  });

  it('re-exports getGenreSystemPrompt', () => {
    expect(typeof api.getGenreSystemPrompt).toBe('function');
  });

  it('re-exports wrapUserPrompt', () => {
    expect(typeof api.wrapUserPrompt).toBe('function');
  });
});
