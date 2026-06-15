import type { Genre } from '@whimsy/prompt';

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
  howToPlay: string;          // NEW — HUD control hint, e.g. '← → move · ↑/SPACE jump · reach the flag'
  defaultTheme: Theme;
  render: (theme: Theme) => string;
}
