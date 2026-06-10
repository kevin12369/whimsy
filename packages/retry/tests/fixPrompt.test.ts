import { describe, it, expect } from 'vitest';
import { buildFixPrompt, buildRetryPrompt, TRUNCATE_LEN } from '../src/fixPrompt';

describe('fixPrompt', () => {
  it('buildFixPrompt names the error and truncates prev HTML', () => {
    const prev = 'a'.repeat(TRUNCATE_LEN * 3);
    const out = buildFixPrompt(prev, 'no canvas element');
    expect(out).toContain('no canvas element');
    expect(out).toContain('truncated');
    expect(out.length).toBeLessThan(TRUNCATE_LEN * 2);
  });

  it('buildFixPrompt does not include the full prev HTML if huge', () => {
    const prev = 'x'.repeat(100_000);
    const out = buildFixPrompt(prev, 'unbalanced braces');
    expect(out).not.toContain('x'.repeat(60_000));
  });

  it('buildRetryPrompt concatenates user + fix', () => {
    const out = buildRetryPrompt('user prompt', 'fix prompt');
    expect(out).toContain('user prompt');
    expect(out).toContain('fix prompt');
    expect(out.indexOf('user prompt')).toBeLessThan(out.indexOf('fix prompt'));
  });
});
