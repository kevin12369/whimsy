import type { Genre } from '@whimsy/prompt';
import type { GameConfig } from './game-config';

export interface Theme {
  primary: string;
  secondary: string;
  playerLabel: string;
  enemyLabel: string;
  flavorText: string;
}

export interface Template {
  id: string;
  genre: Exclude<Genre, 'auto'>;
  name: string;
  howToPlay: string;
  defaultTheme: Theme;
  /** Field names this template reads from GameConfig. Used for documentation. */
  consumes: readonly (keyof GameConfig)[];
  /** Per-field [min, max] for clamping. */
  clamp: Partial<Record<keyof GameConfig, [number, number]>>;
  render: (theme: Theme, gameConfig: GameConfig) => string;
}
