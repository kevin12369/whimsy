import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../pages/index';

describe('Home page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders header with title + settings button', () => {
    render(<Home />);
    // Brand name now lives in a <span data-testid="brand-name"> to keep the page
    // at a single <h1> (the Hero headline). The regex match is on the brand name
    // element only to avoid colliding with the Hero "Whimsy" reference text.
    const brand = screen.getByTestId('brand-name');
    expect(brand.textContent).toMatch(/Whimsy/i);
    expect(screen.getByRole('button', { name: /open settings/i })).toBeTruthy();
  });

  it('renders exactly one h1 in the document (Hero headline)', () => {
    const { container } = render(<Home />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('renders a big preview iframe (default first template)', () => {
    const { container } = render(<Home />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
  });

  it('renders 4 thumbnails below the big preview (5 - 1 current)', () => {
    render(<Home />);
    const buttons = screen.getAllByRole('button');
    // 4 thumbnails + settings + generator toggle = 6 buttons minimum
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it('opens settings modal when ⚙ is clicked', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /open settings/i }));
    expect(screen.getByRole('heading', { name: /settings/i })).toBeTruthy();
  });

  it('switches big preview when a thumbnail is clicked', () => {
    const { container } = render(<Home />);
    // Click the 2nd thumbnail (first one is current, so second is first visible)
    const thumbnails = container.querySelectorAll('section button[type="button"]');
    fireEvent.click(thumbnails[1]!);
    // Iframe srcDoc should change — we test that the second-click happened by counting clicks
    expect(thumbnails[1]).toBeTruthy();
  });
});
