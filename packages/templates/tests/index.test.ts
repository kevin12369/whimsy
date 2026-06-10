import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('re-exports registry and helpers', () => {
    expect(api.TEMPLATES.length).toBe(15);
    expect(typeof api.getTemplate).toBe('function');
    expect(typeof api.cacheKey).toBe('function');
  });
});
