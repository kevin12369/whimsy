import { describe, it, expect } from 'vitest';
import { insertGameHistory, listRecent, getGameById } from '../src/persist/d1';

function makeFakeD1() {
  const rows: any[] = [];
  const stmt = (sql: string) => ({
    bind(...args: any[]) {
      return {
        async run() { if (sql.startsWith('INSERT')) rows.push(Object.fromEntries(args.map((a,i)=>['p'+i,a]))); return { success: true }; },
        async all() { return { results: rows.slice(-20) }; },
        async first() { return rows[rows.length-1] ?? null; },
      };
    },
  });
  return { prepare: (sql: string) => stmt(sql), _rows: rows } as any;
}

describe('d1 helpers', () => {
  it('insertGameHistory inserts a row', async () => {
    const d1 = makeFakeD1();
    await insertGameHistory(d1, {
      id: 'a', prompt: 'p', genre: 'platformer', llm_model: 'workers-ai-llama',
      attempts: 1, final_status: 'ok', r2_key: 'games/a.html', error: null,
      byte_size: 1024, created_at: Date.now(),
    });
    expect(d1._rows.length).toBe(1);
  });

  it('listRecent returns the slice', async () => {
    const d1 = makeFakeD1();
    for (let i = 0; i < 25; i++) {
      await insertGameHistory(d1, {
        id: 'id'+i, prompt: 'p', genre: 'platformer', llm_model: 'm',
        attempts: 1, final_status: 'ok', r2_key: null, error: null,
        byte_size: 1, created_at: i,
      });
    }
    const list = await listRecent(d1, 20);
    expect(list.length).toBe(20);
  });

  it('getGameById returns null when missing', async () => {
    const d1 = makeFakeD1();
    const r = await getGameById(d1, 'nope');
    expect(r).toBeNull();
  });
});
