import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrySampleButton } from '../components/TrySampleButton';

describe('TrySampleButton', () => {
  it('renders 3 sample chips', () => {
    render(<TrySampleButton onSelect={vi.fn()} />);
    expect(screen.getByLabelText(/Try sample: 平台跳跃/)).toBeTruthy();
    expect(screen.getByLabelText(/Try sample: 纵版射击/)).toBeTruthy();
    expect(screen.getByLabelText(/Try sample: 同色连线/)).toBeTruthy();
  });

  it('calls onSelect with the sample id when a chip is clicked', () => {
    const onSelect = vi.fn();
    render(<TrySampleButton onSelect={onSelect} />);
    fireEvent.click(screen.getByLabelText(/Try sample: 平台跳跃/));
    expect(onSelect).toHaveBeenCalledWith('mario-comet');
  });
});