import { describe, it, expect } from 'vitest';
import type { Env, GenerateRequestBody, GenerateResponseBody } from '../src/types';

describe('Env types', () => {
  it('Env shape compiles', () => {
    const e = {} as Env;
    expect(typeof e).toBe('object');
  });

  it('GenerateRequestBody default genre is auto', () => {
    const r: GenerateRequestBody = { text: 'x' };
    expect(r.genre).toBeUndefined();
  });

  it('GenerateResponseBody status ok', () => {
    const r: GenerateResponseBody = { id: 'a', status: 'ok', attempts: 1, url: '/g/a' };
    expect(r.status).toBe('ok');
  });
});
