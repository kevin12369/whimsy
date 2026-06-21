import type { Card, HiddenLevel } from './cardSystem';
import { uuid } from '../utils/uuid';

export function unlockHiddenLevel(card: Card, palette: string[]): HiddenLevel {
  return {
    id: uuid(),
    name: card.name,
    paletteOverride: palette,
    ruleQuirk: 'a hidden world has opened',
    unlockRecipeCardId: card.id,
  };
}