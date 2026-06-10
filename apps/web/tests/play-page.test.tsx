import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Play from '../pages/play/[id]';

vi.mock('next/router', () => ({ useRouter: () => ({ query: { id: 'abc' } }) }));
vi.mock('../lib/api-client', () => ({
  getGame: vi.fn().mockResolvedValue({ id: 'abc', prompt: 'p', genre: 'platformer', attempts: 1, created_at: 1, url: '/g/abc' }),
  reportError: vi.fn(),
}));

describe('Play page', () => {
  it('renders a GameViewer with the id from the route', async () => {
    render(<Play />);
    const iframe = await screen.findByTitle('game');
    expect((iframe as HTMLIFrameElement).src).toContain('/g/abc');
  });
});
