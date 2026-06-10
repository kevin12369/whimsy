import { describe, it, expect } from 'vitest';
import { pickProvider } from '../src/router';
import type { LlmEnv } from '../src/router';

describe('router', () => {
  const env: LlmEnv = {
    CF_ACCOUNT_ID: 'acc',
    CF_API_TOKEN: 'cf-tok',
    DEEPSEEK_API_KEY: 'ds-k',
    GEMINI_API_KEY: 'gm-k',
  };

  it('returns WorkersAiProvider for workers-ai-llama', () => {
    const p = pickProvider('workers-ai-llama', env);
    expect(p.name).toBe('workers-ai');
  });

  it('returns DeepSeek for deepseek-coder-v2', () => {
    const p = pickProvider('deepseek-coder-v2', env);
    expect(p.name).toBe('deepseek');
  });

  it('returns Gemini for gemini-2.0-flash', () => {
    const p = pickProvider('gemini-2.0-flash', env);
    expect(p.name).toBe('gemini');
  });

  it('returns Anthropic for claude-sonnet-4 only when byok key is set', () => {
    expect(() => pickProvider('claude-sonnet-4', env)).toThrow(/api key/i);
    const p = pickProvider('claude-sonnet-4', { ...env, USER_ANTHROPIC_KEY: 'u-k' });
    expect(p.name).toBe('anthropic');
  });
});
