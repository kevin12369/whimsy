import { describe, it, expect } from 'vitest';
import { staticAnalysis } from '../src/staticAnalysis';

const GOOD_HTML = `<!DOCTYPE html>
<html><body>
  <canvas id="g" width="800" height="600"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
  <script>
    const game = new Phaser.Game({ width: 800, height: 600, scene: { create() {
      this.add.rectangle(400,300,20,20,0xff0000);
      this.input.keyboard.on('keydown', () => {});
    } } });
  </script>
</body></html>`;

describe('staticAnalysis', () => {
  it('accepts a well-formed Phaser game', () => {
    const r = staticAnalysis(GOOD_HTML);
    expect(r.ok).toBe(true);
  });

  it('rejects on denylist hit (eval)', () => {
    const bad = GOOD_HTML.replace('this.add.rectangle', 'eval("bad")');
    const r = staticAnalysis(bad);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/forbidden/i);
    expect(r.hit?.pattern).toContain('eval');
  });

  it('rejects when no canvas and no Phaser init', () => {
    const bad = '<!DOCTYPE html><html><body><script>1+1</script></body></html>';
    const r = staticAnalysis(bad);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/canvas|phaser/i);
  });

  it('rejects when no keyboard handler', () => {
    const noKeys = `<!DOCTYPE html><html><body>
      <canvas></canvas>
      <script>const g = new Phaser.Game({});</script>
    </body></html>`;
    const r = staticAnalysis(noKeys);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/keyboard|keydown|cursorKeys/i);
  });

  it('accepts Phaser cursorKeys as keyboard handler', () => {
    const ok = `<!DOCTYPE html><html><body>
      <canvas></canvas>
      <script>const g = new Phaser.Game({scene:{create(){this.input.keyboard.createCursorKeys();}}});</script>
    </body></html>`;
    const r = staticAnalysis(ok);
    expect(r.ok).toBe(true);
  });

  it('rejects unbalanced braces in inline script', () => {
    const bad = `<!DOCTYPE html><html><body>
      <canvas></canvas>
      <script>function f({{{}  // unbalanced</script>
    </body></html>`;
    const r = staticAnalysis(bad);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/brace|script/i);
  });

  it('rejects on fetch(', () => {
    const bad = GOOD_HTML.replace('this.input.keyboard', 'fetch("x")');
    const r = staticAnalysis(bad);
    expect(r.ok).toBe(false);
    expect(r.hit?.pattern).toContain('fetch');
  });
});
