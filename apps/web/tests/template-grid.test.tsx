import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateGrid } from '../components/TemplateGrid';
import type { Template } from '@whimsy/templates';

const fakeTemplates: Template[] = Array.from({ length: 5 }, (_, i) => ({
  id: `tpl-${i}`,
  genre: 'platformer',
  name: `Template ${i}`,
  defaultTheme: { primary: '#000', secondary: '#fff', playerLabel: 'p', enemyLabel: 'e', flavorText: '' },
  render: () => '<!DOCTYPE html><html></html>',
}));

describe('TemplateGrid', () => {
  it('renders 1 thumbnail per template, excluding the current one', () => {
    render(
      <TemplateGrid
        templates={fakeTemplates}
        currentId="tpl-0"
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Template 1')).toBeTruthy();
    expect(screen.getByText('Template 4')).toBeTruthy();
    // tpl-0 is the current one, must NOT appear
    expect(screen.queryByText('Template 0')).toBeNull();
  });

  it('calls onSelect with the template id when thumbnail clicked', () => {
    const onSelect = vi.fn();
    render(
      <TemplateGrid
        templates={fakeTemplates}
        currentId="tpl-0"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('Template 2'));
    expect(onSelect).toHaveBeenCalledWith('tpl-2');
  });

  it('shows genre badge on each thumbnail', () => {
    render(
      <TemplateGrid
        templates={fakeTemplates}
        currentId="tpl-0"
        onSelect={vi.fn()}
      />,
    );
    const badges = screen.getAllByText('platformer');
    expect(badges.length).toBe(4); // 5 templates minus the current one
  });
});
