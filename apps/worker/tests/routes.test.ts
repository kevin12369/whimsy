import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('hono app', () => {
  it('GET / returns 200 text', async () => {
    const res = await app.request('http://x/', {}, {
      DB: {} as any, GAMES: {} as any, QUOTA: {} as any,
      CF_ACCOUNT_ID: '', CF_API_TOKEN: '', DEEPSEEK_API_KEY: '', GEMINI_API_KEY: '',
      DEFAULT_MODEL: 'workers-ai-llama', CSP_REPORT_ONLY: 'false',
    } as any);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('whimsy-api ok');
  });

  it('GET /api/health returns ok=false when D1 and R2 are missing', async () => {
    const res = await app.request('http://x/api/health', {}, {
      DB: {} as any, GAMES: {} as any, QUOTA: {} as any,
      CF_ACCOUNT_ID: '', CF_API_TOKEN: '', DEEPSEEK_API_KEY: '', GEMINI_API_KEY: '',
      DEFAULT_MODEL: 'workers-ai-llama', CSP_REPORT_ONLY: 'false',
    } as any);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(false);
  });
});
