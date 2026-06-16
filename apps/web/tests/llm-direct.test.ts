import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateGameConfig } from '../lib/llm-direct';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function mockFetch(body: any, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as any);
}

describe('generateGameConfig — Ollama', () => {
  it('POSTs to {baseUrl}/api/generate', async () => {
    mockFetch({ response: '{"type":"sideScroller","playerSpeed":220}' });
    const r = await generateGameConfig({
      text: 'space mario',
      model: 'ollama',
      localBaseUrl: 'http://localhost:11434',
      localModel: 'llama3.1:8b',
    });
    expect(r.ok).toBe(true);
    expect(r.config?.type).toBe('sideScroller');
    expect(r.config?.playerSpeed).toBe(220);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('generateGameConfig — OpenAI compatible', () => {
  it('POSTs to {baseUrl}/chat/completions with messages + Authorization header', async () => {
    mockFetch({ choices: [{ message: { content: '{"type":"tileMatch","moves":20}' } }] });
    const r = await generateGameConfig({
      text: 'space mario',
      model: 'openai-compatible',
      localBaseUrl: 'http://localhost:1234/v1',
      localModel: 'qwen2.5-coder-7b',
      localApiKey: 'lm-studio',
    });
    expect(r.ok).toBe(true);
    expect(r.config?.type).toBe('tileMatch');
    expect(r.config?.moves).toBe(20);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:1234/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer lm-studio' }),
      }),
    );
  });
});

describe('generateGameConfig — fallback on bad output', () => {
  it('falls back to random valid type when type is missing', async () => {
    mockFetch({ choices: [{ message: { content: '{"playerSpeed":9999}' } }] });
    const r = await generateGameConfig({
      text: 'x', model: 'openai-compatible', localBaseUrl: 'http://x:1234/v1', localModel: 'm',
    });
    expect(r.ok).toBe(true);
    expect(['sideScroller', 'verticalShmup', 'twinStickBattler', 'tileMatch', 'sokoban']).toContain(r.config?.type);
  });

  it('clamps playerSpeed=9999 to 400', async () => {
    mockFetch({ choices: [{ message: { content: '{"type":"sideScroller","playerSpeed":9999}' } }] });
    const r = await generateGameConfig({
      text: 'x', model: 'openai-compatible', localBaseUrl: 'http://x:1234/v1', localModel: 'm',
    });
    expect(r.config?.playerSpeed).toBe(400);
  });

  it('returns ok:false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as any;
    const r = await generateGameConfig({
      text: 'x', model: 'ollama', localBaseUrl: 'http://x:11434', localModel: 'm',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/fetch|network|connect/i);
  });

  it('returns ok:false on HTTP 4xx/5xx', async () => {
    mockFetch({ error: 'model not found' }, 404);
    const r = await generateGameConfig({
      text: 'x', model: 'ollama', localBaseUrl: 'http://x:11434', localModel: 'nope',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/404/);
  });
});
