import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBar, type Usage } from '../components/StatusBar';

const USAGE: Usage = { workers_ai: 1, deepseek: 2, gemini: 3, byok: 0, generations: 5, retries: 1 };

describe('StatusBar', () => {
  it('renders usage counters', () => {
    render(<StatusBar usage={USAGE} />);
    expect(screen.getByText(/Workers AI 1\/10000/)).toBeTruthy();
    expect(screen.getByText(/DeepSeek 2\/200/)).toBeTruthy();
    expect(screen.getByText(/Gemini 3\/60/)).toBeTruthy();
    expect(screen.getByText(/Games: 5/)).toBeTruthy();
    expect(screen.getByText(/Retries: 1/)).toBeTruthy();
  });
});
