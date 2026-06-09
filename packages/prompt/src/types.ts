export type Genre = 'platformer' | 'shooter' | 'puzzle' | 'auto';
export type Locale = 'en' | 'zh';

export interface PromptInput {
  text: string;
  genre: Genre;
  locale: Locale;
}

export interface PromptOutput {
  system: string;
  user: string;
  expectedSizeHint: number;
}
