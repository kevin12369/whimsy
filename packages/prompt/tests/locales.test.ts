import { describe, it, expect } from 'vitest';
import { USER_PROMPT_WRAPPERS, wrapUserPrompt } from '../src/locales';

describe('locale wrappers', () => {
  it('defines wrappers for en and zh', () => {
    expect(Object.keys(USER_PROMPT_WRAPPERS).sort()).toEqual(['en', 'zh']);
  });

  it('en wrapper contains Requirements and Theme', () => {
    const w = wrapUserPrompt('en', 'platformer', 'space mario');
    expect(w).toContain('Genre: platformer');
    expect(w).toContain('space mario');
    expect(w).toContain('Requirements');
    expect(w).toContain('keyboard');
    expect(w).toContain('score');
    expect(w).toContain('game over');
  });

  it('zh wrapper is in Chinese', () => {
    const w = wrapUserPrompt('zh', 'platformer', '太空马里奥');
    expect(w).toMatch(/[一-鿿]/);
    expect(w).toContain('太空马里奥');
  });
});
