export type CardType = 'theme' | 'physics' | 'item' | 'npc' | 'hidden';
export type GeneratedBy = 'llm' | 'fallback';

export interface ThemePayload {
  palette: string[];
  ruleQuirk: string;
}
export interface PhysicsPayload {
  gravity: number;
  restitution: number;
  friction: number;
  note: string;
}
export interface ItemPayload {
  spriteKey: string;
  behavior: string;
  stackable: boolean;
  spawnPool?: 'common' | 'rare';
}
export interface NpcPayload {
  role: string;
  personality: string;
}
export interface HiddenPayload {
  unlockRecipe: [string, string];
}

export interface Card {
  id: string;
  type: CardType;
  name: string;
  themePayload?: ThemePayload;
  physicsPayload?: PhysicsPayload;
  itemPayload?: ItemPayload;
  npcPayload?: NpcPayload;
  hiddenPayload?: HiddenPayload;
  generatedBy: GeneratedBy;
  generatedAt: number;
}

export interface Deck {
  id: string;
  themeCard: Card;
  physicsCards: Card[];
  itemCards: Card[];
  npcCards: Card[];
  hiddenCards: Card[];
  generatedBy: GeneratedBy;
  generatedAt: number;
}

export interface PlacedItem { cardId: string; pos: { x: number; y: number }; }
export interface PlacedNpc  { cardId: string; pos: { x: number; y: number }; dialogueHistory: string[]; }

export interface Level {
  index: number;
  deckId: string;
  tilemap: string;
  widthTiles: number;
  heightTiles: number;
  spawnedItems: PlacedItem[];
  npcs: PlacedNpc[];
  activePhysicsCardId: string | null;
  exitTile: { x: number; y: number };
  unlockedBy?: string;
}

export interface FusedItem {
  id: string;
  name: string;
  spriteKey: string;
  behavior: string;
  stackable: boolean;
  fusedFrom: { type: 'item+item' | 'item+card' | 'card+card'; inputs: [string, string]; };
}

export interface HiddenLevel {
  id: string;
  name: string;
  paletteOverride: string[];
  ruleQuirk: string;
  unlockRecipeCardId: string;
}