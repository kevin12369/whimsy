import Phaser from 'phaser';
import { TILE_SIZE } from '../../config/constants';

/**
 * Companion entity that follows the player with delayed movement,
 * creating a natural "following" feel.
 */
export class CompanionEntity {
  private sprite: Phaser.GameObjects.Rectangle;
  private nameLabel: Phaser.GameObjects.Text;
  private container: Phaser.GameObjects.Container;
  private trail: Array<{ x: number; y: number }> = [];
  private trailLength = 12; // ~0.5s delay at 60fps

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, name: string) {
    const body = scene.add.rectangle(0, 0, 10, 10, color).setOrigin(0.5);
    const glow = scene.add.rectangle(0, 0, 16, 16, color, 0.2).setOrigin(0.5);

    this.nameLabel = scene.add.text(0, -12, name, {
      fontSize: '9px', color: '#fff',
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y, [glow, body, this.nameLabel]);
    this.sprite = body;

    // Subtle bob animation
    scene.tweens.add({
      targets: this.container, y: y - 2, duration: 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  /** Call every frame with the player's current position. */
  follow(playerX: number, playerY: number): void {
    this.trail.unshift({ x: playerX, y: playerY });
    if (this.trail.length > this.trailLength) {
      this.trail.pop();
    }

    // Only move if we have enough trail history
    if (this.trail.length >= this.trailLength) {
      const target = this.trail[this.trailLength - 1]!;
      // Smooth interpolation
      const dx = target.x - this.container.x;
      const dy = target.y - this.container.y;
      this.container.x += dx * 0.12;
      this.container.y += dy * 0.12;
    }
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /** Show a companion dialogue line above the companion. */
  showBubble(scene: Phaser.Scene, text: string, duration: number = 4000): void {
    const bubble = scene.add.text(
      this.container.x, this.container.y - 24, text,
      { fontSize: '10px', color: '#fff', backgroundColor: '#1a1a2ecc',
        padding: { x: 6, y: 3 }, wordWrap: { width: 160 } },
    ).setOrigin(0.5);
    scene.tweens.add({ targets: bubble, alpha: { from: 0, to: 1 }, duration: 200 });
    scene.time.delayedCall(duration, () => {
      scene.tweens.add({ targets: bubble, alpha: 0, duration: 300, onComplete: () => bubble.destroy() });
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
