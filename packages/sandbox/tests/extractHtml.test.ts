import { describe, it, expect } from 'vitest';
import { extractHtml } from '../src/extractHtml';

describe('extractHtml', () => {
  it('passes through clean HTML unchanged', () => {
    const html = '<!DOCTYPE html><html><body>ok</body></html>';
    expect(extractHtml(html)).toBe(html);
  });

  it('strips leading prose', () => {
    const llm = 'Sure! Here is your game:\n\n<!DOCTYPE html><html><body>x</body></html>';
    expect(extractHtml(llm)).toBe('<!DOCTYPE html><html><body>x</body></html>');
  });

  it('strips markdown code fences', () => {
    const llm = '```html\n<!DOCTYPE html><html><body>x</body></html>\n```';
    expect(extractHtml(llm)).toBe('<!DOCTYPE html><html><body>x</body></html>');
  });

  it('strips triple-backtick fences without language', () => {
    const llm = '```\n<!DOCTYPE html><html><body>x</body></html>\n```';
    expect(extractHtml(llm)).toBe('<!DOCTYPE html><html><body>x</body></html>');
  });

  it('takes first <!DOCTYPE through last </html>', () => {
    const llm = '<!DOCTYPE html><html><body>1</body></html>\ntrailing junk';
    expect(extractHtml(llm)).toBe('<!DOCTYPE html><html><body>1</body></html>');
  });

  it('returns empty string when no DOCTYPE present', () => {
    expect(extractHtml('just text')).toBe('');
  });

  it('returns empty string when no closing </html>', () => {
    expect(extractHtml('<!DOCTYPE html><html><body>open')).toBe('');
  });
});
