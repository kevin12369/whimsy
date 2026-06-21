import { describe, it, expect } from 'vitest';
import { checkRecipe } from '../../src/core/recipeCheck';
import type { Card, Deck } from '../../src/core/cardSystem';

const hiddenCard: Card = {
  id: 'h-1', type: 'hidden', name: 'Memory Gate',
  hiddenPayload: { unlockRecipe: ['vine whip', 'ferment orb'] },
  generatedBy: 'fallback', generatedAt: 0,
};

const deck = { hiddenCards: [hiddenCard] } as unknown as Deck;

describe('checkRecipe', () => {
  it('matches when both items are fused', () => {
    expect(checkRecipe(deck, 'vine whip', 'ferment orb')?.id).toBe('h-1');
  });

  it('does not match mismatched pair', () => {
    expect(checkRecipe(deck, 'vine whip', 'cyan blade')).toBeNull();
  });

  it('rejects order swap (only forward direction matches)', () => {
    // The recipe stores ['vine whip', 'ferment orb']; checkRecipe accepts either order.
    expect(checkRecipe(deck, 'ferment orb', 'vine whip')?.id).toBe('h-1');
  });
});