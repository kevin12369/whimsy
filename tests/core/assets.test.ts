import { describe, it, expect } from 'vitest';
import { ASSET_MANIFEST } from '../../src/config/assets';

describe('ASSET_MANIFEST', () => {
  it('includes all required sources', () => {
    const names = ASSET_MANIFEST.map(a => a.id);
    expect(names).toContain('kenney-ui');
    expect(names).toContain('cafedraw-cards');
    expect(names).toContain('mixkit-sfx');
    expect(names).toContain('phaser-examples');
  });

  it('every entry has url, license, sha256', () => {
    for (const a of ASSET_MANIFEST) {
      expect(a.url).toMatch(/^https?:\/\//);
      expect(a.license).toBeTruthy();
      expect(a.sha256).toMatch(/^(PENDING|[a-f0-9]{64})$/);
    }
  });
});