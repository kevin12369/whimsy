import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsDrawer } from '../components/SettingsDrawer';

describe('SettingsDrawer', () => {
  it('lists 4 model options', () => {
    render(<SettingsDrawer open onClose={() => {}} />);
    const sel = screen.getByLabelText(/model/i) as HTMLSelectElement;
    expect(sel.options.length).toBe(4);
  });

  it('saves model and key to localStorage on change', () => {
    localStorage.clear();
    render(<SettingsDrawer open onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText(/model/i), { target: { value: 'deepseek-coder-v2' } });
    fireEvent.change(screen.getByLabelText(/api key/i), { target: { value: 'sk-x' } });
    expect(localStorage.getItem('whimsy:model')).toBe('deepseek-coder-v2');
    expect(localStorage.getItem('whimsy:apikey')).toBe('sk-x');
  });
});
