import { INVENTORY_MAX_SLOTS } from '../config/constants';

export const INVENTORY_MAX = INVENTORY_MAX_SLOTS;

export function addToInventory(inv: string[], cardId: string): { inv: string[]; added: boolean } {
  if (inv.length >= INVENTORY_MAX) return { inv, added: false };
  return { inv: [...inv, cardId], added: true };
}