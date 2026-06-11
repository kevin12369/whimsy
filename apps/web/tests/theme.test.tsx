import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, defaultTheme, type Theme } from '../lib/theme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaultTheme when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toEqual(defaultTheme);
  });

  it('loads theme from localStorage on mount', () => {
    const stored: Theme = {
      primary: '#ff00ff', secondary: '#00ff00',
      playerLabel: 'cat', enemyLabel: 'mouse', flavorText: 'cat vs mouse',
    };
    localStorage.setItem('whimsy:theme:v1', JSON.stringify(stored));
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toEqual(stored);
  });

  it('setTheme updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    const next: Partial<Theme> = { primary: '#abc123' };
    act(() => result.current.setTheme(next));
    expect(result.current.theme.primary).toBe('#abc123');
    const stored = JSON.parse(localStorage.getItem('whimsy:theme:v1')!);
    expect(stored.primary).toBe('#abc123');
  });

  it('resetTheme restores defaults', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme({ primary: '#000000' }));
    act(() => result.current.resetTheme());
    expect(result.current.theme).toEqual(defaultTheme);
  });
});
