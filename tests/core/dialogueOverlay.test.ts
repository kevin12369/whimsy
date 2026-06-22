import { describe, it, expect } from 'vitest';
import { pickDialogueLine, recordLine } from '../../src/core/dialogueOverlay';

describe('pickDialogueLine', () => {
  it('returns a non-empty line for an NPC role', () => {
    const line = pickDialogueLine('druid vendor', []);
    expect(line.length).toBeGreaterThan(10);
  });
  it('cycles through lines deterministically', () => {
    const a = pickDialogueLine('druid vendor', []);
    const b = pickDialogueLine('druid vendor', [a]);
    const c = pickDialogueLine('druid vendor', [a, b]);
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a).toBe(pickDialogueLine('druid vendor', []));
  });
  it('falls back to default table for unknown role', () => {
    const line = pickDialogueLine('unknown role', []);
    expect(line.length).toBeGreaterThan(5);
  });
});

describe('recordLine', () => {
  it('appends to history', () => {
    expect(recordLine([], 'hello')).toEqual(['hello']);
    expect(recordLine(['a'], 'b')).toEqual(['a', 'b']);
  });
  it('caps history at 10', () => {
    let h: string[] = [];
    for (let i = 0; i < 15; i++) h = recordLine(h, `line ${i}`);
    expect(h).toHaveLength(10);
    expect(h[0]).toBe('line 5');
    expect(h[9]).toBe('line 14');
  });
});
