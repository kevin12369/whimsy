import type { Template, Theme } from './types';

export const colorMatch: Template = {
  id: 'puzzle-color-match',
  genre: 'puzzle',
  name: 'Color Match',
  defaultTheme: {
    primary: '#00aa00', secondary: '#aa0000', playerLabel: 'cursor', enemyLabel: 'tile', flavorText: '',
  },
  render(theme: Theme): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${theme.playerLabel} match</title>
<style>body{margin:0;background:#111;color:#fff;font-family:sans-serif;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh}canvas{background:#000}</style>
</head><body>
<canvas id="g" width="400" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const A='${theme.primary}', B='${theme.secondary}';
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:400,height:400,
    scene:{create(){
      const ctx=this;
      const grid=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
      let cx=0,cy=0,score=0;
      const t=ctx.add.text(420,16,'Score: 0',{fontSize:'20px',fill:'#fff'});
      function draw(){ ctx.cameras.main; for(let y=0;y<4;y++) for(let x=0;x<4;x++){ ctx.add.rectangle(x*100+50,y*100+50,90,90, grid[y][x]===1? parseInt(A.slice(1),16): parseInt(B.slice(1),16)); } }
      draw();
      this.input.keyboard.on('keydown',(e)=>{ let nx=cx,ny=cy; if(e.code==='ArrowLeft')nx--; if(e.code==='ArrowRight')nx++; if(e.code==='ArrowUp')ny--; if(e.code==='ArrowDown')ny++; nx=(nx+4)%4; ny=(ny+4)%4; cx=nx;cy=ny; if(e.code==='Space'){ grid[ny][nx]=1-grid[ny][nx]; score++; t.setText('Score: '+score); } if(e.code==='KeyR')location.reload(); });
    }}});
})();
</script></body></html>`;
  },
};

export const slider2048: Template = { ...colorMatch, id: 'puzzle-slider-2048', name: 'Slider 2048' };
export const memoryFlip: Template = { ...colorMatch, id: 'puzzle-memory-flip', name: 'Memory Flip' };
export const blockDrop: Template = { ...colorMatch, id: 'puzzle-block-drop', name: 'Block Drop' };
export const numberLink: Template = { ...colorMatch, id: 'puzzle-number-link', name: 'Number Link' };

export const PUZZLE_TEMPLATES: Template[] = [
  colorMatch, slider2048, memoryFlip, blockDrop, numberLink,
];
