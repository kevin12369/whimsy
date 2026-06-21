import type { Card, FusedItem } from './cardSystem';
import { uuid } from '../utils/uuid';

// When both inputs are cards (not items), compose deterministically.
// Spec §5.3: card+card composes from existing card stats.
export function composeCards(a: Card, b: Card): FusedItem {
  const spriteKey = a.type === 'item' && a.itemPayload
    ? a.itemPayload.spriteKey
    : b.itemPayload?.spriteKey ?? 'orb_green';
  return {
    id: uuid(),
    name: `${a.name} ${b.name}`,
    spriteKey,
    behavior: `fused from ${a.type}+${b.type}`,
    stackable: false,
    fusedFrom: { type: 'card+card', inputs: [a.id, b.id] },
  };
}