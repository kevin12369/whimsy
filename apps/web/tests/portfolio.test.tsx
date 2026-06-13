import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Portfolio from '../pages/portfolio';

describe('Portfolio page', () => {
  it('renders the project name and tagline', () => {
    render(<Portfolio />);
    expect(screen.getByRole('heading', { name: /一念成游/i })).toBeTruthy();
    expect(screen.getByText(/一句话生成/i)).toBeTruthy();
  });

  it('renders the screenshot image with the main.png src', () => {
    render(<Portfolio />);
    const img = screen.getByRole('img', { name: /whimsy demo screenshot/i });
    expect(img.getAttribute('src')).toContain('main.png');
  });

  it('has a link to the GitHub repo and a back link', () => {
    render(<Portfolio />);
    const ghLinks = screen.getAllByRole('link', { name: /github/i });
    expect(ghLinks.some((l) => (l.getAttribute('href') ?? '').includes('kevin12369/whimsy'))).toBe(true);
    expect(screen.getByRole('link', { name: /back to demo/i })).toBeTruthy();
  });
});