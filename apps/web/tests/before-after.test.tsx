import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeforeAfter } from '../components/BeforeAfter';

describe('BeforeAfter section', () => {
  it('renders a Before (v1) column describing the spread-clone problem', () => {
    render(<BeforeAfter />);
    expect(screen.getByTestId('before-after-before')).toBeTruthy();
    expect(screen.getByTestId('before-after-before-label').textContent).toMatch(/Before/i);
    expect(screen.getByTestId('before-after-before-list').textContent).toMatch(/spread 克隆/);
  });

  it('renders an After (v2) column describing the Whimsy v2 distinct-mechanic fix', () => {
    render(<BeforeAfter />);
    expect(screen.getByTestId('before-after-after')).toBeTruthy();
    expect(screen.getByTestId('before-after-after-label').textContent).toMatch(/After/i);
    expect(screen.getByTestId('before-after-after-list').textContent).toMatch(/12 API 黑名单/);
  });
});
