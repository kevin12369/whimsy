import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateWithLocalLLM } from '../lib/llm-direct';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function mockFetch(body: any, status = 200) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as any);
}

describe('generateWithLocalLLM — Ollama', () => {
  it('POSTs to {baseUrl}/api/generate with model + prompt', async () => {
    mockFetch({ response: '<!DOCTYPE html><html></html>' });
    const r = await generateWithLocalLLM({
      text: 'space mario',
      model: 'ollama',
      localBaseUrl: 'http://localhost:11434',
      localModel: 'llama3.1:8b',
    });
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws when model is not set', async () => {
    await expect(
      generateWithLocalLLM({ text: 'x' }),
    ).rejects.toThrow(/model|baseUrl/i);
  });
});

describe('generateWithLocalLLM — OpenAI compatible', () => {
  it('POSTs to {baseUrl}/chat/completions with model + messages + Authorization header', async () => {
    mockFetch({ choices: [{ message: { content: '<!DOCTYPE html>' } }] });
    const r = await generateWithLocalLLM({
      text: 'space mario',
      model: 'openai-compatible',
      localBaseUrl: 'http://localhost:1234/v1',
      localModel: 'qwen2.5-coder-7b',
      localApiKey: 'lm-studio',
    });
    expect(r.ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:1234/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer lm-studio' }),
      }),
    );
  });

  it('omits Authorization when no apiKey', async () => {
    mockFetch({ choices: [{ message: { content: '<!DOCTYPE html>' } }] });
    await generateWithLocalLLM({
      text: 'x',
      model: 'openai-compatible',
      localBaseUrl: 'http://localhost:1234/v1',
      localModel: 'qwen2.5-coder-7b',
    });
    const headers = (globalThis.fetch as any).mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });
});

describe('generateWithLocalLLM — error handling', () => {
  it('returns ok:false on HTTP 4xx/5xx', async () => {
    mockFetch({ error: 'model not found' }, 404);
    const r = await generateWithLocalLLM({
      text: 'x', model: 'ollama', localBaseUrl: 'http://localhost:11434', localModel: 'nope',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/404/);
  });

  it('returns ok:false on network error (fetch rejects)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch')) as any;
    const r = await generateWithLocalLLM({
      text: 'x', model: 'ollama', localBaseUrl: 'http://localhost:11434', localModel: 'x',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/fetch|network|connect/i);
  });
});

describe('generateWithLocalLLM — base64 stripping', () => {
  it('strips data:image/png;base64,... URIs from response (OAI)', async () => {
    const html = `\`\`\`html
<!DOCTYPE html><html><body>
<script>this.load.image('c', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlwSFlzAAALEgAACxIB0t1+/AAAADUlEQVR42mNk+M9PfwAFfAAXD7uHwMAAAAAAElFTkSuQmCC');</script>
</body></html>
\`\`\``;
    mockFetch({ choices: [{ message: { content: html } }] });
    const r = await generateWithLocalLLM({
      text: 'x', model: 'openai-compatible', localBaseUrl: 'http://x:1234/v1', localModel: 'm',
    });
    expect(r.ok).toBe(true);
    expect(r.html).not.toContain('data:image');
    expect(r.html).toContain("<!DOCTYPE html>");
    // The argument slot stays (just data URI gone) so JS still parses:
    expect(r.html).toMatch(/this\.load\.image\('c',\s*''\)/);
  });
});
