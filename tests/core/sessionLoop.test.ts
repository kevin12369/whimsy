import { describe, it, expect } from 'vitest';
import { createSession, advanceLevel, reachedExit } from '../../src/core/sessionLoop';

describe('sessionLoop', () => {
  it('session starts at level 0 of 5', () => {
    const s = createSession();
    expect(s.currentLevelIndex).toBe(0);
    expect(s.maxLevels).toBe(5);
    expect(s.done).toBe(false);
  });

  it('advanceLevel increments and ends at last', () => {
    let s = createSession();
    for (let i = 0; i < 4; i++) s = advanceLevel(s);
    expect(s.currentLevelIndex).toBe(4);
    expect(s.done).toBe(false);
    s = advanceLevel(s);
    expect(s.done).toBe(true);
  });

  it('reachedExit detects same tile', () => {
    expect(reachedExit({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(true);
    expect(reachedExit({ x: 3, y: 4 }, { x: 3, y: 5 })).toBe(false);
  });
});