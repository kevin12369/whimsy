import { Hono } from 'hono';
import type { Env } from '../types';
import { getGameById, listRecent } from '../persist/d1';

export const games = new Hono<{ Bindings: Env }>();

games.get('/api/games', async (c) => {
  const limit = Math.min(Number(c.req.query('limit') ?? '20'), 50);
  const rows = await listRecent(c.env.DB, limit);
  return c.json({ games: rows });
});

games.get('/api/games/:id', async (c) => {
  const id = c.req.param('id');
  const row = await getGameById(c.env.DB, id);
  if (!row) return c.json({ error: 'not found' }, 404);
  return c.json({
    id: row.id, prompt: row.prompt, genre: row.genre,
    attempts: row.attempts, created_at: row.created_at,
    url: `/g/${row.id}`,
  });
});
