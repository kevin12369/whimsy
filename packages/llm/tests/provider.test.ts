import { describe, it, expect } from 'vitest';
import type { Provider } from '../src/provider';

describe('Provider interface (structural)', () => {
  it('a stub Provider matches the shape', () => {
    const stub: Provider = {
      name: 'stub',
      async generate() { return { text: 'ok', model: 'workers-ai-llama' }; },
    };
    expect(stub.name).toBe('stub');
  });
});
