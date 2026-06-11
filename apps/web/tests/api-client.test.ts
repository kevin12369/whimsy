import { describe, it, expect } from 'vitest';
import { reportError } from '../lib/api-client';

describe('api-client stub', () => {
  it('reportError is a no-op', async () => {
    // Should not throw
    await reportError({ id: 'test', error: 'some error' });
    expect(true).toBe(true);
  });
});
