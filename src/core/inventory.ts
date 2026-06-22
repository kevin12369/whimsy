import { INVENTORY_MAX_SLOTS } from '../config/constants';
import type { Card } from './cardSystem';

export const INVENTORY_MAX = INVENTORY_MAX_SLOTS;

export function addToInventory(inv: string[], cardId: string): { inv: string[]; added: boolean } {
  if (inv.length >= INVENTORY_MAX) return { inv, added: false };
  return { inv: [...inv, cardId], added: true };
}

export function removeFromInventory(inv: string[], cardId: string): string[] {
  const idx = inv.indexOf(cardId);
  if (idx < 0) return inv;
  const out = inv.slice();
  out.splice(idx, 1);
  return out;
}

export function hasItemByName(inv: string[], cards: ReadonlyArray<Card>, name: string): boolean {
  const ids = new Set(inv);
  return cards.some(c => ids.has(c.id) && c.name === name);
}
