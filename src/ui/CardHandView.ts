import type { Card } from '../core/cardSystem';
import Phaser from 'phaser';

export function renderHand(scene: Phaser.Scene, hand: Card[]): Phaser.GameObjects.Container {
  const c = scene.add.container(0, scene.scale.height - 80);
  hand.slice(0, 8).forEach((card, i) => {
    const rect = scene.add.rectangle(80 + i * 100, 0, 80, 60, 0x222244)
      .setStrokeStyle(1, 0xaaaaff)
      .setInteractive({ useHandCursor: true, draggable: true });
    const label = scene.add.text(80 + i * 100, 0, card.name, {
      fontSize: '11px', color: '#fff',
    }).setOrigin(0.5);
    rect.setData('cardId', card.id);
    rect.setData('cardName', card.name);
    rect.on('pointerdown', () => {
      rect.setFillStyle(0x4444aa);
    });
    rect.on('pointerup', () => {
      rect.setFillStyle(0x222244);
      scene.game.events.emit('card:played-physics', { cardId: card.id });
    });
    rect.on('pointerout', () => rect.setFillStyle(0x222244));
    c.add([rect, label]);
  });
  return c;
}
