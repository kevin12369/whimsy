import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadges } from '../components/StatusBadges';

describe('StatusBadges section', () => {
  it('renders the 8 shields.io badges (CI / Tests / CodeQL / CSP / 15 templates / Try sample / /g/ share / MIT)', () => {
    render(<StatusBadges />);
    for (const id of [
      'badge-ci',
      'badge-tests',
      'badge-codeql',
      'badge-csp',
      'badge-templates',
      'badge-try-sample',
      'badge-share',
      'badge-mit',
    ]) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
  });

  it('links the CI badge to the GitHub Actions run page', () => {
    render(<StatusBadges />);
    const img = screen.getByTestId('badge-ci');
    const anchor = img.closest('a');
    expect(anchor?.getAttribute('href')).toContain('github.com/kevin12369/whimsy/actions');
  });
});
