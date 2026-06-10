import { Hono } from 'hono';
import type { Env } from '../types';
import { getGame } from '../persist/r2';
import { cspHeader } from '../csp';

export const g = new Hono<{ Bindings: Env }>();

g.get('/g/:id', async (c) => {
  const id = c.req.param('id');
  const html = await getGame(c.env.GAMES, id);
  if (!html) return c.text('not found', 404);
  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': cspHeader(),
      'cache-control': 'public, max-age=3600',
    },
  });
});
