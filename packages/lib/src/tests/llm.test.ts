import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chat, listLocalModels, isOllamaAvailable } from '../llm';

describe('llm client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('isOllamaAvailable returns true when /api/tags responds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    expect(await isOllamaAvailable()).toBe(true);
  });

  it('isOllamaAvailable returns false on fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));
    expect(await isOllamaAvailable()).toBe(false);
  });

  it('listLocalModels returns name + size', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { name: 'deepseek-coder:6.7b', size: 3_800_000_000 },
          { name: 'qwen2.5-coder:7b', size: 4_700_000_000 },
        ],
      }),
    }));
    const models = await listLocalModels();
    expect(models).toEqual([
      { name: 'deepseek-coder:6.7b', size: 3_800_000_000 },
      { name: 'qwen2.5-coder:7b', size: 4_700_000_000 },
    ]);
  });

  it('chat sends POST to /api/generate and returns response text', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'hello world' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await chat({
      model: 'deepseek-coder:6.7b',
      system: 'You are helpful',
      user: 'Hi',
    });

    expect(result).toBe('hello world');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('deepseek-coder:6.7b'),
      }),
    );
  });
});
