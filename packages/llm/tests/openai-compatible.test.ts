import { describe, it, expect, vi, afterEach } from 'vitest';
import { OpenAiCompatibleProvider } from '../src/providers/openai-compatible';

describe('OpenAiCompatibleProvider', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  function mockFetch(body: any, status = 200) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status, text: async () => JSON.stringify(body), json: async () => body,
    } as any);
  }

  it('POSTs to /v1/chat/completions with model + messages + Authorization when apiKey set', async () => {
    mockFetch({ choices: [{ message: { content: '<!DOCTYPE html><html></html>' } }] });
    const p = new OpenAiCompatibleProvider('http://localhost:1234/v1', 'qwen2.5-coder-7b', 'lm-studio');
    await p.generate({ system: 'sys', user: 'usr', apiKey: 'lm-studio' });
    const calls = (globalThis.fetch as any).mock.calls;
    expect(calls[0][0]).toBe('http://localhost:1234/v1/chat/completions');
    expect(calls[0][1].method).toBe('POST');
    expect(calls[0][1].headers.Authorization).toBe('Bearer lm-studio');
    const body = JSON.parse(calls[0][1].body);
    expect(body.model).toBe('qwen2.5-coder-7b');
    expect(body.messages).toEqual([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'usr' },
    ]);
    expect(body.temperature).toBe(0.4);
  });

  it('omits Authorization header when no apiKey', async () => {
    mockFetch({ choices: [{ message: { content: '<html></html>' } }] });
    const p = new OpenAiCompatibleProvider('http://localhost:8080/v1', 'llama-cpp');
    await p.generate({ system: 's', user: 'u' });
    const opts = (globalThis.fetch as any).mock.calls[0][1];
    expect(opts.headers.Authorization).toBeUndefined();
  });

  it('returns text from choices[0].message.content', async () => {
    mockFetch({ choices: [{ message: { content: '<!DOCTYPE html>x</html>' } }] });
    const p = new OpenAiCompatibleProvider('http://localhost:1234/v1', 'm');
    const r = await p.generate({ system: 's', user: 'u' });
    expect(r.text).toContain('<!DOCTYPE html>');
    expect(r.model).toBe('openai-compatible');
  });

  it('counts tokens from usage.prompt_tokens + usage.completion_tokens', async () => {
    mockFetch({
      choices: [{ message: { content: '<html></html>' } }],
      usage: { prompt_tokens: 50, completion_tokens: 80 },
    });
    const p = new OpenAiCompatibleProvider('http://localhost:1234/v1', 'm');
    const r = await p.generate({ system: 's', user: 'u' });
    expect(r.inputTokens).toBe(50);
    expect(r.outputTokens).toBe(80);
  });

  it('throws LlmError on non-2xx', async () => {
    mockFetch({ error: { message: 'rate limit' } }, 429);
    const p = new OpenAiCompatibleProvider('http://localhost:1234/v1', 'm');
    await expect(p.generate({ system: 's', user: 'u' })).rejects.toThrow(/429/);
  });

  it('throws LlmError on empty content', async () => {
    mockFetch({ choices: [{ message: { content: '' } }] });
    const p = new OpenAiCompatibleProvider('http://localhost:1234/v1', 'm');
    await expect(p.generate({ system: 's', user: 'u' })).rejects.toThrow(/empty/);
  });
});
