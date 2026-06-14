import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CopyShareLinkButton } from '../components/CopyShareLinkButton';

describe('CopyShareLinkButton', () => {
  beforeEach(() => {
    // Reset mock between tests
    vi.restoreAllMocks();
  });

  it('renders the default label', () => {
    render(<CopyShareLinkButton url="https://example.com/g/?#g=zz" />);
    expect(screen.getByRole('button', { name: /Copy share link/i })).toBeTruthy();
  });

  it('uses navigator.clipboard.writeText when available and shows Copied!', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyShareLinkButton url="https://example.com/g/?#g=zz" />);
    fireEvent.click(screen.getByRole('button', { name: /Copy share link/i }));
    expect(writeText).toHaveBeenCalledWith('https://example.com/g/?#g=zz');
    expect(await screen.findByText(/Copied!/)).toBeTruthy();
  });

  it('falls back to document.execCommand when clipboard API missing', () => {
    const oldClipboard = (navigator as { clipboard?: unknown }).clipboard;
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    // jsdom does not implement document.execCommand — stub it directly.
    const originalExec = document.execCommand;
    (document as unknown as { execCommand: (cmd: string) => boolean }).execCommand = vi.fn().mockReturnValue(true);
    render(<CopyShareLinkButton url="https://example.com/g/?#g=zz" />);
    fireEvent.click(screen.getByRole('button', { name: /Copy share link/i }));
    expect((document as unknown as { execCommand: ReturnType<typeof vi.fn> }).execCommand).toHaveBeenCalledWith('copy');
    (document as unknown as { execCommand: typeof originalExec }).execCommand = originalExec;
    if (oldClipboard !== undefined) {
      Object.defineProperty(navigator, 'clipboard', { value: oldClipboard, configurable: true });
    }
  });
});