import type { Template, Theme } from './types';

// 1) Tile Match — like Bejeweled: click to swap adjacent tiles, line up 3+ of same color.
export const tileMatch: Template = {
  id: 'puzzle-tile-match',
  genre: 'puzzle',
  name: 'Tile Match',
  defaultTheme: {
    primary: '#00aa00', secondary: '#aa0000', playerLabel: 'cursor', enemyLabel: 'tile',
    flavorText: '同色连线消除 — 4x4 棋盘,点空格切换颜色,3 连消 1 分。',
  },
  render(theme: Theme): string {
    const a = parseInt(theme.primary.slice(1), 16);
    const b = parseInt(theme.secondary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#0a0a14;color:#fff;font-family:monospace;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh}canvas{background:#111;border:1px solid #333}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const A=${a},B=${b},PLAYER='${theme.playerLabel}';
  const N=4,TS=80;
  let grid=[],score=0,selected=null,scoreText;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:N*TS+200,height:N*TS+50,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#0a0a14');
        for(let y=0;y<N;y++){grid[y]=[];for(let x=0;x<N;x++)grid[y][x]=Math.random()<0.5?0:1;}
        scoreText=this.add.text(N*TS+20,20,'Score: 0',{fontSize:'18px',fill:'#fff'});
        this.input.on('pointerdown',(p)=>{
          const x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);
          if(x<0||x>=N||y<0||y>=N)return;
          if(!selected){selected={x,y};return;}
          const dx=Math.abs(selected.x-x),dy=Math.abs(selected.y-y);
          if(dx+dy===1){
            const t=grid[y][x];grid[y][x]=grid[selected.y][selected.x];grid[selected.y][selected.x]=t;
            selected=null;check();
          }else selected={x,y};
        });
      },
      update(){
        this.cameras.main;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          const c=grid[y][x]===0?A:B;
          this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-6,TS-6,c);
        }
        if(selected)this.add.rectangle(selected.x*TS+TS/2,selected.y*TS+TS/2,TS-6,TS-6,0xffffff);
      }
    }
  });
  function check(){
    let changed=true,pass=0;
    while(changed&&pass++<10){
      changed=false;
      const toClear=[];
      for(let y=0;y<N;y++)for(let x=0;x<N-2;x++)if(grid[y][x]===grid[y][x+1]&&grid[y][x+1]===grid[y][x+2]){toClear.push([y,x],[y,x+1],[y,x+2]);changed=true;}
      for(let x=0;x<N;x++)for(let y=0;y<N-2;y++)if(grid[y][x]===grid[y+1][x]&&grid[y+1][x]===grid[y+2][x]){toClear.push([y,x],[y+1,x],[y+2,x]);changed=true;}
      for(const [y,x] of toClear){grid[y][x]=-1;score++;}
      if(scoreText)scoreText.setText('Score: '+score);
      for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(grid[y][x]===-1)grid[y][x]=Math.random()<0.5?0:1;
    }
  }
})();
</script></body></html>`;
  },
};

// 2) Sokoban — push crates to goal squares.
export const sokoban: Template = {
  id: 'puzzle-sokoban',
  genre: 'puzzle',
  name: 'Sokoban',
  defaultTheme: {
    primary: '#ddaa44', secondary: '#a86b1a', playerLabel: 'pusher', enemyLabel: 'crate',
    flavorText: '推箱子 — 把 3 个箱子推到目标点上,不能拉只能推。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    const g = parseInt(theme.secondary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#1a0e04;color:#fff;font-family:monospace;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh}canvas{background:#2a1a08}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c},GOAL=${g},PLAYER='${theme.playerLabel}';
  const TS=50,COLS=8,ROWS=8;
  // 0=floor, 1=wall, 2=goal, 3=crate, 4=player, 5=crate-on-goal
  const map=[
    [1,1,1,1,1,1,1,1],
    [1,4,0,0,0,1,0,1],
    [1,0,1,1,0,1,0,1],
    [1,0,1,0,3,0,3,1],
    [1,0,1,3,0,1,0,1],
    [1,0,0,0,1,0,0,1],
    [1,0,2,2,2,0,2,1],
    [1,1,1,1,1,1,1,1],
  ];
  let player, scoreText, won=false, moves=0;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:COLS*TS,height:ROWS*TS+30,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#1a0e04');
        scoreText=this.add.text(8,ROWS*TS+6,'Moves: 0 · Place 3 crates on goals',{fontSize:'14px',fill:'#fff'});
        this.input.keyboard.on('keydown',(e)=>{
          if(won)return;
          const dir={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.code];
          if(!dir)return;
          const px=Math.floor(player.x/TS),py=Math.floor(player.y/TS);
          const nx=px+dir[0],ny=py+dir[1];
          if(map[ny][nx]===1)return;
          if(map[ny][nx]===3||map[ny][nx]===5){
            const cx=nx+dir[0],cy=ny+dir[1];
            if(map[cy][cx]===1||map[cy][cx]===3||map[cy][cx]===5)return;
            map[cy][cx]=map[cy][cx]===2?5:3;map[ny][nx]=map[ny][nx]===5?2:0;
          }
          player.x=nx*TS;player.y=ny*TS;moves++;scoreText.setText('Moves: '+moves);
          let onGoal=0;for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]===5)onGoal++;
          if(onGoal>=3){won=true;this.add.text(80,180,'SOLVED!',{fontSize:'32px',fill:'#88ff88'});}
        });
      },
      update(){
        this.cameras.main;
        for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
          const v=map[y][x];
          if(v===1)this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS,TS,0x3a1f08);
          if(v===2)this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-6,TS-6,GOAL);
          if(v===3)this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-6,TS-6,0x886622);
          if(v===5)this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-6,TS-6,GOAL);
          if(v===4&&!player){player=this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-8,TS-8,COLOR);}
        }
        if(player){
          this.add.rectangle(player.x,player.y,TS-8,TS-8,COLOR);
          player.setVisible(false); // drawn above to keep z-order
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 3) Lights Out — click a cell toggles it + 4 neighbors, reach all-off.
export const lightsOut: Template = {
  id: 'puzzle-lights-out',
  genre: 'puzzle',
  name: 'Lights Out',
  defaultTheme: {
    primary: '#ffcc00', secondary: '#222', playerLabel: 'toggler', enemyLabel: 'lit',
    flavorText: '灭灯游戏 — 点一格翻转自己和邻接 4 格,全灭算赢。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#000;color:#fff;font-family:monospace;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh}canvas{background:#0a0a0a}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c},PLAYER='${theme.playerLabel}';
  const N=5,TS=80;
  let grid=[],moves=0,statusText,won=false;
  for(let y=0;y<N;y++){grid[y]=[];for(let x=0;x<N;x++)grid[y][x]=Math.random()<0.5?1:0;}
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:N*TS,height:N*TS+40,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#0a0a0a');
        statusText=this.add.text(8,N*TS+8,'Moves: 0 · Toggle all off',{fontSize:'14px',fill:'#fff'});
        this.input.on('pointerdown',(p)=>{
          if(won)return;
          const x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);
          if(x<0||x>=N||y<0||y>=N)return;
          for(const [dx,dy] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]){
            const nx=x+dx,ny=y+dy;
            if(nx>=0&&nx<N&&ny>=0&&ny<N)grid[ny][nx]=1-grid[ny][nx];
          }
          moves++;
          let off=0;for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!grid[y][x])off++;
          statusText.setText('Moves: '+moves+(off===N*N?' · SOLVED!':''));
          if(off===N*N){won=true;this.add.text(120,180,'DARK!',{fontSize:'32px',fill:'#aaffaa'});}
        });
      },
      update(){
        this.cameras.main;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-4,TS-4,grid[y][x]?COLOR:0x222222);
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 4) Number Link — connect same digits with paths that don't cross.
export const numberLink: Template = {
  id: 'puzzle-number-link',
  genre: 'puzzle',
  name: 'Number Link',
  defaultTheme: {
    primary: '#66ddff', secondary: '#113355', playerLabel: 'linker', enemyLabel: 'cell',
    flavorText: '数字连线 — 同数字首尾连成不交叉路径,填满所有格子。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#02080f;color:#fff;font-family:monospace;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh}canvas{background:#02080f}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c},PLAYER='${theme.playerLabel}';
  const N=5,TS=72;
  // Each cell either 0 (empty), or a digit 1..4 with each digit appearing exactly twice.
  const seeds=[[0,0,1],[0,4,2],[4,0,3],[4,4,4],[2,2,1],[2,1,2],[1,3,3],[3,2,4]];
  let grid=Array.from({length:N},()=>Array(N).fill(0));
  seeds.forEach(([y,x,v])=>{grid[y][x]=v;});
  let paths={},drawing=null,statusText;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:N*TS,height:N*TS+30,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#02080f');
        statusText=this.add.text(8,N*TS+6,'Click two same digits to link them',{fontSize:'13px',fill:'#fff'});
        this.input.on('pointerdown',(p)=>{
          const x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);
          if(x<0||x>=N||y<0||y>=N)return;
          const v=grid[y][x];
          if(!v)return;
          if(!drawing||drawing.v!==v){drawing={v,start:[x,y]};return;}
          if(drawing.start[0]===x&&drawing.start[1]===y)return;
          paths[v]=[[drawing.start[1],drawing.start[0]],[y,x]];
          drawing=null;
        });
      },
      update(){
        this.cameras.main;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-4,TS-4,grid[y][x]?0x224466:0x0a1822);
          if(grid[y][x])this.add.text(x*TS+24,y*TS+18,String(grid[y][x]),{fontSize:'22px',fill:'#fff'});
        }
        for(const v in paths){
          const pts=paths[v];
          if(pts.length>=2){
            for(let i=0;i<pts.length-1;i++){
              const [y1,x1]=pts[i],[y2,x2]=pts[i+1];
              const cx=(x1+x2)/2*TS+TS/2,cy=(y1+y2)/2*TS+TS/2;
              this.add.rectangle(cx,cy,TS-4,TS-4,COLOR);
            }
          }
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 5) Sliding-15 — classic 15-puzzle, slide tiles back to order.
export const sliding15: Template = {
  id: 'puzzle-sliding-15',
  genre: 'puzzle',
  name: 'Sliding-15',
  defaultTheme: {
    primary: '#eee', secondary: '#444', playerLabel: 'slider', enemyLabel: 'tile',
    flavorText: '15 数字华容道 — 点邻接空格滑过去,顺序还原算赢。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#101418;color:#fff;font-family:monospace;overflow:hidden;display:flex;justify-content:center;align-items:center;height:100vh}canvas{background:#101418}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c},PLAYER='${theme.playerLabel}';
  const N=4,TS=100;
  let tiles=[],moves=0,statusText,won=false;
  for(let i=1;i<=N*N-1;i++)tiles.push(i);tiles.push(0);
  for(let k=0;k<200;k++){
    const blank=find(0),r=Math.floor(Math.random()*4);
    const [dx,dy]=[[1,0],[-1,0],[0,1],[0,-1]][r];
    const nx=blank[0]+dx,ny=blank[1]+dy;
    if(nx>=0&&nx<N&&ny>=0&&ny<N){
      const t=tiles[ny*N+nx];tiles[blank[1]*N+blank[0]]=t;tiles[ny*N+nx]=0;
    }
  }
  function find(v){for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(tiles[y*N+x]===v)return[x,y];return[0,0];}
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:N*TS,height:N*TS+30,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#101418');
        statusText=this.add.text(8,N*TS+6,'Moves: 0',{fontSize:'14px',fill:'#fff'});
        this.input.on('pointerdown',(p)=>{
          if(won)return;
          const x=Math.floor(p.x/TS),y=Math.floor(p.y/TS);
          if(x<0||x>=N||y<0||y>=N)return;
          const blank=find(0);
          if(Math.abs(blank[0]-x)+Math.abs(blank[1]-y)!==1)return;
          const t=tiles[y*N+x];tiles[y*N+x]=0;tiles[blank[1]*N+blank[0]]=t;
          moves++;statusText.setText('Moves: '+moves);
          let ordered=true;for(let i=0;i<N*N-1;i++)if(tiles[i]!==i+1){ordered=false;break;}
          if(ordered){won=true;this.add.text(120,200,'SOLVED!',{fontSize:'32px',fill:'#aaffaa'});}
        });
      },
      update(){
        this.cameras.main;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          const v=tiles[y*N+x];
          if(v===0){this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-4,TS-4,0x101418);continue;}
          this.add.rectangle(x*TS+TS/2,y*TS+TS/2,TS-4,TS-4,COLOR);
          this.add.text(x*TS+34,y*TS+34,String(v),{fontSize:'32px',fill:'#222'});
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

export const PUZZLE_TEMPLATES: Template[] = [
  tileMatch,
  sokoban,
  lightsOut,
  numberLink,
  sliding15,
];