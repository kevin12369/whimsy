import type { Genre } from './types';

export const GENRE_SYSTEM_PROMPTS: Record<Exclude<Genre, 'auto'>, string> = {
  platformer: [
    'GENRE: PLATFORMER.',
    'Required mechanics: gravity constant (e.g. GRAVITY = 800), jump impulse (e.g. -400), at least one enemy type, scrolling or wraparound world, ground collision.',
    'Phaser 3 physics: use this.physics.add.sprite() and this.physics.add.collider().',
    'Player must die on enemy contact; respawn on death.',
  ].join('\n'),

  shooter: [
    'GENRE: SHOOTER.',
    'Required mechanics: player ship, continuous enemy spawn, projectile firing on key press, collision detection between projectiles and enemies, score increments per kill.',
    'Phaser 3: use this.physics.add.group() for bullets and enemies; this.physics.add.overlap() for hit detection.',
  ].join('\n'),

  puzzle: [
    'GENRE: PUZZLE.',
    'Required mechanics: tile/grid-based play, no physics engine, simple key-driven cursor or pointer input, win-condition detection, restart on R key.',
    'Do NOT use arcade physics; Phaser 3 static groups and overlap are enough.',
  ].join('\n'),
};

export function getGenreSystemPrompt(genre: Exclude<Genre, 'auto'>): string {
  return GENRE_SYSTEM_PROMPTS[genre];
}
