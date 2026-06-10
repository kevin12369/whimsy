import type { Genre } from '@whimsy/prompt';

export interface Theme {
  primary: string;     // hex color, e.g. '#3aa6ff'
  secondary: string;
  playerLabel: string; // e.g. 'comet', 'train', 'ship'
  enemyLabel: string;
  flavorText: string;
}

export interface Template {
  id: string;
  genre: Exclude<Genre, 'auto'>;
  name: string;
  defaultTheme: Theme;
  render: (theme: Theme) => string; // returns complete HTML
}
