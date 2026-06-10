import { PLATFORMER_TEMPLATES, SHOOTER_TEMPLATES, PUZZLE_TEMPLATES } from '@whimsy/templates';
import type { Genre, Theme } from '@whimsy/prompt';
import type { Template } from '@whimsy/templates';

const DEFAULT_THEME: Theme = {
  primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'player', enemyLabel: 'enemy', flavorText: '',
};

export function pickFallbackTemplate(genre: Genre): Template {
  if (genre === 'shooter') return SHOOTER_TEMPLATES[0]!;
  if (genre === 'puzzle') return PUZZLE_TEMPLATES[0]!;
  return PLATFORMER_TEMPLATES[0]!;
}

export function buildFallbackHtml(genre: Genre): { html: string; attempts: number } {
  const tpl = pickFallbackTemplate(genre);
  return { html: tpl.render(DEFAULT_THEME), attempts: 0 };
}
