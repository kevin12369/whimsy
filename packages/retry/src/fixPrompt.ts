export const TRUNCATE_LEN = 4000;

export function buildFixPrompt(prevHtml: string, error: string): string {
  const truncated = prevHtml.length > TRUNCATE_LEN
    ? prevHtml.slice(0, TRUNCATE_LEN) + '\n/* ... truncated ... */'
    : prevHtml;
  return [
    'Your previous attempt failed at: ' + error,
    '',
    'The generated code was:',
    '```html',
    truncated,
    '```',
    '',
    'Fix ONLY the failing issue. Output the complete corrected file.',
  ].join('\n');
}

export function buildRetryPrompt(userPrompt: string, fixPrompt: string): string {
  return [userPrompt, '', '---', '', fixPrompt].join('\n');
}
