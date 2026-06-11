import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InputForm } from '../components/InputForm';

describe('InputForm', () => {
  it('renders an input + a generate button', () => {
    render(<InputForm onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText(/describe/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /generate/i })).toBeTruthy();
  });

  it('calls onSubmit with trimmed text on submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<InputForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText(/describe/i), { target: { value: '  space mario  ' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ text: 'space mario' }));
  });

  it('includes local fields when whimsy:useLocal=true', async () => {
    localStorage.setItem('whimsy:useLocal', 'true');
    localStorage.setItem('whimsy:local:provider', 'ollama');
    localStorage.setItem('whimsy:local:baseUrl', 'http://localhost:11434');
    localStorage.setItem('whimsy:local:model', 'llama3.1:8b');
    let captured: any;
    render(<InputForm onSubmit={async (p) => { captured = p; }} />);
    fireEvent.change(screen.getByPlaceholderText(/describe/i), { target: { value: 'space mario' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => expect(captured).toBeDefined());
    expect(captured.model).toBe('ollama');
    expect(captured.localBaseUrl).toBe('http://localhost:11434');
    expect(captured.localModel).toBe('llama3.1:8b');
  });

  it('button is disabled when text is empty', () => {
    render(<InputForm onSubmit={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /generate/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
