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
// IMPORTANT: This module uses type-only import for Phaser so that
// vitest in jsdom can import this file without Phaser's
// CanvasFeatures.js crashing on the missing canvas. Tests pass a
// fakeScene that satisfies the AssetScene structural type.
import type Phaser from 'phaser';
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

  // UI assets (keys only — actual paths loaded separately in preload)
  ui_panel: '',
  ui_panel_dark: '',
  ui_btn: '',
  ui_btn_pressed: '',
  ui_keyboard_atlas: '', // special handling in preload
};

// Structural types so tests don't need to import Phaser (which
// crashes jsdom on canvas detection at module-load time).
export interface LoadRequest {
  image(key: string, path: string): void;
}
export interface TextureQuery {
  exists(key: string): boolean;
}
export interface AssetScene {
  load: LoadRequest;
  textures: TextureQuery;
  add: Phaser.GameObjects.GameObjectFactory;
}

/**
 * Register load.image() calls on the given scene for every sprite
 * role. Safe to call multiple times (Phaser dedupes by key).
 * Also loads the keyboard icon atlas from Kenney Input Prompts.
 */
export function preloadAllAssets(scene: { load: LoadRequest & { atlasXML(key: string, imgPath: string, xmlPath: string): void } }): void {
  for (const [role, fileStem] of Object.entries(SPRITE_PATHS)) {
    if (!fileStem) continue; // ui assets loaded separately
    scene.load.image(role, `sprites/${fileStem}.png`);
  }
  // Load Kenney UI images from assets/ui/
  scene.load.image('ui_panel', 'assets/ui/panel_blue.png');
  scene.load.image('ui_btn', 'assets/ui/panel_blue.png');
  scene.load.image('ui_btn_pressed', 'assets/ui/panel_blue_pressed.png');
  // Load keyboard icon spritesheet as atlas
  scene.load.atlasXML('ui_keyboard_atlas', 'assets/ui/keyboard_sheet.png', 'assets/ui/keyboard_sheet.xml');
  // Load Roguelike tile spritesheet (16x16, 1px margin, 56 cols)
  (scene.load as any).spritesheet('tilesheet', 'assets/tiles/roguelikeSheet_transparent.png', {
    frameWidth: 16, frameHeight: 16, margin: 1, spacing: 0,
  });
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
): Phaser.GameObjects.GameObject {
  if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key);
    img.setDisplaySize(w, h);
    return img;
  }
  return scene.add.rectangle(x, y, w, h, fallbackColor);
}
