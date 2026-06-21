import { describe, it, expect } from 'vitest';
import { getDialogue } from '../../src/core/dialogueTable';

describe('getDialogue', () => {
  it('returns a non-empty line for an NPC role', () => {
    expect(getDialogue('druid vendor').length).toBeGreaterThan(10);
  });

  it('cycles through lines on repeated calls (deterministic order)', () => {
    const a = getDialogue('druid vendor', 0);
    const b = getDialogue('druid vendor', 1);
    expect(a).not.toBe(b);
  });
});