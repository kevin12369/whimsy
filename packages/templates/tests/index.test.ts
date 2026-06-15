import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('re-exports registry and helpers', () => {
    expect(api.TEMPLATES.length).toBe(5);
    expect(typeof api.getTemplate).toBe('function');
    expect(typeof api.cacheKey).toBe('function');
    expect(typeof api.recordEnd).toBe('function');
    expect(typeof api.getHighScore).toBe('function');
    expect(typeof api.clearAll).toBe('function');
    expect(typeof api.renderHud).toBe('function');
  });
});
