import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';
import { defaultTheme } from '../lib/theme';

describe('SettingsModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <SettingsModal open={false} onClose={() => {}} theme={defaultTheme} onThemeChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal with Theme and Local LLM sections when open', () => {
    render(
      <SettingsModal open={true} onClose={() => {}} theme={defaultTheme} onThemeChange={() => {}} />,
    );
    expect(screen.getByRole('heading', { level: 3, name: /theme/i })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /local llm/i })).toBeTruthy();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <SettingsModal open={true} onClose={onClose} theme={defaultTheme} onThemeChange={() => {}} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /close|×|✕/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('passes theme changes through onThemeChange', () => {
    const onThemeChange = vi.fn();
    render(
      <SettingsModal open={true} onClose={() => {}} theme={defaultTheme} onThemeChange={onThemeChange} />,
    );
    const primary = screen.getByLabelText(/primary/i) as HTMLInputElement;
    fireEvent.change(primary, { target: { value: '#abc' } });
    expect(onThemeChange).toHaveBeenCalledWith({ primary: '#abc' });
  });
});
