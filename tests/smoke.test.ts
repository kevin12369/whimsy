import { describe, it, expect } from 'vitest';
import { PHASER_VERSION } from '../src/phaser/version';

describe('main module', () => {
  it('exports Phaser version 3', () => {
    expect(PHASER_VERSION).toBe('3.80.1');
  });
});
