import type { Card, Deck, FusedItem, HiddenLevel, Level } from './cardSystem';

export type Mode = 'procgen' | 'ai';
export type ModelStatus = 'unloaded' | 'loading' | 'ready' | 'unavailable';

export interface LlmStats {
  callsThisSession: number;
  totalLatencyMs: number;
  timeoutsThisSession: number;
}

export interface WorldState {
  deck: Deck | null;
  levels: Level[];
  currentLevelIndex: number;
  inventory: FusedItem[];
  hand: Card[];
  llmStats: LlmStats;
  mode: Mode;
  modelStatus: ModelStatus;
  unlockedHiddenLevels: HiddenLevel[];
}

export function createWorldState(): WorldState {
  return {
    deck: null,
    levels: [],
    currentLevelIndex: 0,
    inventory: [],
    hand: [],
    llmStats: { callsThisSession: 0, totalLatencyMs: 0, timeoutsThisSession: 0 },
    mode: 'procgen',
    modelStatus: 'unloaded',
    unlockedHiddenLevels: [],
  };
}