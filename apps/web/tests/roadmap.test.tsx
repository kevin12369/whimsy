import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Roadmap } from '../components/Roadmap';

describe('Roadmap section', () => {
  it('renders 3 phase items (v1 / v2 / v3)', () => {
    render(<Roadmap />);
    for (const id of ['v1', 'v2', 'v3']) {
      expect(screen.getByTestId(`roadmap-phase-${id}`)).toBeTruthy();
    }
  });

  it('marks v1 as done and v2 as in-progress', () => {
    render(<Roadmap />);
    expect(screen.getByTestId('roadmap-status-done').textContent).toMatch(/Done/i);
    expect(screen.getByTestId('roadmap-status-in-progress').textContent).toMatch(/In progress/i);
    expect(screen.getByTestId('roadmap-status-planned').textContent).toMatch(/Planned/i);
  });
});
