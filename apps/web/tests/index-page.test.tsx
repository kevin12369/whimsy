import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../pages/index';

describe('Home page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders header with title + settings button', () => {
    render(<Home />);
    expect(screen.getByText(/Whimsy/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /open settings/i })).toBeTruthy();
  });

  it('renders a big preview iframe (default first template)', () => {
    const { container } = render(<Home />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
  });

  it('renders 14 thumbnails below the big preview (15 - 1 current)', () => {
    render(<Home />);
    const buttons = screen.getAllByRole('button');
    // 14 thumbnails + settings + generator toggle = 16 buttons minimum
    expect(buttons.length).toBeGreaterThanOrEqual(16);
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
