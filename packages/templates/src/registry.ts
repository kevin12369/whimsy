import type { Template } from './types';
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

export function getAllTemplates(): Record<string, Template[]> {
  return {
    platformer: PLATFORMER_TEMPLATES,
    shooter: SHOOTER_TEMPLATES,
    puzzle: PUZZLE_TEMPLATES,
  };
}
