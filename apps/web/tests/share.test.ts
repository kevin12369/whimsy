import { describe, it, expect } from 'vitest';
import { encodeShareUrl, decodeShareUrl, isOversize } from '../lib/share';

describe('share — encodeShareUrl / decodeShareUrl', () => {
  it('round-trips ASCII HTML through encode/decode', () => {
    const html = '<!DOCTYPE html><html><body><h1>hi</h1></body></html>';
    const url = encodeShareUrl(html);
    expect(url).toContain('#g=');
    const decoded = decodeShareUrl(new URL(url).hash.slice(1));
    expect(decoded).toBe(html);
  });

  it('round-trips unicode HTML (CJK + emoji)', () => {
    const html = '<!DOCTYPE html><html><body>一句话开 game jam \u{1F3AE}</body></html>';
    const url = encodeShareUrl(html);
    const decoded = decodeShareUrl(new URL(url).hash.slice(1));
    expect(decoded).toBe(html);
  });

  it('decodeShareUrl returns null when #g= is missing', () => {
    expect(decodeShareUrl('foo=bar')).toBeNull();
    expect(decodeShareUrl('')).toBeNull();
  });

  it('isOversize fires for very long URLs', () => {
    const huge = 'x'.repeat(10000);
    const url = encodeShareUrl(huge);
    expect(isOversize(url)).toBe(true);
  });
});