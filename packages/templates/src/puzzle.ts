import type { Template, Theme } from './types';
import type { GameConfig } from './game-config';
import { LEVEL_DATA } from './level-data';
import { renderHud, hudStyles } from './hud';
import { clampConfig } from './game-config';

const c = (cfg: GameConfig, key: keyof GameConfig, lo: number, hi: number, fallback: number, int = true): number => {
  const v = cfg[key] as number | undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  let x = Math.max(lo, Math.min(hi, v));
  if (int) x = Math.round(x);
  return x;
};

function buildTileMatch(theme: Theme, cfg: GameConfig): string {
  const boardSize = c(cfg, 'boardSize', 6, 10, 8);
  const moves = c(cfg, 'moves', 10, 50, 20);
  const targetScore = c(cfg, 'targetScore', 500, 5000, 1500);
  const iceBlocks = c(cfg, 'iceBlocks', 0, 10, 0);
  const c1 = parseInt(theme.primary.slice(1), 16);
  const scoreKey = 'whimsy:score:tileMatch';
  const TILE = 50;
  const COLORS = [0xff6b3a, 0x3aa6ff, 0x9b59b6, 0x2ecc71, 0xf1c40f, 0xe74c3c];

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#0a0010;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay: 'click 2 adjacent tiles to swap · match 3+ same color', currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script>
(function(){
  const COLOR=${c1}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const LEVELS=${JSON.stringify(LEVEL_DATA.tileMatch)};
  const COLORS=${JSON.stringify(COLORS)};
  const SIZE=${boardSize}, TILE=${TILE}, TARGET=${targetScore}, ICE=${iceBlocks}, MOVES=${moves};
  if (typeof Phaser === 'undefined') {
    const g = document.getElementById('g') || document.body;
    g.innerHTML = '<div style="color:#fff;padding:40px;font:14px monospace">Phaser failed to load. Check the network/CDN.</div>';
    return;
  }
  let currentLevel=0, score=0, movesLeft, board, selected, icePositions, gameOver=false;
  let boardG, scoreT, movesT, levelT, game;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){document.getElementById('hud').innerHTML='HOW TO PLAY: click 2 adjacent tiles to swap · match 3+ same color | Level: '+(currentLevel+1)+'/3 | Score: '+score+' | Moves: '+movesLeft+' | High: '+loadHigh()}

  function newGame(){
    movesLeft=MOVES;
    board=Array(SIZE).fill().map(()=>Array(SIZE).fill(0).map(()=>Math.floor(Math.random()*6)));
    selected=null;icePositions=new Set();
    if(ICE>0)for(let i=0;i<ICE;i++){icePositions.add(Math.floor(Math.random()*SIZE)+','+Math.floor(Math.random()*SIZE))}
    game = new Phaser.Game({type:Phaser.AUTO,parent:window.__WHIMSY_G__,width:SIZE*TILE+30,height:SIZE*TILE+60,
      scene:{
        create(){
          this.add.rectangle((SIZE*TILE+30)/2,(SIZE*TILE+60)/2,SIZE*TILE+30,SIZE*TILE+60,0x0a0010);
          boardG=this.add.container(15,30);
          for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const r=this.add.rectangle(x*TILE+TILE/2,y*TILE+TILE/2,TILE-2,TILE-2,COLORS[board[y][x]]);r.setInteractive();r.on('pointerdown',()=>onClick(this,x,y))}
          scoreT=this.add.text(10,10,'Score: 0',{fontSize:'14px',fill:'#fff'});
          movesT=this.add.text(180,10,'Moves: '+movesLeft,{fontSize:'14px',fill:'#fff'});
          levelT=this.add.text(10,SIZE*TILE+32,'Level 1/3',{fontSize:'14px',fill:'#fff'});
          updateHud();
        }
      }
    });
  }

  function onClick(scene,x,y){
    if(gameOver)return;
    if(selected===null){selected={x,y};return}
    if(Math.abs(selected.x-x)+Math.abs(selected.y-y)!==1){selected={x,y};return}
    const a=board[selected.y][selected.x],b=board[y][x];
    board[selected.y][selected.x]=b;board[y][x]=a;
    selected=null;movesLeft--;score+=5;
    let removed=resolveMatches();
    while(removed>0){score+=removed*20;dropTiles();removed=resolveMatches()}
    if(icePositions.size>0&&Math.random()<0.3){const k=Array.from(icePositions)[0];icePositions.delete(k)}
    updateHud();
    if(score>=TARGET){gameOver=true;saveHigh(score);if(currentLevel>=2){document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:120px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#9b59b6 href=javascript:location.reload()>Play again</a></div>'}else{setTimeout(()=>{currentLevel++;newGame()},1000)}}
    else if(movesLeft<=0){gameOver=true;saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:120px;font:24px monospace>GAME OVER<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#9b59b6 href=javascript:location.reload()>R to restart</a></div>'}
  }

  function resolveMatches(){
    let n=0;
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE-2;x++){const c=board[y][x];if(c===board[y][x+1]&&c===board[y][x+2]){board[y][x]=board[y][x+1]=board[y][x+2]=Math.floor(Math.random()*6);n+=3}}
    for(let x=0;x<SIZE;x++)for(let y=0;y<SIZE-2;y++){const c=board[y][x];if(c===board[y+1][x]&&c===board[y+2][x]){board[y][x]=board[y+1][x]=board[y+2][x]=Math.floor(Math.random()*6);n+=3}}
    return n;
  }
  function dropTiles(){for(let x=0;x<SIZE;x++){const col=[];for(let y=0;y<SIZE;y++)if(board[y][x]!==null)col.push(board[y][x]);while(col.length<SIZE)col.unshift(Math.floor(Math.random()*6));for(let y=0;y<SIZE;y++)board[y][x]=col[y]}}

  newGame();
  window.__whimsy_cleanup = function() {
    try { game.destroy(true); } catch (e) {}
  };
})();
</script></body></html>`;
}

function buildSokoban(theme: Theme, cfg: GameConfig): string {
  const gridSize = c(cfg, 'gridSize', 5, 8, 6);
  const boxCount = c(cfg, 'boxCount', 1, 8, 3);
  const movingTarget = Boolean(cfg.movingTarget);
  const c1 = parseInt(theme.primary.slice(1), 16);
  const scoreKey = 'whimsy:score:sokoban';
  const CELL = 60;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#100800;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay: 'arrow keys push boxes onto targets · undo with U', currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script>
(function(){
  const COLOR=${c1}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const LEVELS=${JSON.stringify(LEVEL_DATA.sokoban)};
  const CELL=${CELL}, GRID=${gridSize}, BOXES=${boxCount}, MOVING=${movingTarget ? 'true' : 'false'};
  if (typeof Phaser === 'undefined') {
    const g = document.getElementById('g') || document.body;
    g.innerHTML = '<div style="color:#fff;padding:40px;font:14px monospace">Phaser failed to load. Check the network/CDN.</div>';
    return;
  }
  let currentLevel=0, moves=0, gameOver=false, board, playerPos, boxesG, playerG, time=0, game;
  let lv;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){const rem=lv.boxes.length-Array.from(boxesG.getChildren()).filter(b=>b.getData('onTarget')).length;document.getElementById('hud').innerHTML='HOW TO PLAY: arrow keys push boxes onto targets · undo with U | Level: '+(currentLevel+1)+'/3 | Moves: '+moves+' | Remaining: '+rem+' | High: '+loadHigh()}

  function newGame(){
    lv=LEVELS[currentLevel];moves=0;time=0;
    playerPos={x:0,y:GRID-1};board=Array(GRID).fill().map(()=>Array(GRID).fill(0));
    const useBoxes=Math.min(BOXES,lv.boxes.length);
    for(let i=0;i<useBoxes;i++){const b=lv.boxes[i];board[b.y][b.x]=2}
    const useTargets=Math.min(useBoxes,lv.targets.length);
    for(let i=0;i<useTargets;i++){const t=lv.targets[i];board[t.y][t.x]|=4}
    game = new Phaser.Game({type:Phaser.AUTO,parent:window.__WHIMSY_G__,width:GRID*CELL+20,height:GRID*CELL+60,
      scene:{
        create(){
          this.add.rectangle((GRID*CELL+20)/2,(GRID*CELL+60)/2,GRID*CELL+20,GRID*CELL+60,0x100800);
          for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++){if((board[y][x]&4)===4)this.add.rectangle(x*CELL+10+CELL/2,y*CELL+30+CELL/2,CELL-2,CELL-2,0x44ff44)}
          for(let y=0;y<GRID;y++)for(let x=0;x<GRID;x++)this.add.rectangle(x*CELL+10+CELL/2,y*CELL+30+CELL/2,CELL-2,CELL-2,(board[y][x]&2)===2?0x884422:0x222222,0.3);
          boxesG=this.physics.add.staticGroup();
          for(let i=0;i<useBoxes;i++){const b=lv.boxes[i];const r=this.add.rectangle(b.x*CELL+10+CELL/2,b.y*CELL+30+CELL/2,CELL-8,CELL-8,0xaa6633);boxesG.add(r);r.setData('origX',b.x);r.setData('origY',b.y);r.setData('onTarget',(board[b.y][b.x]&4)===4)}
          playerG=this.add.rectangle(playerPos.x*CELL+10+CELL/2,playerPos.y*CELL+30+CELL/2,20,20,COLOR);
          cursors=this.input.keyboard.createCursorKeys();
          if(MOVING)this.time.addEvent({delay:10000,loop:true,callback:()=>{const t=lv.targets[Math.floor(Math.random()*lv.targets.length)];playerG.setPosition(t.x*CELL+10+CELL/2,t.y*CELL+30+CELL/2)}});
          updateHud();
          this.input.keyboard.on('keydown-U',()=>location.reload());
        },
        update(){
          if(gameOver)return;
          let dx=0,dy=0;
          if(cursors.left.isDown)dx=-1;
          else if(cursors.right.isDown)dx=1;
          else if(cursors.up.isDown)dy=-1;
          else if(cursors.down.isDown)dy=1;
          if(dx||dy){
            const nx=playerPos.x+dx,ny=playerPos.y+dy;
            if(nx<0||nx>=GRID||ny<0||ny>=GRID)return;
            let push=null;
            if((board[ny][nx]&2)===2)push={x:nx,y:ny};
            if(push){const bx=push.x+dx,by=push.y+dy;if(bx<0||bx>=GRID||by<0||by>=GRID)return;if((board[by][bx]&2)===2)return;board[push.y][push.x]&=~2;board[by][bx]|=2;const box=boxesG.getChildren().find(b=>b.getData('origX')===push.x&&b.getData('origY')===push.y);if(box){box.setPosition(bx*CELL+10+CELL/2,by*CELL+30+CELL/2);box.setData('origX',bx);box.setData('origY',by);box.setData('onTarget',(board[by][bx]&4)===4)}}
            playerPos={x:nx,y:ny};playerG.setPosition(nx*CELL+10+CELL/2,ny*CELL+30+CELL/2);moves++;updateHud();
            const remaining=lv.boxes.length-Array.from(boxesG.getChildren()).filter(b=>b.getData('onTarget')).length;
            if(remaining===0){gameOver=true;saveHigh(10000-moves);if(currentLevel>=2){document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:120px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+(10000-moves)+'<br>High: '+loadHigh()+'<br><br><a style=color:#9b59b6 href=javascript:location.reload()>Play again</a></div>'}else{setTimeout(()=>{currentLevel++;newGame()},1000)}}
          }
        }
      }
    });
  }

  newGame();
  window.__whimsy_cleanup = function() {
    try { game.destroy(true); } catch (e) {}
  };
})();
</script></body></html>`;
}

export const tileMatch: Template = {
  id: 'tileMatch', genre: 'puzzle', name: 'Tile Match',
  howToPlay: 'click 2 adjacent tiles to swap · match 3+ same color',
  defaultTheme: { primary: '#9b59b6', secondary: '#ffffff', playerLabel: 'tile', enemyLabel: 'block', flavorText: '3 消,经典 Bejeweled 式。' },
  consumes: ['primary', 'secondary', 'playerLabel', 'enemyLabel', 'boardSize', 'moves', 'targetScore', 'iceBlocks'],
  clamp: {
    boardSize: [6, 10],
    moves: [10, 50],
    targetScore: [500, 5000],
    iceBlocks: [0, 10],
  },
  render(theme: Theme, gameConfig: GameConfig): string {
    return buildTileMatch(theme, clampConfig(gameConfig));
  },
};

export const sokoban: Template = {
  id: 'sokoban', genre: 'puzzle', name: 'Sokoban',
  howToPlay: 'arrow keys push boxes onto targets · undo with U',
  defaultTheme: { primary: '#9b59b6', secondary: '#ffffff', playerLabel: 'keeper', enemyLabel: 'crate', flavorText: '推箱子。' },
  consumes: ['primary', 'secondary', 'playerLabel', 'enemyLabel', 'gridSize', 'boxCount', 'movingTarget'],
  clamp: {
    gridSize: [5, 8],
    boxCount: [1, 8],
  },
  render(theme: Theme, gameConfig: GameConfig): string {
    return buildSokoban(theme, clampConfig(gameConfig));
  },
};

export const PUZZLE_TEMPLATES: Template[] = [tileMatch, sokoban];
