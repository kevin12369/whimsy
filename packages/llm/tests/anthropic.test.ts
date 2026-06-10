import { describe, it, expect, vi, afterEach } from 'vitest';
import { AnthropicProvider } from '../src/providers/anthropic';

describe('AnthropicProvider', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; });

  it('name is anthropic', () => {
    expect(new AnthropicProvider('k').name).toBe('anthropic');
  });

  it('POSTs to /v1/messages and parses content[0].text', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        content: [{ type: 'text', text: '<!DOCTYPE html>x</html>' }],
        usage: { input_tokens: 7, output_tokens: 50 },
      }), { status: 200 })
    ) as unknown as typeof fetch;

    const r = await new AnthropicProvider('k').generate({ system: 's', user: 'u' });
    expect(r.text).toContain('<!DOCTYPE');
    expect(r.model).toBe('claude-sonnet-4');
    expect(r.inputTokens).toBe(7);
    expect(r.outputTokens).toBe(50);
  });

  it('uses x-api-key and anthropic-version headers', async () => {
    const spy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [{ type: 'text', text: 'x' }] }), { status: 200 })
    );
    globalThis.fetch = spy as unknown as typeof fetch;
    await new AnthropicProvider('mykey').generate({ system: 's', user: 'u' });
    const init = spy.mock.calls[0]?.[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['x-api-key']).toBe('mykey');
    expect(headers['anthropic-version']).toBe('2023-06-01');
  });
});
