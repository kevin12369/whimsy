import { describe, it, expect, vi, afterEach } from 'vitest';
import { WorkersAiProvider } from '../src/providers/workers-ai';

describe('WorkersAiProvider', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => { globalThis.fetch = originalFetch; });

  it('name is workers-ai', () => {
    const p = new WorkersAiProvider({ accountId: 'a', apiKey: 'k' });
    expect(p.name).toBe('workers-ai');
  });

  it('calls CF account API and returns text', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ result: { response: '<!DOCTYPE html>...' } }), {
        status: 200, headers: { 'content-type': 'application/json' },
      })
    ) as unknown as typeof fetch;

    const p = new WorkersAiProvider({ accountId: 'acc', apiKey: 'tok' });
    const r = await p.generate({ system: 's', user: 'u' });
    expect(r.text).toContain('<!DOCTYPE html>');
    expect(r.model).toBe('workers-ai-llama');
  });

  it('throws LlmError on non-2xx', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response('rate limit', { status: 429 })
    ) as unknown as typeof fetch;

    const p = new WorkersAiProvider({ accountId: 'a', apiKey: 'k' });
    await expect(p.generate({ system: 's', user: 'u' })).rejects.toThrow(/workers-ai/);
  });
});
