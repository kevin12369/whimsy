import { describe, it, expect } from 'vitest';
import { renderHud, hudStyles } from '../src/hud';

describe('renderHud', () => {
  it('embeds all 4 fields into the HTML', () => {
    const html = renderHud({ howToPlay: 'A B C', currentLevel: 1, totalLevels: 3, highScore: 42, score: 7 });
    expect(html).toContain('A B C');
    expect(html).toContain('1');
    expect(html).toContain('3');
    expect(html).toContain('42');
    expect(html).toContain('7');
  });

  it('escapes single quotes in howToPlay', () => {
    const html = renderHud({ howToPlay: "it's a test", currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 });
    expect(html).not.toContain("it's a test");
    expect(html).toContain("it\\'s a test");
  });

  it('hudStyles returns a <style> tag with id="hud"', () => {
    expect(hudStyles).toContain('<style>');
    expect(hudStyles).toContain('#hud');
  });
});
