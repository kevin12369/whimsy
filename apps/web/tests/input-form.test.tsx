import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { InputForm } from '../components/InputForm';

vi.mock('@testing-library/react', async () => {
  const actual = await vi.importActual<any>('@testing-library/react');
  return { ...actual };
});

describe('InputForm', () => {
  it('renders a text input and a submit button', () => {
    render(<InputForm onSubmit={async () => {}} />);
    expect(screen.getByPlaceholderText(/describe/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /generate/i })).toBeTruthy();
  });

  it('calls onSubmit with text and genre', async () => {
    const cb = vi.fn().mockResolvedValue(undefined);
    render(<InputForm onSubmit={cb} />);
    fireEvent.change(screen.getByPlaceholderText(/describe/i), { target: { value: 'mario in space' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(cb).toHaveBeenCalled();
    const arg = cb.mock.calls[0]?.[0];
    expect(arg.text).toBe('mario in space');
  });

  it('includes local fields in payload when whimsy:useLocal=true', async () => {
    localStorage.clear();
    localStorage.setItem('whimsy:useLocal', 'true');
    localStorage.setItem('whimsy:local:provider', 'ollama');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:11434');
    localStorage.setItem('whimsy:local:model', 'llama3.1:8b');
    let captured: any;
    const cb = vi.fn().mockImplementation(async (p: any) => { captured = p; });
    render(<InputForm onSubmit={cb} />);
    fireEvent.change(screen.getByPlaceholderText(/describe/i), { target: { value: 'space mario' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    expect(cb).toHaveBeenCalled();
    expect(captured).toBeDefined();
    expect(captured.model).toBe('ollama');
    expect(captured.localBaseUrl).toBe('http://localhost:11434');
    expect(captured.localModel).toBe('llama3.1:8b');
  });
});
