import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Portfolio from '../pages/portfolio';

describe('Portfolio page', () => {
  it('renders the project name and tagline', () => {
    render(<Portfolio />);
    expect(screen.getByRole('heading', { name: /一念成游/i })).toBeTruthy();
    expect(screen.getByText(/一句话开 game jam/i)).toBeTruthy();
  });

  it('renders the screenshot image with a real, basePath-qualified main.png src', () => {
    render(<Portfolio />);
    const img = screen.getByRole('img', { name: /whimsy demo screenshot/i }) as HTMLImageElement;
    const src = img.getAttribute('src') ?? '';
    expect(src).toContain('main.png');
    // Must be a real path, not a blob: URL
    expect(src.startsWith('blob:')).toBe(false);
    // Must include the basePath so the deployed page resolves it under /whimsy/
    expect(src.startsWith('/whimsy/')).toBe(true);
  });

  it('does not render any link with a placeholder href', () => {
    render(<Portfolio />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      const href = link.getAttribute('href') ?? '';
      expect(href).not.toBe('#');
      expect(href).not.toBe('');
    }
  });

  it('has a "Back to demo" link that resolves to the home page', () => {
    render(<Portfolio />);
    const back = screen.getByRole('link', { name: /back to demo/i }) as HTMLAnchorElement;
    const href = back.getAttribute('href') ?? '';
    // In production: Next.js Link with href="/" + basePath='/whimsy' resolves to /whimsy/
    // In test (no basePath): resolves to '/'
    // Both are valid home references; we just want a real, non-placeholder href.
    expect(['/', '/whimsy/']).toContain(href);
  });

  it('has 3 "Other projects" anchors pointing to GitHub repos (not github.io deploys)', () => {
    render(<Portfolio />);
    const sry = screen.getByRole('link', { name: '嘴笨助手 Sry' });
    const whimsy = screen.getByRole('link', { name: '一念成游 Whimsy' });
    const hummingbird = screen.getByRole('link', { name: '哼哼编曲 Hummingbird' });
    expect(sry.getAttribute('href')).toBe('https://github.com/kevin12369/sry');
    expect(whimsy.getAttribute('href')).toBe('https://github.com/kevin12369/whimsy');
    expect(hummingbird.getAttribute('href')).toBe('https://github.com/kevin12369/hummingbird');
    for (const l of [sry, whimsy, hummingbird]) {
      expect(l.getAttribute('target')).toBe('_blank');
      expect(l.getAttribute('rel')).toContain('noopener');
      expect(l.getAttribute('rel')).toContain('noreferrer');
    }
  });
});
