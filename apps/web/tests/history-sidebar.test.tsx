import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistorySidebar } from '../components/HistorySidebar';

const GAMES = [
  { id: 'a', prompt: 'mario in space', genre: 'platformer', attempts: 1, created_at: 1700000000000, url: '/g/a' },
];

describe('HistorySidebar', () => {
  it('renders a list of games', () => {
    render(<HistorySidebar games={GAMES} />);
    expect(screen.getByText(/mario in space/)).toBeTruthy();
  });

  it('shows empty state when no games', () => {
    render(<HistorySidebar games={[]} />);
    expect(screen.getByText(/no games yet/i)).toBeTruthy();
  });
});
