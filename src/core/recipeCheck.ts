import type { Card, Deck } from './cardSystem';

export function checkRecipe(deck: Deck, aName: string, bName: string): Card | null {
  for (const h of deck.hiddenCards) {
    if (!h.hiddenPayload) continue;
    const [x, y] = h.hiddenPayload.unlockRecipe;
    if ((x === aName && y === bName) || (x === bName && y === aName)) return h;
  }
  return null;
}