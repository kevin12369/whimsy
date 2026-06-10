import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

describe('public API', () => {
  it('re-exports extractHtml, sizeCheck, staticAnalysis', () => {
    expect(typeof api.extractHtml).toBe('function');
    expect(typeof api.sizeCheck).toBe('function');
    expect(typeof api.staticAnalysis).toBe('function');
  });

  it('re-exports denylist helpers', () => {
    expect(Array.isArray(api.FORBIDDEN_PATTERNS)).toBe(true);
    expect(typeof api.findDenylistHit).toBe('function');
  });

  it('re-exports protocol helpers', () => {
    expect(api.PROTOCOL_VERSION).toBe(1);
    expect(typeof api.isAllowedMessage).toBe('function');
  });
});
