/**
 * Audio Manager — plays Kenney UI sound effects on game events.
 * Wraps Phaser's sound manager with preloading, fallback, and
 * a simple SFX API.
 */

import type Phaser from 'phaser';

type SFXKey =
  | 'click' | 'confirm' | 'pickup' | 'fusion'
  | 'damage' | 'dash' | 'collect' | 'hover'
  | 'select' | 'reveal' | 'portal' | 'error';

const SFX_FILES: Record<SFXKey, string> = {
  click:   'audio/click.wav',
  confirm: 'audio/confirm.wav',
  pickup:  'audio/pickup.wav',
  fusion:  'audio/fusion.wav',
  damage:  'audio/damage.wav',
  dash:    'audio/dash.wav',
  collect: 'audio/collect.wav',
  hover:   'audio/hover.wav',
  select:  'audio/select.wav',
  reveal:  'audio/reveal.wav',
  portal:  'audio/portal.wav',
  error:   'audio/error.wav',
};

const VOLUMES: Partial<Record<SFXKey, number>> = {
  click: 0.4,
  hover: 0.3,
  select: 0.5,
};

/**
 * Preload all SFX — call from BootScene.preload().
 */
export function preloadSFX(scene: Phaser.Scene): void {
  for (const [key, path] of Object.entries(SFX_FILES)) {
    scene.load.audio(key, path);
  }
}

/**
 * Play a sound effect with optional volume override.
 * Silently does nothing if audio system isn't available.
 */
export function playSFX(
  scene: Phaser.Scene,
  key: SFXKey,
  overrideConfig?: { volume?: number; rate?: number },
): void {
  try {
    if (!scene.sound || !scene.cache.audio.exists(key)) return;
    const vol = overrideConfig?.volume ?? VOLUMES[key] ?? 0.6;
    scene.sound.play(key, { volume: vol, rate: overrideConfig?.rate ?? 1 });
  } catch {
    // Silently fail — audio failures should never break gameplay
  }
}

/**
 * Create a hover sound handler for interactive game objects.
 * Usage: hoverSound(scene, gameObject)
 */
export function addHoverSound(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject & { on: Function },
): void {
  target.on('pointerover', () => playSFX(scene, 'hover', { volume: 0.3 }));
  target.on('pointerdown', () => playSFX(scene, 'select', { volume: 0.5 }));
}
