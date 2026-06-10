import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost as generatePost } from '../functions/api/generate';
import { onRequestGet as gamesList } from '../functions/api/games';
import { onRequestGet as gameById } from '../functions/api/games/[id]';
import { onRequestPost as reportErrorPost } from '../functions/api/report-error';
import { onRequestGet as healthGet } from '../functions/api/health';
import { onRequestGet as gById } from '../functions/g/[id]';

const origFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = origFetch; });

function ctx(req: Request, env: Record<string, string> = {}, params: Record<string, string> = {}) {
  return { request: req, env, params, waitUntil: () => {}, passThroughOnException: () => {}, next: async () => new Response(), data: undefined };
}

function mockFetchResponse(status: number, body: string, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: new Headers(headers) });
}

type Captured = { url: string; init: RequestInit };
function mockFetch(capture: Captured | null, status: number, body: string, headers: Record<string, string> = {}) {
  globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL | Request, init?: RequestInit) => {
    if (capture) { capture.url = String(url); capture.init = (init ?? {}) as RequestInit; }
    return mockFetchResponse(status, body, headers);
  }) as unknown as typeof fetch;
}

describe('Pages Functions proxies', () => {
  it('generate proxy POSTs to API_BASE/api/generate and returns the body', async () => {
    const captured: Captured = { url: '', init: {} as RequestInit };
    mockFetch(captured, 200, '{"id":"a","status":"ok","attempts":1,"url":"/g/a"}', { 'content-type': 'application/json' });
    const req = new Request('https://example.com/api/generate', { method: 'POST', body: JSON.stringify({ text: 'x' }) });
    const res = await generatePost(ctx(req, { API_BASE: 'http://worker.local' }));
    expect(captured.url).toBe('http://worker.local/api/generate');
    expect(captured.init.method).toBe('POST');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'a', status: 'ok', attempts: 1, url: '/g/a' });
  });

  it('games list proxy GETs to API_BASE/api/games with query string', async () => {
    const captured: Captured = { url: '', init: {} as RequestInit };
    mockFetch(captured, 200, '{"games":[]}');
    const req = new Request('https://example.com/api/games?limit=5');
    const res = await gamesList(ctx(req, { API_BASE: 'http://worker.local' }));
    expect(captured.url).toBe('http://worker.local/api/games?limit=5');
    expect(res.status).toBe(200);
  });

  it('games by id proxy GETs to API_BASE/api/games/:id', async () => {
    const captured: Captured = { url: '', init: {} as RequestInit };
    mockFetch(captured, 200, '{"id":"abc"}');
    const req = new Request('https://example.com/api/games/abc');
    const res = await gameById(ctx(req, { API_BASE: 'http://worker.local' }, { id: 'abc' }));
    expect(captured.url).toBe('http://worker.local/api/games/abc');
    expect(res.status).toBe(200);
  });

  it('report-error proxy POSTs body to API_BASE/api/report-error', async () => {
    const captured: Captured = { url: '', init: {} as RequestInit };
    mockFetch(captured, 200, '{"ok":true}');
    const req = new Request('https://example.com/api/report-error', { method: 'POST', body: JSON.stringify({ id: 'a', error: 'oops' }) });
    const res = await reportErrorPost(ctx(req, { API_BASE: 'http://worker.local' }));
    expect(captured.url).toBe('http://worker.local/api/report-error');
    expect(captured.init.method).toBe('POST');
    expect(res.status).toBe(200);
  });

  it('health proxy GETs to API_BASE/api/health', async () => {
    const captured: Captured = { url: '', init: {} as RequestInit };
    mockFetch(captured, 200, '{"ok":true}');
    const req = new Request('https://example.com/api/health');
    const res = await healthGet(ctx(req, { API_BASE: 'http://worker.local' }));
    expect(captured.url).toBe('http://worker.local/api/health');
    expect(res.status).toBe(200);
  });

  it('g/:id proxy fetches from API_BASE/g/:id and passes through content-type', async () => {
    const captured: Captured = { url: '', init: {} as RequestInit };
    mockFetch(captured, 200, '<html></html>', { 'content-type': 'text/html; charset=utf-8' });
    const req = new Request('https://example.com/g/abc');
    const res = await gById(ctx(req, { API_BASE: 'http://worker.local' }, { id: 'abc' }));
    expect(captured.url).toBe('http://worker.local/g/abc');
    expect(res.headers.get('content-type')).toContain('text/html');
  });
});
