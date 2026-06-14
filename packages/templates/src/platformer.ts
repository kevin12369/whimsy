import type { Template, Theme } from './types';

// 1) Side-Scroller Comet — horizontal scrolling, jump over asteroids, 3 lives.
export const sideScrollerComet: Template = {
  id: 'platformer-side-scroller-comet',
  genre: 'platformer',
  name: 'Side-Scroller Comet',
  defaultTheme: {
    primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid',
    flavorText: '像马里奥那样,主角是颗彗星,在太空里躲小行星。3 条命,撞到就死。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#02030a;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let lives=3, score=0, gameOver=false, player, cursors, ground, enemies, stars, scoreText, livesText;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:450,
    physics:{default:'arcade',arcade:{gravity:{y:900}}},
    scene:{preload(){},
      create(){
        this.add.rectangle(400,225,800,450,0x02030a);
        this.add.text(20,20,'SCROLL-'+PLAYER,{fontSize:'14px',fill:'#88aaff'});
        ground=this.add.rectangle(400,430,800,40,0x223344); this.physics.add.existing(ground,true);
        player=this.add.rectangle(80,360,28,28,COLOR); this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        cursors=this.input.keyboard.createCursorKeys();
        stars=this.physics.add.group();
        enemies=this.physics.add.group();
        scoreText=this.add.text(20,40,'Score: 0',{fontSize:'14px',fill:'#fff'});
        livesText=this.add.text(20,60,'Lives: 3',{fontSize:'14px',fill:'#fff'});
        this.physics.add.collider(player,ground);
        this.physics.add.overlap(player,stars,(p,s)=>{s.destroy();score+=10;scoreText.setText('Score: '+score);});
        this.physics.add.overlap(player,enemies,()=>{
          lives--; livesText.setText('Lives: '+lives);
          if(lives<=0){gameOver=true;this.physics.pause();this.add.text(260,200,'GAME OVER — R',{fontSize:'28px',fill:'#ff6666'});}
          else {player.x=80;player.y=360;}
        });
        for(let i=0;i<5;i++){const s=this.add.rectangle(200+i*120,Phaser.Math.Between(100,300),10,10,0xffff66);this.physics.add.existing(s);stars.add(s);}
        this.time.addEvent({delay:1400,loop:true,callback:()=>{
          const e=this.add.rectangle(820,Phaser.Math.Between(80,360),24,24,0xff4444);this.physics.add.existing(e);enemies.add(e);e.body.setVelocity(-220,0);
        }});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        if(cursors.left.isDown)player.body.setVelocityX(-220);
        else if(cursors.right.isDown)player.body.setVelocityX(220);
        else player.body.setVelocityX(0);
        if((cursors.up.isDown||cursors.space.isDown)&&player.body.touching.down)player.body.setVelocityY(-460);
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 2) Vertical Climber — Doodle-Jump-style vertical climbing with platforms that scroll.
export const verticalClimber: Template = {
  id: 'platformer-vertical-climber',
  genre: 'platformer',
  name: 'Vertical Climber',
  defaultTheme: {
    primary: '#88ff66', secondary: '#ffffff', playerLabel: 'doodler', enemyLabel: 'bat',
    flavorText: '不断往上跳的平台,错过就掉下来 — 像 Doodle Jump。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#1a0a2a;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let player, cursors, platforms, score=0, maxY=0, scoreText, gameOver=false;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:480,height:640,
    physics:{default:'arcade',arcade:{gravity:{y:700}}},
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#1a0a2a');
        player=this.add.rectangle(240,500,26,32,COLOR); this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        cursors=this.input.keyboard.createCursorKeys();
        platforms=this.physics.add.staticGroup();
        for(let y=580;y>40;y-=70){
          const x=Phaser.Math.Between(40,440);
          const p=this.add.rectangle(x,y,90,14,0x4a2a6a); platforms.add(p);
        }
        this.physics.add.collider(player,platforms);
        scoreText=this.add.text(16,16,'Height: 0',{fontSize:'18px',fill:'#fff'}).setScrollFactor(0);
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        if(cursors.left.isDown)player.body.setVelocityX(-180);
        else if(cursors.right.isDown)player.body.setVelocityX(180);
        else player.body.setVelocityX(0);
        if(cursors.up.isDown&&player.body.touching.down)player.body.setVelocityY(-420);
        if(player.y<maxY){maxY=player.y;score=Math.max(score,Math.floor((580-player.y)/10));scoreText.setText('Height: '+score);}
        this.cameras.main.scrollY=player.y-300;
        if(player.y>800){gameOver=true;this.physics.pause();this.add.text(140,300,'FELL! — R',{fontSize:'26px',fill:'#ff8888'}).setScrollFactor(0);}
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 3) Auto Runner — world scrolls right, tap jump to dodge.
export const autoRunner: Template = {
  id: 'platformer-auto-runner',
  genre: 'platformer',
  name: 'Auto Runner',
  defaultTheme: {
    primary: '#ffaa00', secondary: '#222', playerLabel: 'runner', enemyLabel: 'cactus',
    flavorText: '自动向右跑,点空格跳过仙人掌 — 死 1 次就 GGEZ。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#3a1f0a;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let player, ground, obstacles, score=0, scoreText, gameOver=false, cursors;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:400,
    physics:{default:'arcade',arcade:{gravity:{y:1100}}},
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#3a1f0a');
        ground=this.add.rectangle(400,380,1600,40,0x6a4a2a); this.physics.add.existing(ground,true);
        player=this.add.rectangle(120,340,30,36,COLOR); this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        this.physics.add.collider(player,ground);
        cursors=this.input.keyboard.createCursorKeys();
        obstacles=this.physics.add.group();
        scoreText=this.add.text(16,16,'Distance: 0',{fontSize:'18px',fill:'#fff'});
        this.time.addEvent({delay:1300,loop:true,callback:()=>{
          const h=Phaser.Math.Between(30,60);
          const o=this.add.rectangle(820,380-h/2,24,h,0x2a8a2a); this.physics.add.existing(o); obstacles.add(o); o.body.setVelocityX(-360);
        }});
        this.physics.add.overlap(player,obstacles,()=>{gameOver=true;this.physics.pause();this.add.text(240,180,'HIT — R',{fontSize:'28px',fill:'#ff4444'});});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        score++; if(score%5===0)scoreText.setText('Distance: '+(score/5|0));
        if((cursors.space.isDown||cursors.up.isDown)&&player.body.touching.down)player.body.setVelocityY(-540);
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 4) Single-Screen Puzzle — Celeste-style platformer puzzle. Reach the door.
export const singleScreenPuzzle: Template = {
  id: 'platformer-single-screen-puzzle',
  genre: 'platformer',
  name: 'Single-Screen Puzzle',
  defaultTheme: {
    primary: '#ff66cc', secondary: '#663399', playerLabel: 'climber', enemyLabel: 'spike',
    flavorText: '单屏平台解谜,跳到顶端门口算赢 — 死了直接重开关卡。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#100818;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let player, cursors, walls, door, statusText, won=false;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:600,height:500,
    physics:{default:'arcade',arcade:{gravity:{y:900}}},
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#100818');
        walls=this.physics.add.staticGroup();
        const layout=[[300,470,600,20],[100,400,200,16],[300,400,200,16],[500,400,160,16],[100,330,160,16],[300,330,200,16],[500,330,160,16],[100,260,160,16],[300,260,200,16],[500,260,160,16],[200,190,200,16],[400,190,200,16],[300,120,200,16]];
        layout.forEach(([x,y,w,h])=>{const w0=this.add.rectangle(x,y,w,h,0x3a2050);walls.add(w0);});
        const spikes=[[100,460],[300,460],[500,460]];
        spikes.forEach(([x,y])=>{this.add.rectangle(x,y,18,8,0xaa2222);});
        player=this.add.rectangle(80,440,22,28,COLOR); this.physics.add.existing(player);
        player.body.setCollideWorldBounds(true);
        this.physics.add.collider(player,walls);
        door=this.add.rectangle(300,100,32,40,0xffcc00);
        cursors=this.input.keyboard.createCursorKeys();
        statusText=this.add.text(16,16,'Reach the yellow door',{fontSize:'14px',fill:'#fff'});
        this.physics.add.overlap(player,()=>door,()=>{if(!won){won=true;this.add.text(180,250,'Solved!',{fontSize:'32px',fill:'#ffcc00'});}});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(won)return;
        if(cursors.left.isDown)player.body.setVelocityX(-180);
        else if(cursors.right.isDown)player.body.setVelocityX(180);
        else player.body.setVelocityX(0);
        if(cursors.up.isDown&&player.body.touching.down)player.body.setVelocityY(-480);
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 5) Double-Jump Precision — 20s to clear 8 floating platforms.
export const doubleJumpPrecision: Template = {
  id: 'platformer-double-jump-precision',
  genre: 'platformer',
  name: 'Double-Jump Precision',
  defaultTheme: {
    primary: '#00ddff', secondary: '#001', playerLabel: 'hopper', enemyLabel: 'miss',
    flavorText: '双跳精度挑战 — 20 秒内要落在 8 个浮岛上,掉下去就 GGEZ。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#001022;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let player, cursors, islands, hit=0, jumpsLeft=2, scoreText, timeText, gameOver=false;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:600,height:600,
    physics:{default:'arcade',arcade:{gravity:{y:900}}},
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#001022');
        player=this.add.rectangle(300,540,20,20,COLOR); this.physics.add.existing(player);
        cursors=this.input.keyboard.createCursorKeys();
        islands=this.physics.add.staticGroup();
        const pts=[[100,500],[220,420],[380,440],[520,360],[120,280],[280,220],[460,180],[300,80]];
        pts.forEach(([x,y])=>{const i=this.add.rectangle(x,y,40,12,0x224466);islands.add(i);});
        this.physics.add.collider(player,islands,(_,i)=>{if(!i.hit){i.hit=true;i.setFillStyle(0x44ff88);hit++;}});
        scoreText=this.add.text(16,16,'Hit: 0/8',{fontSize:'16px',fill:'#fff'});
        timeText=this.add.text(16,40,'Time: 20',{fontSize:'16px',fill:'#fff'});
        let t=20;
        this.time.addEvent({delay:1000,loop:true,callback:()=>{t--;timeText.setText('Time: '+t);if(t<=0){gameOver=true;this.physics.pause();this.add.text(180,280,'TIME — R',{fontSize:'28px',fill:'#ffaa66'});}}});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        if(player.body.blocking.down||player.body.touching.down)jumpsLeft=2;
        if(cursors.left.isDown)player.body.setVelocityX(-160);
        else if(cursors.right.isDown)player.body.setVelocityX(160);
        else player.body.setVelocityX(0);
        if(Phaser.Input.Keyboard.JustDown(cursors.up)&&jumpsLeft>0){player.body.setVelocityY(-380);jumpsLeft--;}
        if(player.y>700){gameOver=true;this.physics.pause();this.add.text(180,280,'FELL — R',{fontSize:'28px',fill:'#ff6666'});}
        scoreText.setText('Hit: '+hit+'/8');
      }
    }
  });
})();
</script></body></html>`;
  },
};

export const PLATFORMER_TEMPLATES: Template[] = [
  sideScrollerComet,
  verticalClimber,
  autoRunner,
  singleScreenPuzzle,
  doubleJumpPrecision,
];