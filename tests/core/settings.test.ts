import { describe, it, expect } from 'vitest';
import { defaultSettings, setMode } from '../../src/core/settings';

describe('settings', () => {
  it('default mode is procgen (Phase 1)', () => {
    expect(defaultSettings().mode).toBe('procgen');
  });

  it('setMode rejects ai in Phase 1 (always falls back to procgen)', () => {
    const s = setMode(defaultSettings(), 'ai');
    expect(s.mode).toBe('procgen');
  });

  it('setMode accepts procgen', () => {
    const s = setMode(defaultSettings(), 'procgen');
    expect(s.mode).toBe('procgen');
  });
});