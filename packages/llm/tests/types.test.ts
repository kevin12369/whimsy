import { describe, it, expect } from 'vitest';
import { LlmError, QuotaExceeded } from '../src/errors';
import type { GenerateRequest, Model } from '../src/types';

describe('types and errors', () => {
  it('lists 4 model identifiers', () => {
    const models: Model[] = [
      'workers-ai-llama', 'deepseek-coder-v2', 'gemini-2.0-flash', 'claude-sonnet-4',
    ];
    expect(models).toHaveLength(4);
  });

  it('shapes GenerateRequest with defaults', () => {
    const r: GenerateRequest = { system: 's', user: 'u' };
    expect(r.maxTokens).toBeUndefined();
  });

  it('LlmError carries provider and retriable', () => {
    const e = new LlmError('anthropic', 'boom', true);
    expect(e.provider).toBe('anthropic');
    expect(e.retriable).toBe(true);
    expect(e.message).toContain('anthropic');
  });

  it('QuotaExceeded carries scope', () => {
    const e = new QuotaExceeded('self', 'over');
    expect(e.scope).toBe('self');
  });
});
