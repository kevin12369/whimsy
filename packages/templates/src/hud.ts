export interface HudProps {
  howToPlay: string;
  currentLevel: number;
  totalLevels: number;
  highScore: number;
  score: number;
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function renderHud(p: HudProps): string {
  return `<div id="hud">HOW TO PLAY: ${esc(p.howToPlay)} | Level: ${p.currentLevel}/${p.totalLevels} | Score: ${p.score} | High: ${p.highScore}</div>`;
}

export const hudStyles = `<style>#hud{position:fixed;top:0;left:0;right:0;padding:6px 10px;background:rgba(0,0,0,.6);color:#fff;font:12px monospace;z-index:10;user-select:none}</style>`;
