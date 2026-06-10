import { describe, it, expect } from 'vitest';
import { preCheck, increment } from '../src/quota';

function makeFakeKV() {
  const store = new Map<string, string>();
  return {
    async get(k: string) { return store.get(k) ?? null; },
    async put(k: string, v: string) { store.set(k, v); },
  } as any;
}

describe('quota', () => {
  it('allows first request in self mode', async () => {
    const kv = makeFakeKV();
    const r = await preCheck(kv, 'ip-1', 'self');
    expect(r.allowed).toBe(true);
  });

  it('blocks after 10000 workers_ai + 200 deepseek in self mode', async () => {
    const kv = makeFakeKV();
    await increment(kv, 'ip-1', { workers_ai: 10000, deepseek: 200, gemini: 0, byok: 0, generations: 50, retries: 0 });
    const r = await preCheck(kv, 'ip-1', 'self');
    expect(r.allowed).toBe(false);
  });

  it('increment increases counter', async () => {
    const kv = makeFakeKV();
    await increment(kv, 'ip-1', { workers_ai: 1, deepseek: 0, gemini: 0, byok: 0, generations: 0, retries: 0 });
    const key = `usage:ip-1:${new Date().toISOString().slice(0, 10)}`;
    const got = JSON.parse((await kv.get(key))!);
    expect(got.workers_ai).toBe(1);
  });
});
