import { describe, it, expect, vi, afterEach } from 'vitest';
import { generate, listGames, getGame, reportError } from '../lib/api-client';

const origFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = origFetch; });

describe('api-client', () => {
  it('generate POSTs /api/generate and returns JSON', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'a', status: 'ok', attempts: 1, url: '/g/a' }), { status: 200 })
    ) as any;
    const r = await generate({ text: 'x', genre: 'platformer', locale: 'en' });
    expect(r.id).toBe('a');
  });

  it('generate throws on non-2xx', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('bad', { status: 400 })) as any;
    await expect(generate({ text: 'x' })).rejects.toThrow();
  });

  it('listGames GETs /api/games', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ games: [] }), { status: 200 })
    ) as any;
    const r = await listGames();
    expect(r.games).toEqual([]);
  });

  it('getGame GETs /api/games/:id', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: 'a', prompt: 'p', genre: 'platformer', attempts: 1, created_at: 1, url: '/g/a' }), { status: 200 })
    ) as any;
    const r = await getGame('a');
    expect(r.prompt).toBe('p');
  });

  it('reportError POSTs /api/report-error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    ) as any;
    await expect(reportError('a', 'oops')).resolves.toBeUndefined();
  });
});
