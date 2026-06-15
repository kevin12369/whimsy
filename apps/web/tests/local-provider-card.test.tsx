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

  it('test connection with LM Studio (openai-compatible + /v1) hits /v1/models', async () => {
    localStorage.setItem('whimsy:local:provider', 'openai-compatible');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:1234/v1');
    localStorage.setItem('whimsy:local:model', 'qwen2.5-coder:7b');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/connected/i)).toBeDefined());
    const calledUrl = fetchSpy.mock.calls[0]![0] as string;
    expect(calledUrl).toBe('http://localhost:1234/v1/models');
  });

  it('test connection with openai-compatible + baseUrl missing /v1 prepends /v1', async () => {
    localStorage.setItem('whimsy:local:provider', 'openai-compatible');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:1234');
    localStorage.setItem('whimsy:local:model', 'm');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/connected/i)).toBeDefined());
    const calledUrl = fetchSpy.mock.calls[0]![0] as string;
    expect(calledUrl).toBe('http://localhost:1234/v1/models');
  });

  it('test connection with ollama hits /api/tags, never /v1', async () => {
    localStorage.setItem('whimsy:local:provider', 'ollama');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:11434');
    localStorage.setItem('whimsy:local:model', 'llama3.1:8b');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/connected/i)).toBeDefined());
    const calledUrl = fetchSpy.mock.calls[0]![0] as string;
    expect(calledUrl).toBe('http://localhost:11434/api/tags');
  });

  it('test connection strips trailing slash on baseUrl', async () => {
    localStorage.setItem('whimsy:local:provider', 'openai-compatible');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:1234/v1/');
    localStorage.setItem('whimsy:local:model', 'm');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/connected/i)).toBeDefined());
    const calledUrl = fetchSpy.mock.calls[0]![0] as string;
    expect(calledUrl).toBe('http://localhost:1234/v1/models');
  });

  it('test connection falls back to no-cors when normal fetch throws (mixed-content / CORS)', async () => {
    localStorage.setItem('whimsy:local:provider', 'openai-compatible');
    localStorage.setItem('whimsy:local:baseUrl', 'http://127.0.0.1:1234/v1');
    localStorage.setItem('whimsy:local:model', 'm');
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/network reachable/i)).toBeDefined());
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const fallbackCall = fetchSpy.mock.calls[1]!;
    const fallbackUrl = fallbackCall[0] as string;
    const fallbackInit = fallbackCall[1] as RequestInit;
    expect(fallbackUrl).toBe('http://127.0.0.1:1234/v1/models');
    expect(fallbackInit.mode).toBe('no-cors');
  });

  it('test connection reports Unreachable when both normal and no-cors fetch fail', async () => {
    localStorage.setItem('whimsy:local:provider', 'ollama');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:11434');
    localStorage.setItem('whimsy:local:model', 'm');
    vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new DOMException('Aborted', 'TimeoutError'));
    render(<LocalProviderCard />);
    fireEvent.click(screen.getByRole('button', { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/unreachable/i)).toBeDefined());
  });
});
