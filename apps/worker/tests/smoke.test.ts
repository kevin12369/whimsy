import { describe, it, expect } from 'vitest';

describe('worker package', () => {
  it('has migrations folder', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const dir = path.join(process.cwd(), 'migrations');
    expect(fs.existsSync(dir)).toBe(true);
  });
});
