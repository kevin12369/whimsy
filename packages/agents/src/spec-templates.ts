import type { GameSpec } from '@whimsy/runtime';

export const SPEC_FEW_SHOT_EXAMPLES: GameSpec[] = [
  {
    meta: { name: 'Asteroid Field', flavor: 'A comet dodging asteroids on a flat plain', templateHint: 'platformer' },
    mechanics: { gravity: 900, jumpVelocity: 460, moveSpeed: 220, enemySpeed: 80 },
    art: {
      palette: { primary: '#3aa6ff', secondary: '#ffffff', enemy: '#ff6b6b', bg: '#02030a' },
      style: 'geometric',
    },
    level: { concept: 'flat', enemyCount: 2, starCount: 1 },
  },
  {
    meta: { name: 'Cosmic Cliffs', flavor: 'Climb ascending platforms in space', templateHint: 'platformer' },
    mechanics: { gravity: 1000, jumpVelocity: 500, moveSpeed: 240, enemySpeed: 100 },
    art: {
      palette: { primary: '#8b5cf6', secondary: '#fbbf24', enemy: '#ef4444', bg: '#1a0a2e' },
      style: 'rounded',
    },
    level: { concept: 'stairs', enemyCount: 3, starCount: 2 },
  },
  {
    meta: { name: 'Quantum Gap', flavor: 'Jump across a chasm between two platforms', templateHint: 'platformer' },
    mechanics: { gravity: 800, jumpVelocity: 550, moveSpeed: 280, enemySpeed: 120 },
    art: {
      palette: { primary: '#10b981', secondary: '#fafafa', enemy: '#f59e0b', bg: '#0a0a0a' },
      style: 'pixel',
    },
    level: { concept: 'gap', enemyCount: 2, starCount: 3 },
  },
  {
    meta: { name: 'Nebula Heart', flavor: 'Face the final boss in the nebula', templateHint: 'platformer' },
    mechanics: { gravity: 950, jumpVelocity: 480, moveSpeed: 230, enemySpeed: 150 },
    art: {
      palette: { primary: '#ec4899', secondary: '#fcd34d', enemy: '#dc2626', bg: '#1c0a1c' },
      style: 'geometric',
    },
    level: { concept: 'boss', enemyCount: 1, starCount: 1 },
  },
  {
    meta: { name: 'Pixel Pond', flavor: 'A retro platformer on a quiet pond', templateHint: 'platformer' },
    mechanics: { gravity: 850, jumpVelocity: 420, moveSpeed: 200, enemySpeed: 60 },
    art: {
      palette: { primary: '#06b6d4', secondary: '#fef3c7', enemy: '#84cc16', bg: '#022c22' },
      style: 'pixel',
    },
    level: { concept: 'flat', enemyCount: 3, starCount: 4 },
  },
];
