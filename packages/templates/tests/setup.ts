import { beforeAll } from 'vitest';

beforeAll(() => {
  if (typeof globalThis.__WHIMSY_G__ === 'undefined') {
    const div = document.createElement('div');
    div.id = 'g';
    document.body.appendChild(div);
    (globalThis as any).__WHIMSY_G__ = div;
  }
});
