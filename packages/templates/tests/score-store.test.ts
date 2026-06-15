import { describe, it, expect, beforeEach } from 'vitest';
import { recordEnd, getHighScore, clearAll } from '../src/score-store';

describe('score-store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getHighScore returns 0 for unseen template', () => {
    expect(getHighScore('sideScrollerComet')).toBe(0);
  });

  it('recordEnd returns isNewHigh=true on first play', () => {
    const r = recordEnd('sideScrollerComet', 1, 100);
    expect(r.isNewHigh).toBe(true);
  });

  it('recordEnd returns isNewHigh=false when score < high', () => {
    recordEnd('sideScrollerComet', 1, 100);
    const r = recordEnd('sideScrollerComet', 1, 50);
    expect(r.isNewHigh).toBe(false);
  });

  it('getHighScore returns stored high after recordEnd', () => {
    recordEnd('sideScrollerComet', 1, 100);
    recordEnd('sideScrollerComet', 2, 200);
    expect(getHighScore('sideScrollerComet')).toBe(200);
  });

  it('clearAll wipes only whimsy:score:* keys', () => {
    localStorage.setItem('whimsy:score:t1', JSON.stringify({ high: 5, plays: 1 }));
    localStorage.setItem('whimsy:local:baseUrl', 'http://x');
    clearAll();
    expect(localStorage.getItem('whimsy:score:t1')).toBeNull();
    expect(localStorage.getItem('whimsy:local:baseUrl')).toBe('http://x');
  });
});
