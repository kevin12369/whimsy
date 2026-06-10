import { describe, it, expect } from 'vitest';
import { putGame, getGame, gameKey } from '../src/persist/r2';

function makeFakeR2() {
  const store = new Map<string, string>();
  return {
    async put(key: string, body: string) { store.set(key, body); },
    async get(key: string) {
      const v = store.get(key);
      if (v === undefined) return null;
      return { text: async () => v };
    },
  } as any;
}

describe('r2 helpers', () => {
  it('gameKey produces games/<id>.html', () => {
    expect(gameKey('abc')).toBe('games/abc.html');
  });

  it('putGame then getGame round-trips', async () => {
    const r2 = makeFakeR2();
    await putGame(r2, 'abc', '<!DOCTYPE html>...</html>');
    const got = await getGame(r2, 'abc');
    expect(got).toBe('<!DOCTYPE html>...</html>');
  });

  it('getGame returns null for missing key', async () => {
    const r2 = makeFakeR2();
    expect(await getGame(r2, 'missing')).toBeNull();
  });
});
