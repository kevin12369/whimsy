import type { Genre, PromptInput, PromptOutput } from './types';
import { getGenreSystemPrompt } from './genres';
import { wrapUserPrompt } from './locales';

const MAX_USER_TEXT = 500;
const MAX_OUTPUT_BYTES = 200 * 1024;
const TYPICAL_OUTPUT_BYTES = 50 * 1024;

const BASE_SYSTEM_PROMPT = [
  'You generate a single self-contained HTML5 file.',
  'Use Phaser 3 from CDN: https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js',
  'No external assets, no images, no audio files — draw colored rectangles/circles or use text only.',
  'Output ONLY the HTML. No markdown fencing, no commentary, no explanation.',
  'Hard rules:',
  '- The output must start with <!DOCTYPE html> and end with </html>.',
  '- Must include a <canvas> element OR `new Phaser.Game(`.',
  '- Must register at least one keyboard handler (addEventListener("keydown", ...) or Phaser cursorKeys).',
  '- Must show a visible score (integer, updated on actions).',
  '- Must implement a game-over state and a restart key (R).',
  '- Do NOT use eval, new Function, document.cookie, window.parent, localStorage, fetch, XMLHttpRequest, importScripts.',
].join('\n');

const AUTO_GENRE_NOTE =
  'Pick a fitting genre from {platformer, shooter, puzzle} based on the user text. State the chosen genre as a comment in the HTML.';

export function buildPrompt(input: PromptInput): PromptOutput {
  const text = input.text.trim().slice(0, MAX_USER_TEXT);
  const isAuto = input.genre === 'auto';
  const genrePart = isAuto
    ? AUTO_GENRE_NOTE
    : getGenreSystemPrompt(input.genre as Exclude<Genre, 'auto'>);

  const system = [BASE_SYSTEM_PROMPT, genrePart].join('\n\n');
  const user = wrapUserPrompt(input.locale, input.genre, text);
  const expectedSizeHint = Math.min(TYPICAL_OUTPUT_BYTES, MAX_OUTPUT_BYTES);

  return { system, user, expectedSizeHint };
}
