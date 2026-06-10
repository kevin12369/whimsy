import type { KVNamespace } from '@cloudflare/workers-types';

export type Mode = 'self' | 'byok' | 'hybrid';

export interface UsageDelta {
  workers_ai: number;
  deepseek: number;
  gemini: number;
  byok: number;
  local?: number;
  generations: number;
  retries: number;
}

export interface QuotaResult { allowed: boolean; reason?: string; }

function todayKey(userId: string): string { return `usage:${userId}:${new Date().toISOString().slice(0,10)}`; }

async function readUsage(kv: KVNamespace, userId: string): Promise<UsageDelta> {
  const raw = await kv.get(todayKey(userId));
  if (!raw) return { workers_ai: 0, deepseek: 0, gemini: 0, byok: 0, local: 0, generations: 0, retries: 0 };
  return JSON.parse(raw) as UsageDelta;
}

export async function preCheck(kv: KVNamespace, userId: string, mode: Mode): Promise<QuotaResult> {
  const u = await readUsage(kv, userId);
  if (mode === 'self' || (mode === 'hybrid')) {
    if (u.workers_ai >= 10000 && u.deepseek >= 200) {
      return { allowed: false, reason: 'Free daily quota exhausted' };
    }
  }
  return { allowed: true };
}

export async function increment(kv: KVNamespace, userId: string, delta: UsageDelta): Promise<void> {
  const cur = await readUsage(kv, userId);
  const next: UsageDelta = {
    workers_ai: cur.workers_ai + delta.workers_ai,
    deepseek: cur.deepseek + delta.deepseek,
    gemini: cur.gemini + delta.gemini,
    byok: cur.byok + delta.byok,
    local: (cur.local ?? 0) + (delta.local ?? 0),
    generations: cur.generations + delta.generations,
    retries: cur.retries + delta.retries,
  };
  await kv.put(todayKey(userId), JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 7 });
}

export async function getUsage(kv: KVNamespace, userId: string): Promise<UsageDelta> {
  return await readUsage(kv, userId);
}
