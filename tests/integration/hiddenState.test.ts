import { describe, it, expect } from 'vitest';
import { buildFallbackDeck } from '../../src/procgen/deckFallback';
import { fuseItems } from '../../src/core/fusionTable';
import { checkRecipe } from '../../src/core/recipeCheck';
import { unlockHiddenLevel } from '../../src/core/hiddenLevelUnlock';

describe('hidden unlock chain', () => {
  it('unlock chain fires when fuse matches deck hidden recipe', () => {
    const deck = buildFallbackDeck(0);
    const aName = deck.itemCards[0]!.name;
    const bName = deck.itemCards[1]!.name;
    const r = fuseItems(aName, bName);
    if (r) {
      const hidden = checkRecipe(deck, aName, bName);
      if (hidden) {
        const palette = deck.themeCard.themePayload?.palette
          ?? ['#000000', '#000000', '#000000', '#000000', '#000000'];
        const hl = unlockHiddenLevel(hidden, palette);
        expect(hl.unlockRecipeCardId).toBe(hidden.id);
        expect(hl.paletteOverride).toHaveLength(5);
      }
    }
    expect(deck.hiddenCards.length).toBe(2);
  });
});
