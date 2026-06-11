import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemePanel } from '../components/ThemePanel';
import { defaultTheme, type Theme } from '../lib/theme';

describe('ThemePanel', () => {
  it('renders 5 inputs (primary, secondary, playerLabel, enemyLabel, flavorText)', () => {
    render(<ThemePanel theme={defaultTheme} onChange={() => {}} />);
    expect(screen.getByLabelText(/primary/i)).toBeTruthy();
    expect(screen.getByLabelText(/secondary/i)).toBeTruthy();
    expect(screen.getByLabelText(/player label/i)).toBeTruthy();
    expect(screen.getByLabelText(/enemy label/i)).toBeTruthy();
    expect(screen.getByLabelText(/flavor text/i)).toBeTruthy();
  });

  it('calls onChange when primary color changes', () => {
    const onChange = vi.fn();
    render(<ThemePanel theme={defaultTheme} onChange={onChange} />);
    const primary = screen.getByLabelText(/primary/i) as HTMLInputElement;
    fireEvent.change(primary, { target: { value: '#ff00aa' } });
    expect(onChange).toHaveBeenCalledWith({ primary: '#ff00aa' });
  });

  it('calls onChange when player label changes', () => {
    const onChange = vi.fn();
    render(<ThemePanel theme={defaultTheme} onChange={onChange} />);
    const input = screen.getByLabelText(/player label/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'wizard' } });
    expect(onChange).toHaveBeenCalledWith({ playerLabel: 'wizard' });
  });

  it('has a reset button that calls onChange with defaultTheme-equivalent patch', () => {
    const onChange = vi.fn();
    const current: Theme = { primary: '#111', secondary: '#222', playerLabel: 'x', enemyLabel: 'y', flavorText: 'z' };
    render(<ThemePanel theme={current} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onChange).toHaveBeenCalledWith(defaultTheme);
  });
});
