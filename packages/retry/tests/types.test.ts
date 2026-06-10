import { describe, it, expect } from 'vitest';
import type { RetryState, RetryDeps, RetryResult } from '../src/types';

describe('retry types', () => {
  it('RetryState defaults', () => {
    const s: RetryState = { prompt: 'p', attempts: 0, errors: [], html: null, bestHtml: null };
    expect(s.attempts).toBe(0);
  });

  it('RetryDeps has four functions', () => {
    const d: RetryDeps = {
      generateOnce: async () => ({ html: '' }),
      validate: () => ({ ok: true }),
      buildFixPrompt: () => '',
      buildRetryPrompt: (u) => u,
    };
    expect(typeof d.buildFixPrompt).toBe('function');
  });

  it('RetryResult shape', () => {
    const r: RetryResult = { ok: false, html: null, attempts: 2, errors: ['e1', 'e2'], reason: 'r' };
    expect(r.errors).toHaveLength(2);
  });
});
