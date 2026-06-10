import { describe, it, expect, vi, afterEach } from 'vitest';
import { OllamaProvider } from '../src/providers/ollama';

describe('OllamaProvider', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetch(body: any, status = 200) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
      json: async () => body,
    } as any);
  }

  it('POSTs to /api/generate with model + prompt + system + stream:false', async () => {
    mockFetch({ response: '<!DOCTYPE html><html><body>hi</body></html>' });
    const p = new OllamaProvider('http://localhost:11434', 'llama3.1:8b');
    await p.generate({ system: 'sys', user: 'usr' });
    const calls = (globalThis.fetch as any).mock.calls;
    expect(calls[0][0]).toBe('http://localhost:11434/api/generate');
    const opts = calls[0][1];
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body.model).toBe('llama3.1:8b');
    expect(body.prompt).toBe('sys\n\nusr');
    expect(body.stream).toBe(false);
    expect(body.options.temperature).toBe(0.4);
  });

  it('returns text from response field', async () => {
    mockFetch({ response: '<!DOCTYPE html><html><body>x</body></html>' });
    const p = new OllamaProvider('http://localhost:11434', 'llama3.1:8b');
    const r = await p.generate({ system: 's', user: 'u' });
    expect(r.text).toContain('<!DOCTYPE html>');
    expect(r.model).toBe('ollama');
  });

  it('counts tokens from prompt_eval_count + eval_count', async () => {
    mockFetch({
      response: '<html></html>',
      prompt_eval_count: 12,
      eval_count: 34,
    });
    const p = new OllamaProvider('http://localhost:11434', 'llama3.1:8b');
    const r = await p.generate({ system: 's', user: 'u' });
    expect(r.inputTokens).toBe(12);
    expect(r.outputTokens).toBe(34);
  });

  it('throws LlmError on non-2xx', async () => {
    mockFetch({ error: 'model not found' }, 404);
    const p = new OllamaProvider('http://localhost:11434', 'nope');
    await expect(p.generate({ system: 's', user: 'u' })).rejects.toThrow(/404/);
  });

  it('throws LlmError on empty response', async () => {
    mockFetch({ response: '' });
    const p = new OllamaProvider('http://localhost:11434', 'llama3.1:8b');
    await expect(p.generate({ system: 's', user: 'u' })).rejects.toThrow(/empty/);
  });
});
