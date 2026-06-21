import type { Card } from '../core/cardSystem';
import Phaser from 'phaser';

export function renderHand(scene: Phaser.Scene, hand: Card[]): Phaser.GameObjects.Container {
  const c = scene.add.container(0, scene.scale.height - 80);
  hand.slice(0, 8).forEach((card, i) => {
    const rect = scene.add.rectangle(80 + i * 100, 0, 80, 60, 0x222244).setStrokeStyle(1, 0xaaaaff);
    const label = scene.add.text(80 + i * 100, 0, card.name, { fontSize: '11px', color: '#fff' }).setOrigin(0.5);
    rect.setInteractive({ draggable: true });
    rect.setData('cardId', card.id);
    c.add([rect, label]);
  });
  return c;
}