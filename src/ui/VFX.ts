/**
 * VFX utility — spawns Kenney particle effects with animation.
 * All effects auto-destroy after animation completes.
 * Falls back gracefully if textures aren't loaded.
 */

import type Phaser from 'phaser';

/** Preload VFX images — call from BootScene */
export function preloadVFX(scene: Phaser.Scene): void {
  const files = [
    'collect', 'collect2', 'flash', 'light', 'glow',
    'damage', 'dash', 'smoke', 'twirl',
  ];
  for (const f of files) {
    scene.load.image(`vfx_${f}`, `assets/vfx/${f}.png`);
  }
}

type VFXType = 'collect' | 'flash' | 'light' | 'damage' | 'dash' | 'smoke' | 'twirl' | 'glow';

const VFX_CONFIG: Record<VFXType, { key: string; scale: number; tint?: number }> = {
  collect:  { key: 'vfx_collect',  scale: 0.8 },
  flash:    { key: 'vfx_flash',    scale: 1.0 },
  light:    { key: 'vfx_light',    scale: 1.2 },
  damage:   { key: 'vfx_damage',   scale: 1.0 },
  dash:     { key: 'vfx_dash',     scale: 0.6 },
  smoke:    { key: 'vfx_smoke',    scale: 0.8 },
  twirl:    { key: 'vfx_twirl',    scale: 0.7 },
  glow:     { key: 'vfx_glow',     scale: 1.5 },
};

/**
 * Spawn a VFX at (x, y) with animation.
 * The effect plays once and destroys itself.
 */
export function spawnVFX(
  scene: Phaser.Scene,
  type: VFXType,
  x: number, y: number,
  config?: { scale?: number; tint?: number; duration?: number; depth?: number },
): void {
  const vfxConfig = VFX_CONFIG[type];
  if (!vfxConfig) return;

  const key = vfxConfig.key;
  const duration = config?.duration ?? 400;

  if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key);
    img.setOrigin(0.5);
    img.setScale(config?.scale ?? vfxConfig.scale);
    img.setDepth(config?.depth ?? 100);
    img.setAlpha(0.9);
    if (config?.tint) img.setTint(config.tint);

    // Animate: scale up + fade out
    scene.tweens.add({
      targets: img,
      scaleX: (config?.scale ?? vfxConfig.scale) * 1.8,
      scaleY: (config?.scale ?? vfxConfig.scale) * 1.8,
      alpha: 0,
      duration,
      ease: 'Quad.easeOut',
      onComplete: () => img.destroy(),
    });
  }
  // No fallback needed — silently skip if texture missing
}

/**
 * Spawn a burst of multiple VFX around a point.
 */
export function spawnVFXBurst(
  scene: Phaser.Scene,
  type: VFXType,
  x: number, y: number,
  count: number = 4,
  config?: { scale?: number; tint?: number; duration?: number; spread?: number; depth?: number },
): void {
  const spread = config?.spread ?? 20;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = spread * (0.5 + Math.random() * 0.5);
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    scene.time.delayedCall(i * 60, () => {
      spawnVFX(scene, type, px, py, {
        ...config,
        scale: (config?.scale ?? 0.6) * (0.8 + Math.random() * 0.4),
        duration: (config?.duration ?? 400) * (0.8 + Math.random() * 0.4),
      });
    });
  }
}
