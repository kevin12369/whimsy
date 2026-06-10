import { describe, it, expect, vi } from 'vitest';
import app from '../src/index';

function makeBindings(over: any = {}) {
  return {
    DB: { prepare: () => ({ bind: () => ({ run: async () => ({}), first: async () => null, all: async () => ({ results: [] }) }) }) },
    GAMES: { put: vi.fn(), get: vi.fn(), head: vi.fn() },
    QUOTA: { get: vi.fn().mockResolvedValue(null), put: vi.fn() },
    CF_ACCOUNT_ID: 'a', CF_API_TOKEN: 't', DEEPSEEK_API_KEY: 'd', GEMINI_API_KEY: 'g',
    DEFAULT_MODEL: 'workers-ai-llama', CSP_REPORT_ONLY: 'false',
    ...over,
  };
}

describe('GET /g/:id', () => {
  it('returns 404 when R2 miss', async () => {
    const res = await app.request('http://x/g/missing', {}, makeBindings() as any);
    expect(res.status).toBe(404);
  });

  it('returns text/html with CSP when present', async () => {
    const GAMES = { put: vi.fn(), get: vi.fn().mockResolvedValue({ text: async () => '<!DOCTYPE html>ok</html>' }), head: vi.fn() };
    const res = await app.request('http://x/g/abc', {}, makeBindings({ GAMES }) as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'");
  });
});
