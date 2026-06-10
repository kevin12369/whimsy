import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast } from '../components/Toast';

describe('Toast', () => {
  it('renders the message when shown', () => {
    render(<Toast message="hi" />);
    expect(screen.getByText('hi')).toBeTruthy();
  });

  it('renders nothing when message is null', () => {
    const { container } = render(<Toast message={null} />);
    expect(container.firstChild).toBeNull();
  });
});
