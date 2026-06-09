import { describe, it, expect } from 'vitest';
import { sizeCheck, MAX_BYTES } from '../src/sizeCheck';

describe('sizeCheck', () => {
  it('accepts a small HTML doc', () => {
    const html = '<!DOCTYPE html><html><body>tiny</body></html>';
    const r = sizeCheck(html);
    expect(r.ok).toBe(true);
  });

  it('rejects a doc above MAX_BYTES', () => {
    const html = 'a'.repeat(MAX_BYTES + 1);
    const r = sizeCheck(html);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/size/i);
  });

  it('accepts a doc exactly at MAX_BYTES', () => {
    const html = 'a'.repeat(MAX_BYTES);
    const r = sizeCheck(html);
    expect(r.ok).toBe(true);
  });

  it('measures bytes, not characters (UTF-8 emoji)', () => {
    // 4-byte emoji repeated 100k times = 400k bytes, > 200k
    const html = '<!DOCTYPE html><html><body>' + '\u{1F600}'.repeat(100_000) + '</body></html>';
    const r = sizeCheck(html);
    expect(r.ok).toBe(false);
  });
});
