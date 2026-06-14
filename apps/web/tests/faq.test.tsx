import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FAQ } from '../components/FAQ';

describe('FAQ section', () => {
  it('renders 5 Whimsy-specific Q&A items', () => {
    render(<FAQ />);
    for (const id of [
      'faq-llm-required',
      'faq-3-vs-15',
      'faq-share-safety',
      'faq-vs-rosebud',
      'faq-contribute',
    ]) {
      expect(screen.getByTestId(`faq-item-${id}`)).toBeTruthy();
    }
  });

  it('uses native <details> for SSR-friendly accordion behavior', () => {
    const { container } = render(<FAQ />);
    const details = container.querySelectorAll('details');
    expect(details.length).toBe(5);
  });

  it('Q1 answer clarifies that LLM is optional', () => {
    render(<FAQ />);
    expect(screen.getByTestId('faq-answer-faq-llm-required').textContent).toMatch(/不需要/);
  });
});
