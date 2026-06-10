import { describe, it, expect } from 'vitest';
import { cspHeader } from '../src/csp';

describe('cspHeader', () => {
  it('default-src self and jsdelivr', () => {
    const h = cspHeader();
    expect(h).toContain("default-src 'self' https://cdn.jsdelivr.net");
  });

  it('script-src allows inline', () => {
    const h = cspHeader();
    expect(h).toContain("script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'");
  });

  it('frame-ancestors none (no embedding)', () => {
    const h = cspHeader();
    expect(h).toContain("frame-ancestors 'none'");
  });
});
