import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhoIsItFor } from '../components/WhoIsItFor';

describe('WhoIsItFor section', () => {
  it('renders exactly 3 persona cards (indie / hackathon / teaching)', () => {
    render(<WhoIsItFor />);
    expect(screen.getByTestId('who-card-indie')).toBeTruthy();
    expect(screen.getByTestId('who-card-hackathon')).toBeTruthy();
    expect(screen.getByTestId('who-card-teaching')).toBeTruthy();
  });

  it('each persona card carries a title + quote + scenarios + value', () => {
    render(<WhoIsItFor />);
    const cards = screen.getAllByTestId(/^who-card-(indie|hackathon|teaching)$/);
    expect(cards.length).toBe(3);
    for (const card of cards) {
      expect(card.querySelector('[data-testid="who-card-title"]')).toBeTruthy();
      expect(card.querySelector('[data-testid="who-card-quote"]')).toBeTruthy();
      expect(card.querySelector('[data-testid="who-card-scenarios"]')).toBeTruthy();
      expect(card.querySelector('[data-testid="who-card-value"]')).toBeTruthy();
    }
  });
});
