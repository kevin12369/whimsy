import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('re-exports types and router', () => {
    expect(typeof api.pickProvider).toBe('function');
    expect(typeof api.WorkersAiProvider).toBe('function');
    expect(typeof api.DeepSeekProvider).toBe('function');
    expect(typeof api.GeminiProvider).toBe('function');
    expect(typeof api.AnthropicProvider).toBe('function');
  });

  it('re-exports error classes', () => {
    expect(typeof api.LlmError).toBe('function');
    expect(typeof api.QuotaExceeded).toBe('function');
  });
});
