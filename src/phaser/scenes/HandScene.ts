import Phaser from 'phaser';
import type { Deck } from '../../core/cardSystem';
import { renderHand } from '../../ui/CardHandView';
import { applyPhysics, defaultPhysics } from '../../core/physicsApply';

export class HandScene extends Phaser.Scene {
  private currentPhysics = defaultPhysics();
  private handContainer?: Phaser.GameObjects.Container;
  constructor() { super('HandScene'); }

  create() {
    const deck = this.registry.get('deck') as Deck | undefined;
    if (deck) {
      this.handContainer = renderHand(this, deck.physicsCards);
    }

    this.game.events.on('card:played-physics', ({ cardId }: { cardId: string }) => {
      if (!deck) return;
      const card = deck.physicsCards.find((c: { id: string }) => c.id === cardId);
      if (!card || !card.physicsPayload) return;
      this.currentPhysics = applyPhysics(this.currentPhysics, card.physicsPayload);
      // Phase 1.5 placeholder: log the new physics. A future task
      // will pipe this into the Phaser physics world.
      // eslint-disable-next-line no-console
      console.info('[HandScene] physics applied:', card.name, this.currentPhysics);
      this.events.emit('physics:changed', this.currentPhysics);
    });
  }

  shutdown() {
    this.handContainer?.destroy(true);
    this.game.events.off('card:played-physics');
  }
}
