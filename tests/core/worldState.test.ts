import { describe, it, expect } from 'vitest';
import { createWorldState } from '../../src/core/worldState';

describe('WorldState', () => {
  it('starts in procgen mode, no deck, no inventory', () => {
    const w = createWorldState();
    expect(w.mode).toBe('procgen');
    expect(w.deck).toBeNull();
    expect(w.inventory).toEqual([]);
    expect(w.currentLevelIndex).toBe(0);
  });
});