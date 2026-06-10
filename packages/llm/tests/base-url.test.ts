import { describe, it, expect } from 'vitest';
import { validateLocalBaseUrl } from '../src/base-url';

describe('validateLocalBaseUrl', () => {
  it('accepts http://localhost:11434', () => {
    expect(() => validateLocalBaseUrl('http://localhost:11434')).not.toThrow();
  });

  it('accepts http://127.0.0.1:1234/v1', () => {
    expect(() => validateLocalBaseUrl('http://127.0.0.1:1234/v1')).not.toThrow();
  });

  it('accepts https://internal.lan', () => {
    expect(() => validateLocalBaseUrl('https://internal.lan')).not.toThrow();
  });

  it('rejects empty string', () => {
    expect(() => validateLocalBaseUrl('')).toThrow(/required/);
  });

  it('rejects non-http(s) protocol (file://, ftp://)', () => {
    expect(() => validateLocalBaseUrl('file:///etc/passwd')).toThrow(/http/);
    expect(() => validateLocalBaseUrl('ftp://internal')).toThrow(/http/);
  });

  it('rejects malformed URL', () => {
    expect(() => validateLocalBaseUrl('not-a-url')).toThrow(/URL/);
  });
});
