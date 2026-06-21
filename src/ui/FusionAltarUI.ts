import Phaser from 'phaser';
import type { Card, FusedItem } from '../core/cardSystem';
import { fuseItems } from '../core/fusionTable';
import { composeCards } from '../core/cardComposition';
import { gameBus } from '../core/eventBus';

// Phase 1 fusion: item+item → hand-authored table; otherwise → card+card composition.
// Spec §5.3 paths: item+item / item+card / card+card. The Phase 1 implementation
// fuses two item cards via the table; everything else falls through to composeCards.
export function openFusionAltar(_scene: Phaser.Scene, a: Card, b: Card, _inventory: Card[]): FusedItem | null {
  if (a.type === 'item' && b.type === 'item') {
    const r = fuseItems(a.name, b.name);
    if (r) {
      gameBus.emit('fusion:complete', { fusedItemId: r.id });
      return r;
    }
    return null;
  }
  const composed = composeCards(a, b);
  gameBus.emit('fusion:complete', { fusedItemId: composed.id });
  return composed;
}