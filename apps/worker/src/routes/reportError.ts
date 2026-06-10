import { Hono } from 'hono';
import type { Env } from '../types';
import { updateGameError } from '../persist/d1';

export const reportError = new Hono<{ Bindings: Env }>();

reportError.post('/api/report-error', async (c) => {
  const body = await c.req.json() as { id: string; error: string };
  if (!body.id || !body.error) return c.json({ error: 'bad request' }, 400);
  await updateGameError(c.env.DB, body.id, body.error);
  return c.json({ ok: true });
});
