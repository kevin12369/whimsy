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

  it('renders expanded by default when defaultExpanded=true (PR #5)', () => {
    render(<InputForm onSubmit={vi.fn()} defaultExpanded />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeTruthy();
  });

  it('shows 3 sample chips that prefill the textbox when clicked', () => {
    render(<InputForm onSubmit={vi.fn()} defaultExpanded />);
    fireEvent.click(screen.getByRole('button', { name: /Use sample: 平台跳跃/ }));
    const input = screen.getByPlaceholderText(/describe/i) as HTMLInputElement;
    expect(input.value).toContain('马里奥');
  });

  it('initialText prefills the textbox', () => {
    render(<InputForm onSubmit={vi.fn()} defaultExpanded initialText="hello world" />);
    const input = screen.getByPlaceholderText(/describe/i) as HTMLInputElement;
    expect(input.value).toBe('hello world');
  });
});