import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../components/Footer';

describe('Footer section', () => {
  it('renders 4 columns (Brand / Project / Documentation / Author)', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-brand')).toBeTruthy();
    expect(screen.getByTestId('footer-project')).toBeTruthy();
    expect(screen.getByTestId('footer-docs')).toBeTruthy();
    expect(screen.getByTestId('footer-author')).toBeTruthy();
  });

  it('links to the GitHub repo and 5 sub-pages (issues / discussions / releases / run-locally / spec)', () => {
    render(<Footer />);
    expect(screen.getByTestId('footer-link-repo').getAttribute('href')).toBe(
      'https://github.com/kevin12369/whimsy',
    );
    expect(screen.getByTestId('footer-link-issues').getAttribute('href')).toContain('/issues');
    expect(screen.getByTestId('footer-link-discussions').getAttribute('href')).toContain(
      '/discussions',
    );
    expect(screen.getByTestId('footer-link-changelog').getAttribute('href')).toContain(
      '/releases',
    );
    expect(screen.getByTestId('footer-link-run-locally').getAttribute('href')).toContain(
      'RUN-LOCALLY.md',
    );
    expect(screen.getByTestId('footer-link-spec').getAttribute('href')).toContain(
      'whimsy-v2-design.md',
    );
  });

  it('renders the Star-on-GitHub CTA in the Author column', () => {
    render(<Footer />);
    const star = screen.getByTestId('footer-star-button');
    expect(star.getAttribute('href')).toBe('https://github.com/kevin12369/whimsy');
    expect(star.textContent).toMatch(/Star on GitHub/i);
  });
});
