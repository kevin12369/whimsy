import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('re-exports runWithRetry', () => {
    expect(typeof api.runWithRetry).toBe('function');
  });

  it('re-exports prompt builders', () => {
    expect(typeof api.buildFixPrompt).toBe('function');
    expect(typeof api.buildRetryPrompt).toBe('function');
  });

  it('re-exports constants', () => {
    expect(api.DEFAULT_MAX_RETRIES).toBe(2);
    expect(api.MAX_TOTAL_ATTEMPTS).toBe(3);
  });
});
