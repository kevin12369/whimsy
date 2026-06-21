import { describe, it, expect } from 'vitest';
import { uuid } from '../../src/utils/uuid';
it('generates unique ids', () => {
  const a = uuid();
  const b = uuid();
  expect(a).not.toBe(b);
  expect(a).toMatch(/^[0-9a-f-]{36}$/);
});
