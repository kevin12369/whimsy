import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '../components/Hero';

describe('Hero section', () => {
  it('renders the single page h1 with the tagline', () => {
    render(<Hero />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/一句话开 game jam/);
  });

  it('renders the "Try sample" CTA anchored to #demo', () => {
    render(<Hero />);
    const cta = screen.getByTestId('hero-cta-try-sample');
    expect(cta.getAttribute('href')).toBe('#demo');
  });

  it('renders the "看 README" CTA pointing at the repo README', () => {
    render(<Hero />);
    const cta = screen.getByTestId('hero-cta-readme');
    expect(cta.getAttribute('href')).toContain('github.com/kevin12369/whimsy');
    expect(cta.getAttribute('href')).toContain('README.md');
  });

  it('exposes a data-testid root for downstream test selectors', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('[data-testid="hero"]')).toBeTruthy();
  });
});
