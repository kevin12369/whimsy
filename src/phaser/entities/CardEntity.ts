import type { Card } from '../../core/cardSystem';

export function isPickupable(card: Card, playerInRange: boolean): boolean {
  return playerInRange && (card.type === 'item' || card.type === 'physics');
}