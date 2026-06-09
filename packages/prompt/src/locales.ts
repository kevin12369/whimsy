import type { Genre, Locale } from './types';

export const USER_PROMPT_WRAPPERS: Record<Locale, (genre: Genre, text: string) => string> = {
  en: (genre, text) =>
    [
      `Genre: ${genre}.`,
      `Theme/feel: ${text}.`,
      'Requirements: keyboard controls, score display, game over screen with restart, all in one self-contained HTML file.',
    ].join('\n'),

  zh: (genre, text) =>
    [
      `题材: ${genre}。`,
      `主题/感觉: ${text}。`,
      '要求: 键盘控制、分数显示、含重新开始的 game over 界面,全部放在一个自包含的 HTML 文件中。',
    ].join('\n'),
};

export function wrapUserPrompt(locale: Locale, genre: Genre, text: string): string {
  return USER_PROMPT_WRAPPERS[locale](genre, text);
}
