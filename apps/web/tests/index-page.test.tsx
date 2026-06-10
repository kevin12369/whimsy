import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn(), query: {}, pathname: '/' }),
}));

vi.mock('../lib/api-client', () => ({
  generate: vi.fn(),
  listGames: vi.fn().mockResolvedValue({ games: [] }),
}));

describe('Home page', () => {
  it('renders the title and the InputForm', async () => {
    render(<Home />);
    expect(screen.getByText(/Whimsy/)).toBeTruthy();
    expect(screen.getByPlaceholderText(/describe/i)).toBeTruthy();
  });
});
