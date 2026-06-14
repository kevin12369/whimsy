import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Features } from '../components/Features';

describe('Features section', () => {
  it('renders 4 feature cards (templates / share / denylist / recording)', () => {
    render(<Features />);
    for (const id of [
      'feature-card-templates',
      'feature-card-share',
      'feature-card-denylist',
      'feature-card-recording',
    ]) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
  });

  it('renders the section heading + subtitle', () => {
    render(<Features />);
    const heading = screen.getByRole('heading', { name: /Whimsy v2 真差异化/ });
    expect(heading).toBeTruthy();
  });
});
