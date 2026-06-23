import { describe, it, expect } from 'vitest';
import { SPRITE_KEYS } from '../../src/config/assets';
import { preloadAllAssets, safeAddSprite } from '../../src/core/assetLoader';

describe('preloadAllAssets', () => {
  it('is callable', () => {
    expect(typeof preloadAllAssets).toBe('function');
  });
});

describe('safeAddSprite', () => {
  it('returns a Rectangle when texture is missing (fall back)', () => {
    const fakeScene = {
      textures: { exists: (_: string) => false },
      add: {
        rectangle: (x: number, y: number, w: number, h: number, c: number) =>
          ({ x, y, w, h, c, kind: 'rect' }),
      },
    };
    const obj = safeAddSprite(
      fakeScene as never,
      100, 200,
      'nonexistent-key',
      16, 16,
      0xabcdef,
    );
    expect((obj as unknown as { kind: string }).kind).toBe('rect');
    expect((obj as unknown as { c: number }).c).toBe(0xabcdef);
  });

  it('returns an Image when texture exists', () => {
    let displayWidthSeen = 0;
    let displayHeightSeen = 0;
    const fakeScene = {
      textures: { exists: (_: string) => true },
      add: {
        image: (_x: number, _y: number, _k: string) => ({
          kind: 'image',
          setDisplaySize(w: number, h: number) {
            displayWidthSeen = w;
            displayHeightSeen = h;
          },
        }),
        rectangle: () => ({ kind: 'rect' }),
      },
    };
    const obj = safeAddSprite(
      fakeScene as never,
      0, 0,
      'existing-key',
      16, 16,
      0x000000,
    );
    expect((obj as unknown as { kind: string }).kind).toBe('image');
    expect(displayWidthSeen).toBe(16);
    expect(displayHeightSeen).toBe(16);
  });
});

describe('SPRITE_KEYS shape', () => {
  it('has only snake_case identifier-like values', () => {
    for (const value of Object.values(SPRITE_KEYS)) {
      expect(value).toMatch(/^[a-z_]+$/);
    }
  });
});
