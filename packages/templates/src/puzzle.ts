import type { Template, Theme } from './types';
import { LEVEL_DATA } from './level-data';
import { renderHud, hudStyles } from './hud';

function buildTileMatch(theme: Theme, levelDataJson: string, howToPlay: string, scoreKey: string): string {
  const c = parseInt(theme.primary.slice(1), 16);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#0a0010;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay, currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const LEVELS=${levelDataJson};
  const COLORS=[0xff6b3a,0x3aa6ff,0x9b59b6,0x2ecc71,0xf1c40f,0xe74c3c];
  const SIZE=8, TILE=50;
  const BOARD='8x8';
  let currentLevel=0, score=0, movesLeft, board, selected, icePositions, gameOver=false;
  let boardG, scoreT, movesT, levelT, hover;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){document.getElementById('hud').innerHTML='HOW TO PLAY: ${howToPlay.replace(/'/g, "\\'")} | Level: '+(currentLevel+1)+'/3 | Score: '+score+' | Moves: '+movesLeft+' | High: '+loadHigh()}

  function newGame(){
    movesLeft=LEVELS[currentLevel].moves;
    board=Array(SIZE).fill().map(()=>Array(SIZE).fill(0).map(()=>Math.floor(Math.random()*6)));
    selected=null;icePositions=new Set();
    if(LEVELS[currentLevel].iceBlocks>0)for(let i=0;i<LEVELS[currentLevel].iceBlocks;i++){icePositions.add(Math.floor(Math.random()*SIZE)+','+Math.floor(Math.random()*SIZE))}
    new Phaser.Game({type:Phaser.AUTO,parent:'g',width:430,height:500,
      scene:{
        create(){
          this.add.rectangle(215,250,430,500,0x0a0010);
          boardG=this.add.container(15,50);
          for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){const r=this.add.rectangle(x*TILE+TILE/2,y*TILE+TILE/2,TILE-2,TILE-2,COLORS[board[y][x]]);r.setInteractive();r.on('pointerdown',()=>onClick(this,x,y))}
          scoreT=this.add.text(10,10,'Score: 0',{fontSize:'14px',fill:'#fff'});
          movesT=this.add.text(200,10,'Moves: '+movesLeft,{fontSize:'14px',fill:'#fff'});
          levelT=this.add.text(10,420,'Level 1/3',{fontSize:'14px',fill:'#fff'});
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
    if(score>=LEVELS[currentLevel].targetScore){gameOver=true;saveHigh(score);if(currentLevel>=2){document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:120px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#9b59b6 href=javascript:location.reload()>Play again</a></div>'}else{setTimeout(()=>{currentLevel++;newGame()},1000)}}
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
})();
</script></body></html>`;
}

function buildSokoban(theme: Theme, levelDataJson: string, howToPlay: string, scoreKey: string): string {
  const c = parseInt(theme.primary.slice(1), 16);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#100800;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay, currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const LEVELS=${levelDataJson};
  const CELL=60;
  let currentLevel=0, moves=0, history=[], gameOver=false, board, playerPos, boxesG, playerG, targetG, time=0;
  let lv, gridSize;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){const rem=lv.boxes.length-Array.from(boxesG.getChildren()).filter(b=>b.getData('onTarget')).length;document.getElementById('hud').innerHTML='HOW TO PLAY: ${howToPlay.replace(/'/g, "\\'")} | Level: '+(currentLevel+1)+'/3 | Moves: '+moves+' | Remaining: '+rem+' | High: '+loadHigh()}

  function newGame(){
    lv=LEVELS[currentLevel];gridSize=lv.grid;history=[];moves=0;time=0;
    playerPos={x:0,y:gridSize-1};board=Array(gridSize).fill().map(()=>Array(gridSize).fill(0));
    for(const b of lv.boxes)board[b.y][b.x]=2;for(const t of lv.targets)board[t.y][t.x]|=4;
    new Phaser.Game({type:Phaser.AUTO,parent:'g',width:gridSize*CELL+20,height:gridSize*CELL+60,
      scene:{
        create(){
          this.add.rectangle((gridSize*CELL+20)/2,(gridSize*CELL+60)/2,gridSize*CELL+20,gridSize*CELL+60,0x100800);
          for(let y=0;y<gridSize;y++)for(let x=0;x<gridSize;x++){if((board[y][x]&4)===4)this.add.rectangle(x*CELL+10+CELL/2,y*CELL+30+CELL/2,CELL-2,CELL-2,0x44ff44)}
          for(let y=0;y<gridSize;y++)for(let x=0;x<gridSize;x++)this.add.rectangle(x*CELL+10+CELL/2,y*CELL+30+CELL/2,CELL-2,CELL-2,(board[y][x]&2)===2?0x884422:0x222222,0.3);
          boxesG=this.physics.add.staticGroup();for(const b of lv.boxes){const r=this.add.rectangle(b.x*CELL+10+CELL/2,b.y*CELL+30+CELL/2,CELL-8,CELL-8,0xaa6633);boxesG.add(r);r.setData('origX',b.x);r.setData('origY',b.y);r.setData('onTarget',(board[b.y][b.x]&4)===4)}
          playerG=this.add.rectangle(playerPos.x*CELL+10+CELL/2,playerPos.y*CELL+30+CELL/2,20,20,COLOR);
          targetG=this.physics.add.staticGroup();
          cursors=this.input.keyboard.createCursorKeys();
          if(lv.movingTarget)this.time.addEvent({delay:10000,loop:true,callback:()=>{const t=lv.targets[Math.floor(Math.random()*lv.targets.length)];playerG.setPosition(t.x*CELL+10+CELL/2,t.y*CELL+30+CELL/2)}});
          updateHud();
          this.input.keyboard.on('keydown-U',()=>undo());
        },
        update(){
          if(gameOver)return;
          time+=16;
          let dx=0,dy=0;
          if(cursors.left.isDown){dx=-1}
          else if(cursors.right.isDown){dx=1}
          else if(cursors.up.isDown){dy=-1}
          else if(cursors.down.isDown){dy=1}
          if(dx||dy){
            const nx=playerPos.x+dx,ny=playerPos.y+dy;
            if(nx<0||nx>=gridSize||ny<0||ny>=gridSize)return;
            let push=null;
            if((board[ny][nx]&2)===2)push={x:nx,y:ny};
            if(push){const bx=push.x+dx,by=push.y+dy;if(bx<0||bx>=gridSize||by<0||by>=gridSize)return;if((board[by][bx]&2)===2)return;board[push.y][push.x]&=~2;board[by][bx]|=2;const box=boxesG.getChildren().find(b=>b.getData('origX')===push.x&&b.getData('origY')===push.y);if(box){box.setPosition(bx*CELL+10+CELL/2,by*CELL+30+CELL/2);box.setData('origX',bx);box.setData('origY',by);box.setData('onTarget',(board[by][bx]&4)===4)}}
            playerPos={x:nx,y:ny};playerG.setPosition(nx*CELL+10+CELL/2,ny*CELL+30+CELL/2);moves++;updateHud();
            const remaining=lv.boxes.length-Array.from(boxesG.getChildren()).filter(b=>b.getData('onTarget')).length;
            if(remaining===0){gameOver=true;saveHigh(10000-moves);if(currentLevel>=2){document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:120px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+(10000-moves)+'<br>High: '+loadHigh()+'<br><br><a style=color:#9b59b6 href=javascript:location.reload()>Play again</a></div>'}else{setTimeout(()=>{currentLevel++;newGame()},1000)}}
          }
        }
      }
    });
  }

  function undo(){if(history.length===0)return;const s=history.pop();board[s.by][s.bx]&=~2;board[s.py][s.px]&=~2;board[s.py][s.px]|=2;playerPos={x:s.px,y:s.py};moves=Math.max(0,moves-1);newGame()}

  newGame();
})();
</script></body></html>`;
}

export const tileMatch: Template = {
  id: 'tileMatch', genre: 'puzzle', name: 'Tile Match',
  howToPlay: 'click 2 adjacent tiles to swap · match 3+ same color',
  defaultTheme: { primary: '#9b59b6', secondary: '#ffffff', playerLabel: 'tile', enemyLabel: 'block', flavorText: '3 消,经典 Bejeweled 式。' },
  render(theme: Theme): string {
    return buildTileMatch(theme, JSON.stringify(LEVEL_DATA.tileMatch), tileMatch.howToPlay, 'whimsy:score:tileMatch');
  },
};

export const sokoban: Template = {
  id: 'sokoban', genre: 'puzzle', name: 'Sokoban',
  howToPlay: 'arrow keys push boxes onto targets · undo with U',
  defaultTheme: { primary: '#9b59b6', secondary: '#ffffff', playerLabel: 'keeper', enemyLabel: 'crate', flavorText: '推箱子。' },
  render(theme: Theme): string {
    return buildSokoban(theme, JSON.stringify(LEVEL_DATA.sokoban), sokoban.howToPlay, 'whimsy:score:sokoban');
  },
};

export const PUZZLE_TEMPLATES: Template[] = [tileMatch, sokoban];
