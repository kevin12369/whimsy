import { describe, it, expect, vi } from 'vitest';
import { orchestrate } from '../src/orchestrator';
import type { Env } from '../src/types';

const OK = '<!DOCTYPE html><html><body><canvas></canvas><script>new Phaser.Game({}); addEventListener("keydown",()=>{});</script></body></html>';

function makeEnv(over: Partial<Env> = {}): Env {
  return {
    DB: {} as any, GAMES: {} as any, QUOTA: {} as any,
    CF_ACCOUNT_ID: 'a', CF_API_TOKEN: 't',
    DEEPSEEK_API_KEY: 'd', GEMINI_API_KEY: 'g',
    DEFAULT_MODEL: 'workers-ai-llama', CSP_REPORT_ONLY: 'false',
    ...over,
  };
}

describe('orchestrate', () => {
  it('returns ok when first attempt passes', async () => {
    const env = makeEnv();
    const r = await orchestrate(
      { text: 'space mario', genre: 'platformer', locale: 'en' },
      env,
      {
        provider: { name: 'p', async generate() { return { text: OK, model: 'workers-ai-llama' }; } },
        storeHtml: vi.fn().mockResolvedValue(undefined),
        recordHistory: vi.fn().mockResolvedValue(undefined),
        userId: 'u-1',
        mode: 'self',
      },
    );
    expect(r.status).toBe('ok');
    expect(r.attempts).toBe(1);
  });

  it('retries when validation fails, up to 2 times', async () => {
    const env = makeEnv();
    let i = 0;
    const r = await orchestrate(
      { text: 'x', genre: 'shooter', locale: 'en' },
      env,
      {
        provider: { name: 'p', async generate() {
          i++;
          return { text: i < 2 ? 'bad' : OK, model: 'workers-ai-llama' };
        } },
        storeHtml: vi.fn().mockResolvedValue(undefined),
        recordHistory: vi.fn().mockResolvedValue(undefined),
        userId: 'u-1', mode: 'self',
      },
    );
    expect(r.status).toBe('ok');
    expect(r.attempts).toBe(2);
  });

  it('returns failed after max attempts', async () => {
    const env = makeEnv();
    const r = await orchestrate(
      { text: 'x', genre: 'platformer', locale: 'en' },
      env,
      {
        provider: { name: 'p', async generate() { return { text: 'always bad', model: 'workers-ai-llama' }; } },
        storeHtml: vi.fn().mockResolvedValue(undefined),
        recordHistory: vi.fn().mockResolvedValue(undefined),
        userId: 'u-1', mode: 'self',
      },
    );
    expect(r.status).toBe('failed');
    expect(r.attempts).toBe(3);
  });

  it('rejects empty text', async () => {
    const env = makeEnv();
    await expect(orchestrate(
      { text: '', genre: 'platformer', locale: 'en' }, env,
      { provider: {} as any, storeHtml: vi.fn(), recordHistory: vi.fn(), userId: 'u', mode: 'self' },
    )).rejects.toThrow(/text/i);
  });

  it('rejects text > 500 chars', async () => {
    const env = makeEnv();
    await expect(orchestrate(
      { text: 'a'.repeat(501), genre: 'platformer', locale: 'en' }, env,
      { provider: {} as any, storeHtml: vi.fn(), recordHistory: vi.fn(), userId: 'u', mode: 'self' },
    )).rejects.toThrow(/500/);
  });
});
