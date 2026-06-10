import { describe, it, expect, vi, afterEach } from 'vitest';
import { DeepSeekProvider } from '../src/providers/deepseek';

describe('DeepSeekProvider', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('name is deepseek', () => {
    const p = new DeepSeekProvider('key');
    expect(p.name).toBe('deepseek');
  });

  it('posts to /v1/chat/completions and parses content', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: '<!DOCTYPE html>x</html>' } }],
        usage: { prompt_tokens: 5, completion_tokens: 100 },
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    ) as unknown as typeof fetch;

    const p = new DeepSeekProvider('k');
    const r = await p.generate({ system: 's', user: 'u' });
    expect(r.text).toContain('<!DOCTYPE html>');
    expect(r.model).toBe('deepseek-coder-v2');
    expect(r.outputTokens).toBe(100);
  });

  it('throws LlmError on 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('server error', { status: 500 })
    ) as unknown as typeof fetch;
    const p = new DeepSeekProvider('k');
    await expect(p.generate({ system: 's', user: 'u' })).rejects.toThrow(/deepseek/);
  });
});
