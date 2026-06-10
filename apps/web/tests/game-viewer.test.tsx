import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameViewer } from '../components/GameViewer';

describe('GameViewer', () => {
  it('renders an iframe with sandbox="allow-scripts" (no allow-same-origin)', () => {
    render(<GameViewer id="abc" />);
    const iframe = screen.getByTitle('game') as HTMLIFrameElement;
    expect(iframe.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin');
    expect(iframe.src).toContain('/g/abc');
  });

  it('displays "did not start" status when prop is set', () => {
    render(<GameViewer id="abc" status="failed" />);
    expect(screen.getByText(/did not start/i)).toBeTruthy();
  });
});
