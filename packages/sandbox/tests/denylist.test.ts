import { describe, it, expect } from 'vitest';
import { FORBIDDEN_PATTERNS, findDenylistHit } from '../src/denylist';

describe('denylist', () => {
  it('includes eval, Function, cookie, parent, localStorage, fetch, XHR, importScripts', () => {
    const joined = FORBIDDEN_PATTERNS.join('|');
    expect(joined).toMatch(/eval/);
    expect(joined).toMatch(/Function/);
    expect(joined).toMatch(/cookie/);
    expect(joined).toMatch(/window\.parent/);
    expect(joined).toMatch(/localStorage/);
    expect(joined).toMatch(/fetch/);
    expect(joined).toMatch(/XMLHttpRequest/);
    expect(joined).toMatch(/importScripts/);
  });

  it('returns null on clean code', () => {
    const code = `this.add.rectangle(100,100,20,20,0xff0000); this.input.keyboard.on('keydown', ()=>{});`;
    expect(findDenylistHit(code)).toBeNull();
  });

  it('detects eval()', () => {
    const code = `const x = eval('1+1');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
    expect(hit!.pattern).toContain('eval');
  });

  it('detects fetch(', () => {
    const code = `fetch('https://evil.example');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
    expect(hit!.pattern).toContain('fetch');
  });

  it('detects new Function(', () => {
    const code = `const f = new Function('return 1');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
  });

  it('detects localStorage', () => {
    const code = `localStorage.setItem('x','1');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
  });

  it('returns excerpt around the hit', () => {
    const code = `safe(); fetch('x'); safe();`;
    const hit = findDenylistHit(code);
    expect(hit!.excerpt).toContain('fetch');
  });
});
