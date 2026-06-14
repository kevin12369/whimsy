import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RunLocally } from '../components/RunLocally';

describe('RunLocally section', () => {
  it('renders the 3 install commands in a terminal block', () => {
    render(<RunLocally />);
    const terminal = screen.getByTestId('run-locally-terminal');
    expect(terminal.textContent).toContain('git clone');
    expect(terminal.textContent).toContain('pnpm install');
    expect(terminal.textContent).toContain('pnpm dev:web');
  });

  it('renders the 4 requirements (Node / pnpm / LLM optional / 8GB+ optional)', () => {
    render(<RunLocally />);
    const items = screen.getAllByTestId('run-locally-requirement');
    expect(items.length).toBe(4);
  });

  it('renders a docs link pointing at RUN-LOCALLY.md on the GitHub repo', () => {
    render(<RunLocally />);
    const link = screen.getByTestId('run-locally-docs-link');
    expect(link.getAttribute('href')).toContain('github.com/kevin12369/whimsy');
    expect(link.getAttribute('href')).toContain('RUN-LOCALLY.md');
  });
});
