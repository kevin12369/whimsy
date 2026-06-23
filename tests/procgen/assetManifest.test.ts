import { describe, it, expect } from 'vitest';
import { SPRITE_KEYS, ASSET_MANIFEST } from '../../src/config/assets';

describe('SPRITE_KEYS', () => {
  it('contains all 13 sprite role keys', () => {
    const expected = [
      'player', 'npc', 'item', 'altar', 'exit',
      'hand_moon_bounce', 'hand_heavy_brine', 'hand_icy_ground',
      'hand_sticky_vine', 'hand_gentle_drift', 'hand_earth_pull',
      'hand_feather_fall', 'hand_mud_walk',
    ];
    for (const key of expected) {
      expect(SPRITE_KEYS).toHaveProperty(key);
    }
  });

  it('each value is a non-empty string', () => {
    for (const value of Object.values(SPRITE_KEYS)) {
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });
});

describe('ASSET_MANIFEST', () => {
  it('every entry has url, license, sha256', () => {
    for (const a of ASSET_MANIFEST) {
      expect(a.url).toMatch(/^https?:\/\//);
      expect(a.license).toBeTruthy();
      expect(a.sha256).toMatch(/^(PENDING|[a-f0-9]{64})$/);
    }
  });

  it('includes kenney-ui, kenney-tinytown, kenney-toonchars', () => {
    const ids = ASSET_MANIFEST.map(a => a.id);
    expect(ids).toContain('kenney-ui');
    expect(ids).toContain('kenney-tinytown');
    expect(ids).toContain('kenney-toonchars');
  });
});
