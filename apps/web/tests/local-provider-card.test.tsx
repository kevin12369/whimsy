import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocalProviderCard } from '../components/LocalProviderCard';

describe('LocalProviderCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders 5 fields (provider, baseUrl, model, apiKey, timeout)', () => {
    render(<LocalProviderCard />);
    expect(screen.getByLabelText('Provider')).toBeDefined();
    expect(screen.getByLabelText('Base URL preset')).toBeDefined();
    expect(screen.getByLabelText('Base URL', { selector: 'input' })).toBeDefined();
    expect(screen.getByLabelText('Local model')).toBeDefined();
    expect(screen.getByLabelText('Local API key (optional)')).toBeDefined();
    expect(screen.getByLabelText('Timeout (ms, 1000-120000)')).toBeDefined();
  });

  it('loads values from localStorage on mount', () => {
    localStorage.setItem('whimsy:local:provider', 'ollama');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:11434');
    localStorage.setItem('whimsy:local:model', 'llama3.1:8b');
    render(<LocalProviderCard />);
    const providerSel = screen.getByLabelText('Provider') as HTMLSelectElement;
    expect(providerSel.value).toBe('ollama');
    expect((screen.getByLabelText('Base URL', { selector: 'input' }) as HTMLInputElement).value).toBe('http://localhost:11434');
  });

  it('writes changes to localStorage on input', () => {
    render(<LocalProviderCard />);
    fireEvent.change(screen.getByLabelText('Local model'), { target: { value: 'qwen2.5-coder:7b' } });
    expect(localStorage.getItem('whimsy:local:model')).toBe('qwen2.5-coder:7b');
  });

  it('test connection button calls fetch + shows status', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('OK', { status: 200 }));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => {
      expect(screen.getByText(/connected/i)).toBeDefined();
    });
    expect(fetchSpy).toHaveBeenCalled();
  });
});
