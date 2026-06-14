import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DocumentMeta, seoConstants } from '../pages/_document';

describe('_document SEO meta', () => {
  it('renders a title-canonical + description + keywords meta', () => {
    // We render the DocumentMeta fragment (a plain <div> wrapper that holds
    // the same children <Document> mounts under <Head>). This avoids needing
    // Next's <Html> context provider, which is forbidden outside
    // pages/_document and would throw at SSR-time.
    const html = renderToStaticMarkup(DocumentMeta());
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/kevin12369\.github\.io\/whimsy\/"/);
    expect(html).toMatch(/<meta name="description" content=/);
    expect(html).toMatch(/<meta name="keywords" content=/);
    expect(html).toMatch(/<meta property="og:title" content=/);
    expect(html).toMatch(/<meta property="og:description" content=/);
    expect(html).toMatch(/<meta property="og:url" content=/);
    expect(html).toMatch(/<meta name="twitter:card" content=/);
    expect(html).toMatch(/<meta name="twitter:title" content=/);
  });

  it('inlines a JSON-LD SoftwareApplication block', () => {
    const html = renderToStaticMarkup(DocumentMeta());
    expect(html).toMatch(/<script type="application\/ld\+json">/);
    expect(html).toMatch(/"@type":\s*"SoftwareApplication"/);
    expect(html).toMatch(/"name":\s*"一念成游 Whimsy"/);
    expect(html).toMatch(/"applicationCategory":\s*"GameApplication"/);
  });

  it('keeps the CSP locked down (no unsafe-eval, restricted script-src)', () => {
    const html = renderToStaticMarkup(DocumentMeta());
    const cspMatch = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
    expect(cspMatch).toBeTruthy();
    // The static-render pass HTML-escapes single quotes (&#x27;); unescape for
    // human-readable assertions below.
    const csp = cspMatch![1]!.replace(/&#x27;/g, "'");
    // unsafe-eval must NOT appear
    expect(csp).not.toMatch(/'unsafe-eval'/);
    // script-src must list self + pinned Phaser CDN only
    expect(csp).toMatch(/script-src 'self' https:\/\/cdn\.jsdelivr\.net\/npm\/phaser@3\.70\.0\//);
    // frame-src must be restricted
    expect(csp).toMatch(/frame-src 'self'/);
    // default-src must be 'none'
    expect(csp).toMatch(/default-src 'none'/);
  });

  it('exposes the constant values used by the meta tags (SEO_SOURCE_OF_TRUTH)', () => {
    expect(seoConstants.SITE_URL).toBe('https://kevin12369.github.io/whimsy/');
    expect(seoConstants.TITLE).toMatch(/Whimsy/);
    expect(seoConstants.DESCRIPTION).toMatch(/Phaser/);
    expect(seoConstants.KEYWORDS).toMatch(/12 denylist/);
    expect(seoConstants.JSON_LD['@type']).toBe('SoftwareApplication');
  });
});
