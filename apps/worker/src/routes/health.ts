import { Hono } from 'hono';
import type { Env } from '../types';

export const health = new Hono<{ Bindings: Env }>();

health.get('/api/health', async (c) => {
  let d1 = 'ok';
  let r2 = 'ok';
  try { await c.env.DB.prepare('SELECT 1').first(); } catch { d1 = 'fail'; }
  try { await c.env.GAMES.head('games/__healthcheck__'); } catch { r2 = 'fail'; }
  return c.json({
    ok: d1 === 'ok' && r2 === 'ok',
    model: c.env.DEFAULT_MODEL,
    d1, r2,
  });
});
