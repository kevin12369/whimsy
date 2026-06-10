import { describe, it, expect } from 'vitest';
import { ALLOWED_MESSAGE_TYPES, isAllowedMessage, PROTOCOL_VERSION } from '../src/protocol';

describe('protocol', () => {
  it('exposes PROTOCOL_VERSION = 1', () => {
    expect(PROTOCOL_VERSION).toBe(1);
  });

  it('allows game-ready, score, game-over, error', () => {
    expect(ALLOWED_MESSAGE_TYPES.slice().sort()).toEqual(['error', 'game-over', 'game-ready', 'score']);
  });

  it('isAllowedMessage accepts known types', () => {
    for (const t of ALLOWED_MESSAGE_TYPES) {
      expect(isAllowedMessage({ type: t })).toBe(true);
    }
  });

  it('isAllowedMessage rejects unknown types', () => {
    expect(isAllowedMessage({ type: 'evil' })).toBe(false);
    expect(isAllowedMessage({ type: '' })).toBe(false);
    expect(isAllowedMessage({})).toBe(false);
    expect(isAllowedMessage(null)).toBe(false);
  });
});
