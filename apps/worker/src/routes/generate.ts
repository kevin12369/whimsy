import { Hono } from 'hono';
import type { Env } from '../types';
import { orchestrate } from '../orchestrator';
import { pickProvider } from '@whimsy/llm';
import { putGame } from '../persist/r2';
import { insertGameHistory } from '../persist/d1';
import { preCheck, increment } from '../quota';
import { buildFallbackHtml } from '../fallback';
import { newGameId } from '../ids';

export const generate = new Hono<{ Bindings: Env }>();

generate.post('/api/generate', async (c) => {
  const body = await c.req.json() as any;
  const userId = c.req.header('cf-connecting-ip') ?? 'anon';
  const model = (body.model ?? c.env.DEFAULT_MODEL) as any;

  if ((c.env as any).LLM_KILL_SWITCH === 'true') {
    const text2 = (body.text ?? '').trim();
    if (!text2 || text2.length > 500) return c.json({ error: 'bad request' }, 400);
    const genre2 = (body.genre ?? 'auto') as any;
    const { html, attempts } = buildFallbackHtml(genre2);
    const kid = newGameId();
    await putGame(c.env.GAMES, kid, html);
    await insertGameHistory(c.env.DB, {
      id: kid, prompt: text2, genre: genre2, llm_model: 'fallback',
      attempts, final_status: 'ok', r2_key: `games/${kid}.html`,
      error: null, byte_size: html.length, created_at: Date.now(),
    });
    return c.json({ id: kid, status: 'ok', attempts, url: `/g/${kid}` });
  }

  const quota = await preCheck(c.env.QUOTA, userId, 'self');
  if (!quota.allowed) return c.json({ error: quota.reason }, 429);

  const provider = pickProvider(model, c.env);

  try {
    const result = await orchestrate(body, c.env, {
      provider,
      storeHtml: async (gameId, html) => putGame(c.env.GAMES, gameId, html),
      recordHistory: async (row: any) => insertGameHistory(c.env.DB, row),
      userId, mode: 'self',
    });
    await increment(c.env.QUOTA, userId, {
      workers_ai: model === 'workers-ai-llama' ? 1 : 0,
      deepseek: model === 'deepseek-coder-v2' ? 1 : 0,
      gemini: model === 'gemini-2.0-flash' ? 1 : 0,
      byok: model === 'claude-sonnet-4' ? 1 : 0,
      generations: 1, retries: result.attempts - 1,
    });
    return c.json(result);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});
