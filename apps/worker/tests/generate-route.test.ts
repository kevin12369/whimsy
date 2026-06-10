import { describe, it, expect, vi } from 'vitest';
import app from '../src/index';

const OK = '<!DOCTYPE html><html><body><canvas></canvas><script>new Phaser.Game({}); addEventListener("keydown",()=>{});</script></body></html>';

function makeBindings(over: any = {}) {
  const kv = { get: vi.fn().mockResolvedValue(null), put: vi.fn().mockResolvedValue(undefined) };
  const r2 = { put: vi.fn().mockResolvedValue(undefined), get: vi.fn().mockResolvedValue(null) };
  const d1 = { prepare: vi.fn().mockReturnValue({ bind: () => ({ run: async () => ({ success: true }), first: async () => null, all: async () => ({ results: [] }) }) }) };
  return { DB: d1, GAMES: r2, QUOTA: kv, CF_ACCOUNT_ID: 'a', CF_API_TOKEN: 't', DEEPSEEK_API_KEY: 'd', GEMINI_API_KEY: 'g', DEFAULT_MODEL: 'workers-ai-llama', CSP_REPORT_ONLY: 'false', ...over };
}

describe('POST /api/generate', () => {
  it('returns 400 on missing text', async () => {
    const res = await app.request('http://x/api/generate', { method: 'POST', body: JSON.stringify({}) }, makeBindings() as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 on text > 500', async () => {
    const res = await app.request('http://x/api/generate', { method: 'POST', body: JSON.stringify({ text: 'a'.repeat(501) }) }, makeBindings() as any);
    expect(res.status).toBe(400);
  });

  it('returns 429 when quota is exhausted', async () => {
    const kv = { get: vi.fn().mockResolvedValue(JSON.stringify({ workers_ai: 10000, deepseek: 200, gemini: 0, byok: 0, generations: 1, retries: 0 })), put: vi.fn() };
    const res = await app.request('http://x/api/generate', { method: 'POST', body: JSON.stringify({ text: 'x' }) }, { ...makeBindings(), QUOTA: kv } as any);
    expect(res.status).toBe(429);
  });

  it('routes ollama model to OllamaProvider when localBaseUrl set', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({ response: `<!DOCTYPE html><html>${OK}</html>`, prompt_eval_count: 1, eval_count: 1 }),
    });
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = fetchMock;
    try {
      const res = await app.request('http://x/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          text: 'x',
          model: 'ollama',
          localBaseUrl: 'http://localhost:11434',
          localModel: 'llama3.1:8b',
        }),
      }, makeBindings() as any);
      expect(res.status).toBe(200);
      expect(fetchMock).toHaveBeenCalled();
      const calledUrl = fetchMock.mock.calls[0][0];
      expect(calledUrl).toBe('http://localhost:11434/api/generate');
    } finally {
      (globalThis as any).fetch = originalFetch;
    }
  });

  it('rejects ollama without localBaseUrl', async () => {
    const res = await app.request('http://x/api/generate', {
      method: 'POST',
      body: JSON.stringify({ text: 'x', model: 'ollama' }),
    }, makeBindings() as any);
    expect(res.status).toBe(400);
    const j = await res.json() as { error?: string };
    expect(String(j.error)).toMatch(/baseUrl/);
  });

  it('rejects localBaseUrl with file:// protocol (SSRF guard)', async () => {
    const res = await app.request('http://x/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        text: 'x',
        model: 'ollama',
        localBaseUrl: 'file:///etc/passwd',
      }),
    }, makeBindings() as any);
    expect(res.status).toBe(400);
  });
});
