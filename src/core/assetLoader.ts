// Phase 1.6 asset loader. Two responsibilities:
//
// 1. preloadAllAssets(scene) registers a load.image() call for each
//    SPRITE_KEYS entry. Call this from BootScene.preload() so all
//    sprites are in the texture cache before GameScene starts.
//
// 2. safeAddSprite(scene, x, y, key, w, h, fallbackColor) is the
//    only safe way to render an entity sprite in Phase 1.6+. It
//    checks scene.textures.exists(key) first; if the texture is
//    missing (e.g. download failed), it falls back to a colored
//    rectangle matching the Phase 1.5 placeholder. This means
//    gameplay is robust to offline / partial-asset situations.
//
// IMPORTANT: We avoid `import Phaser from 'phaser'` here so that
// vitest in jsdom can import this file without Phaser's
// CanvasFeatures.js crashing on the missing canvas. The function
// signatures use a structural type so tests can pass a fakeScene
// without instantiating a real Phaser.Scene.
import { SPRITE_KEYS, type SpriteKey } from '../config/assets';

const SPRITE_PATHS: Record<SpriteKey, string> = {
  player: SPRITE_KEYS.player,
  npc: SPRITE_KEYS.npc,
  item: SPRITE_KEYS.item,
  altar: SPRITE_KEYS.altar,
  exit: SPRITE_KEYS.exit,
  hand_moon_bounce: SPRITE_KEYS.hand_moon_bounce,
  hand_heavy_brine: SPRITE_KEYS.hand_heavy_brine,
  hand_icy_ground: SPRITE_KEYS.hand_icy_ground,
  hand_sticky_vine: SPRITE_KEYS.hand_sticky_vine,
  hand_gentle_drift: SPRITE_KEYS.hand_gentle_drift,
  hand_earth_pull: SPRITE_KEYS.hand_earth_pull,
  hand_feather_fall: SPRITE_KEYS.hand_feather_fall,
  hand_mud_walk: SPRITE_KEYS.hand_mud_walk,
};

// Structural types so tests don't need to import Phaser (which
// crashes jsdom on canvas detection at module-load time).
export interface LoadRequest {
  image(key: string, path: string): void;
}
export interface TextureQuery {
  exists(key: string): boolean;
}
export interface SpriteAdder {
  image(x: number, y: number, key: string): { x: number; y: number; k: string; setDisplaySize(w: number, h: number): void };
  rectangle(x: number, y: number, w: number, h: number, c: number): unknown;
}
export interface AssetScene {
  load: LoadRequest;
  textures: TextureQuery;
  add: SpriteAdder;
}

/**
 * Register load.image() calls on the given scene for every sprite
 * role. Safe to call multiple times (Phaser dedupes by key).
 */
export function preloadAllAssets(scene: { load: LoadRequest }): void {
  for (const [role, fileStem] of Object.entries(SPRITE_PATHS)) {
    scene.load.image(role, `sprites/${fileStem}.png`);
  }
}

/**
 * Add a sprite at (x, y). If the texture for `key` failed to load,
 * fall back to a colored rectangle.
 */
export function safeAddSprite(
  scene: AssetScene,
  x: number, y: number,
  key: string,
  w: number, h: number,
  fallbackColor: number,
): unknown {
  if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key);
    img.setDisplaySize(w, h);
    return img;
  }
  return scene.add.rectangle(x, y, w, h, fallbackColor);
}
