import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import EmbedPage, { __test } from '../pages/embed/[id]';

describe('embed — page shape', () => {
  it('renders a meta shell with the requested id', () => {
    const { container } = render(
      <EmbedPage
        id="sideScrollerComet"
        theme="#22d3ee"
        signature="p2-placeholder"
      />,
    );
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('Whimsy embed endpoint');
    // Direct visits see the note, not the iframe body.
    expect(container.innerHTML).not.toContain('<canvas');
  });

  it('returns a CSP-hardened HTML wrapper', () => {
    const html = __test.WRAP('sokoban', __test.PLACEHOLDER_BODY('#0ea5e9'));
    expect(html).toContain('Content-Security-Policy');
    expect(html).toContain("default-src 'none'");
    expect(html).toContain('https://cdn.jsdelivr.net');
    expect(html).toContain('sokoban');
  });

  it('escapes the template id in the wrapper (no HTML injection)', () => {
    const malicious = '"><script>alert(1)</script>';
    const html = __test.WRAP(malicious, '');
    // The id has been stripped of non [a-z0-9-] by the page; verify the wrapper
    // does NOT emit a live <script> from the id.
    expect(html).not.toContain('<script>alert(1)</script>');
    // ... and the <meta name="whimsy-embed-id"> is sanitized.
    const meta = html.match(/<meta name="whimsy-embed-id" content="([^"]*)"/);
    expect(meta).not.toBeNull();
    expect(meta![1]).not.toContain('"');
    expect(meta![1]).not.toContain('<');
  });
});

describe('embed — snippet safety', () => {
  it('snippet source is a single self-invoking function', () => {
    // We cannot load the IIFE in jsdom (it expects DOMContentLoaded already
    // fired and tries to querySelector at script top level). Instead, we
    // assert on the file content for the two security properties that
    // matter: sandbox attribute, and absence of eval/Function.
    // (The file is read off disk so it stays honest as the snippet evolves.)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('node:fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('node:path');
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'public', 'whimsy-embed.js'),
      'utf-8',
    );
    expect(src).toMatch(/sandbox="allow-scripts"/);
    expect(src).not.toMatch(/\beval\(/);
    expect(src).not.toMatch(/\bnew\s+Function\(/);
    // No same-origin in the sandbox attribute.
    expect(src).not.toMatch(/allow-same-origin/);
  });
});
