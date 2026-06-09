export function extractHtml(llmOutput: string): string {
  let s = llmOutput;

  // Strip leading markdown fences: ```html or ```
  s = s.replace(/^\s*```(?:html)?\s*\n/i, '');

  // Strip trailing markdown fence
  s = s.replace(/\n```\s*$/, '');

  // Take from first <!DOCTYPE through last </html>
  const startIdx = s.indexOf('<!DOCTYPE');
  const endIdx = s.lastIndexOf('</html>');

  if (startIdx === -1 || endIdx === -1) return '';
  return s.slice(startIdx, endIdx + '</html>'.length);
}
