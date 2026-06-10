import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsDrawer } from '../components/SettingsDrawer';

describe('SettingsDrawer', () => {
  it('lists 4 model options', () => {
    render(<SettingsDrawer open onClose={() => {}} />);
    const sel = screen.getByLabelText('Model') as HTMLSelectElement;
    expect(sel.options.length).toBe(4);
  });

  it('saves model and key to localStorage on change', () => {
    localStorage.clear();
    render(<SettingsDrawer open onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'deepseek-coder-v2' } });
    fireEvent.change(screen.getByLabelText('API key (only stored in this browser)'), { target: { value: 'sk-x' } });
    expect(localStorage.getItem('whimsy:model')).toBe('deepseek-coder-v2');
    expect(localStorage.getItem('whimsy:apikey')).toBe('sk-x');
  });

  it('renders LocalProviderCard section', () => {
    render(<SettingsDrawer open onClose={() => {}} />);
    expect(screen.getByText(/local llm/i)).toBeDefined();
  });
});
