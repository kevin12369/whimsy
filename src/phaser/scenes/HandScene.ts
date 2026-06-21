import Phaser from 'phaser';
import type { Deck } from '../../core/cardSystem';
import { renderHand } from '../../ui/CardHandView';
import { applyPhysics, defaultPhysics } from '../../core/physicsApply';
import { gameBus } from '../../core/eventBus';

export class HandScene extends Phaser.Scene {
  private currentPhysics = defaultPhysics();
  constructor() { super('HandScene'); }
  create() {
    gameBus.on('card:played-physics', ({ cardId }) => {
      const deck = this.registry.get('deck') as Deck | undefined;
      const card = deck?.physicsCards.find((c: { id: string }) => c.id === cardId);
      if (card?.physicsPayload) this.currentPhysics = applyPhysics(this.currentPhysics, card.physicsPayload);
      const gameScene = this.scene.get('GameScene');
      if (gameScene) {
        gameScene.events.emit('physics:changed', this.currentPhysics);
      }
    });
  }
}