import { describe, it, expect, vi, afterEach } from 'vitest';
import { GeminiProvider } from '../src/providers/gemini';

describe('GeminiProvider', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('name is gemini', () => {
    expect(new GeminiProvider('k').name).toBe('gemini');
  });

  it('calls generateContent and parses text', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text: '<!DOCTYPE html>x</html>' }] } }],
      }), { status: 200 })
    ) as unknown as typeof fetch;

    const r = await new GeminiProvider('k').generate({ system: 's', user: 'u' });
    expect(r.text).toContain('<!DOCTYPE');
    expect(r.model).toBe('gemini-2.0-flash');
  });

  it('throws on error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('no', { status: 403 })) as unknown as typeof fetch;
    await expect(new GeminiProvider('k').generate({ system: 's', user: 'u' })).rejects.toThrow(/gemini/);
  });
});
