import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GamePreview } from '../components/GamePreview';
import type { Template } from '@whimsy/templates';

const fakeTemplate: Template = {
  id: 'test-template',
  genre: 'platformer',
  name: 'Test',
  defaultTheme: { primary: '#000', secondary: '#fff', playerLabel: 'p', enemyLabel: 'e', flavorText: '' },
  render: (theme) => `<!DOCTYPE html><html><body style="background:${theme.primary}">test ${theme.playerLabel}</body></html>`,
};

describe('GamePreview', () => {
  it('renders a sandboxed iframe with srcdoc containing the rendered HTML', () => {
    const { container } = render(
      <GamePreview template={fakeTemplate} theme={{ primary: '#ff0000', secondary: '#fff', playerLabel: 'hero', enemyLabel: 'bad', flavorText: '' }} />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
    expect(iframe?.getAttribute('srcdoc')).toContain('#ff0000');
    expect(iframe?.getAttribute('srcdoc')).toContain('hero');
  });

  it('re-renders when theme changes', () => {
    const { container, rerender } = render(
      <GamePreview template={fakeTemplate} theme={{ primary: '#111111', secondary: '#fff', playerLabel: 'a', enemyLabel: 'b', flavorText: '' }} />,
    );
    rerender(
      <GamePreview template={fakeTemplate} theme={{ primary: '#222222', secondary: '#fff', playerLabel: 'a', enemyLabel: 'b', flavorText: '' }} />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('srcdoc')).toContain('#222222');
  });

  it('title attribute identifies the template', () => {
    render(
      <GamePreview template={fakeTemplate} theme={{ primary: '#000', secondary: '#fff', playerLabel: 'p', enemyLabel: 'e', flavorText: '' }} />,
    );
    const iframe = screen.getByTitle('Test');
    expect(iframe).toBeTruthy();
  });
});
