import type { Deck } from '../core/cardSystem';
import { buildHiddenCards, buildNpcCards, buildPhysicsCards, buildThemeCard } from '../config/themes';
import { pickItemsForDeck } from './itemTable';
import { uuid } from '../utils/uuid';

export function buildFallbackDeck(themeIndex: number, itemCount = 25): Deck {
  const themeCard = buildThemeCard(themeIndex);
  const physicsCards = buildPhysicsCards(themeIndex);
  const itemCards = pickItemsForDeck(itemCount, themeIndex);
  const npcCards = buildNpcCards(themeIndex);
  const itemNames = itemCards.map(c => c.name);
  const hiddenCards = buildHiddenCards(itemNames);
  return {
    id: uuid(),
    themeCard,
    physicsCards,
    itemCards,
    npcCards,
    hiddenCards,
    generatedBy: 'fallback',
    generatedAt: Date.now(),
  };
}
