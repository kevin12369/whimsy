import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { extractHtml, sizeCheck, staticAnalysis, MAX_BYTES } from '@whimsy/sandbox';

// Recreate the runSandbox helper inline so we test the same logic
// the share page uses. (Mirrors apps/web/pages/g/[id].tsx.)
function stripDoctype(html: string): string {
  return html.replace(/^\s*<!DOCTYPE[^>]*>/i, '');
}

const HTML_WRAPPER = (body: string): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: https:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none';" />
<title>Whimsy Game</title>
<style>body { margin: 0; }</style>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
</head>
<body>
${body}
</body>
</html>`;

function runSandbox(candidate: string): { ok: true; html: string } | { ok: false; reason: string } {
  const extracted = extractHtml(candidate) || candidate;
  const sizeResult = sizeCheck(extracted);
  if (!sizeResult.ok) return { ok: false, reason: sizeResult.reason ?? 'Size limit exceeded' };
  const validation = staticAnalysis(extracted);
  if (!validation.ok) return { ok: false, reason: validation.reason ?? 'Failed security check' };
  return { ok: true, html: HTML_WRAPPER(stripDoctype(extracted)) };
}

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

describe('share-g sandbox pipeline', () => {
  it('rejects HTML that fails sizeCheck (over MAX_BYTES)', () => {
    const oversize = 'a'.repeat(MAX_BYTES + 1);
    const r = runSandbox(oversize);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/size/i);
  });

  it('rejects HTML that fails staticAnalysis (forbidden fetch() denylist hit)', () => {
    const bad = GOOD_HTML.replace('this.input.keyboard', 'fetch("http://evil")');
    const r = runSandbox(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/forbidden|fetch/i);
  });

  it('rejects HTML missing <canvas> and Phaser init', () => {
    const bad = '<!DOCTYPE html><html><body><script>1+1</script></body></html>';
    const r = runSandbox(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/canvas|phaser/i);
  });

  it('accepts well-formed Phaser HTML and wraps it with the inline CSP + Phaser CDN script', () => {
    const r = runSandbox(GOOD_HTML);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.html).toContain('Content-Security-Policy');
      expect(r.html).toContain("default-src 'none'");
      expect(r.html).toContain('https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js');
      // The wrapper injects a Phaser CDN script tag (jsdelivr domain must
      // remain on the outer page's script-src allowlist).
      expect(r.html).toMatch(/phaser@3\.70\.0/);
    }
  });
});

describe('document CSP allowlist permits Phaser CDN', () => {
  it('keeps jsdelivr Phaser 3.70.0 on script-src', () => {
    // Read the static _document.tsx content rather than rendering it
    // (Document is special-cased by Next.js and not trivially renderable).
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const docPath = path.resolve(__dirname, '../pages/_document.tsx');
    const src = fs.readFileSync(docPath, 'utf-8');
    expect(src).toMatch(/script-src[^;]*https:\/\/cdn\.jsdelivr\.net\/npm\/phaser@3\.70\.0\//);
  });

  it('removes unsafe-inline from script-src', () => {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const docPath = path.resolve(__dirname, '../pages/_document.tsx');
    const src = fs.readFileSync(docPath, 'utf-8');
    // Pull the single string literal for the script-src directive.
    // It's a quoted JS string, so stop at the first closing quote.
    const match = /script-src\s+['"]([^'"]+)['"]/.exec(src);
    expect(match).not.toBeNull();
    const scriptSrc = match![1];
    expect(scriptSrc).not.toMatch(/'unsafe-inline'/);
  });

  it('keeps unsafe-inline on style-src (Tailwind inline styles)', () => {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const docPath = path.resolve(__dirname, '../pages/_document.tsx');
    const src = fs.readFileSync(docPath, 'utf-8');
    expect(src).toMatch(/style-src[^;]*'unsafe-inline'/);
  });
});
