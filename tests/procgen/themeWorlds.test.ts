import { describe, it, expect } from 'vitest';
import { THEME_WORLDS, biomeWeightsFor, npcRolesFor } from '../../src/procgen/themeWorlds';

describe('THEME_WORLDS', () => {
  it('defines exactly 11 worlds', () => {
    expect(THEME_WORLDS).toHaveLength(11);
  });

  it('every world has palette(5), ruleQuirk, biomeWeights, npcRoles', () => {
    for (const w of THEME_WORLDS) {
      expect(w.palette).toHaveLength(5);
      expect(w.ruleQuirk.length).toBeGreaterThan(5);
      expect(w.npcRoles).toHaveLength(3);
      expect(biomeWeightsFor(w.id)[0]).toBeGreaterThan(0);
    }
  });

  it('11 worlds produce 11 unique names', () => {
    const names = new Set(THEME_WORLDS.map(w => w.name));
    expect(names.size).toBe(11);
  });
});
