import type { Template, Theme } from './types';
import type { Genre } from '@whimsy/prompt';
import { PLATFORMER_TEMPLATES } from './platformer';
import { SHOOTER_TEMPLATES } from './shooter';
import { PUZZLE_TEMPLATES } from './puzzle';

export const TEMPLATES: Template[] = [
  ...PLATFORMER_TEMPLATES,
  ...SHOOTER_TEMPLATES,
  ...PUZZLE_TEMPLATES,
];

const BY_ID = new Map(TEMPLATES.map(t => [t.id, t]));

export function getTemplate(id: string): Template | undefined {
  return BY_ID.get(id);
}

export type TemplatesByGenre = Record<Exclude<Genre, 'auto'>, Template[]>;

export function getAllTemplates(): TemplatesByGenre {
  return {
    platformer: PLATFORMER_TEMPLATES,
    shooter: SHOOTER_TEMPLATES,
    puzzle: PUZZLE_TEMPLATES,
  };
}
