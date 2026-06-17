import type { Template, Theme } from './types';
import type { GameConfig } from './game-config';
import { LEVEL_DATA, BOSS_DATA } from './level-data';
import { renderHud, hudStyles } from './hud';
import { clampConfig } from './game-config';

const c = (cfg: GameConfig, key: keyof GameConfig, lo: number, hi: number, fallback: number): number => {
  const v = cfg[key] as number | undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  return Math.max(lo, Math.min(hi, Math.round(v)));
};

function buildHtml(theme: Theme, cfg: GameConfig): string {
  const playerSpeed = c(cfg, 'playerSpeed', 50, 400, 220);
  const jumpVelocity = c(cfg, 'jumpVelocity', 200, 600, 460);
  const gravity = c(cfg, 'gravity', 400, 1200, 900);
  const enemyCount = c(cfg, 'enemyCount', 1, 15, 5);
  const enemySpeed = c(cfg, 'enemySpeed', 50, 300, 200);
  const spawnInterval = c(cfg, 'spawnIntervalMs', 500, 3000, 1400);
  const lives = c(cfg, 'lives', 1, 9, 3);
  const primary = parseInt(theme.primary.slice(1), 16);
  const w = parseInt(theme.secondary.slice(1), 16);
  const scoreKey = 'whimsy:score:sideScrollerComet';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#02030a;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
<script>window.addEventListener('error',function(e){document.body.insertAdjacentHTML('beforeend','<pre style=color:red>'+e.message+'</pre>')});</script>
${renderHud({ howToPlay: '← → move · ↑/SPACE jump · reach the flag', currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script>
(function(){
  const COLOR=${primary}, WHITE=${w}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const PLAYER_SPEED=${playerSpeed}, JUMP_VELOCITY=${jumpVelocity}, GRAVITY=${gravity};
  const ENEMY_COUNT=${enemyCount}, ENEMY_SPEED=${enemySpeed}, SPAWN_INTERVAL=${spawnInterval}, LIVES=${lives};
  const LEVELS=${JSON.stringify(LEVEL_DATA.sideScrollerComet)};
  const BOSS=${JSON.stringify(BOSS_DATA.sideScrollerComet)};
  if (typeof Phaser === 'undefined') {
    const g = document.getElementById('g') || document.body;
    g.innerHTML = '<div style="color:#fff;padding:40px;font:14px monospace">Phaser failed to load. Check the network/CDN.</div>';
    return;
  }
  let score=0, lives=LIVES, gameOver=false, currentLevel=0, bossActive=false, bossHp=BOSS.hp, invincibleUntil=0;
  let player, cursors, ground, platforms, enemies, stars, goal, scoreText, livesText, boss, game;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){
    const h=document.getElementById('hud');
    h.innerHTML='HOW TO PLAY: ← → move · ↑/SPACE jump · reach the flag | Level: '+(currentLevel+1)+'/3 | Score: '+score+' | High: '+loadHigh();
  }

  function newGame(){
    game = new Phaser.Game({type:Phaser.AUTO,parent:window.__WHIMSY_G__,width:800,height:480,
      physics:{default:'arcade',arcade:{gravity:{y:GRAVITY}}},
      scene:{
        create(){
          this.add.rectangle(400,240,800,480,0x02030a);
          const lv=LEVELS[currentLevel];
          platforms=this.physics.add.staticGroup();
          for(const p of lv.platforms)platforms.add(this.add.rectangle(p.x+p.w/2,p.y+p.h/2,p.w,p.h,0x334455));
          if(lv.movingPlatforms)for(const p of lv.movingPlatforms){
            const r=this.add.rectangle(p.x+p.w/2,p.y+p.h/2,p.w,p.h,0x556677);
            this.tweens.add({targets:r,x:r.x+p.dx,y:r.y+p.dy,duration:2000/p.sp*1000,yoyo:true,repeat:-1});
          }
          player=this.add.rectangle(50,360,28,28,COLOR);
          this.physics.add.existing(player);
          player.body.setCollideWorldBounds(true);
          this.physics.add.collider(player,platforms);
          enemies=this.physics.add.group();
          for(let i=0;i<ENEMY_COUNT;i++){const r=this.add.rectangle(80+i*(700/ENEMY_COUNT),360,24,24,parseInt('${cfg.enemyColor.replace('#','')}',16));this.physics.add.existing(r);enemies.add(r);r.body.setVelocity(-ENEMY_SPEED,0)}
          stars=this.physics.add.group();
          for(const s of lv.stars){const r=this.add.rectangle(s.x,s.y,12,12,0xffff66);this.physics.add.existing(r);stars.add(r)}
          goal=this.add.rectangle(lv.goal.x,lv.goal.y-20,30,40,0x44ff44);
          this.physics.add.existing(goal,true);
          cursors=this.input.keyboard.createCursorKeys();
          this.physics.add.overlap(player,stars,(p,s)=>{s.destroy();score+=10;updateHud()});
          this.physics.add.overlap(player,enemies,()=>{if(Date.now()<invincibleUntil||player.body.touching.down)return;hit()});
          this.physics.add.overlap(player,goal,()=>{nextLevel(this)});
          if(currentLevel===2){bossActive=true;boss=this.add.rectangle(BOSS.x,BOSS.y,BOSS.w,BOSS.h,0xaa00aa);this.physics.add.existing(boss);boss.hp=BOSS.hp;this.tweens.add({targets:boss,x:100,duration:2000/BOSS.speed*1000,yoyo:true,repeat:-1})}
          invincibleUntil=Date.now()+1500;
          this.physics.add.overlap(player,boss,()=>{if(!boss||Date.now()<invincibleUntil)return;if(player.body.touching.down&&player.body.velocity.y>200){boss.hp--;player.body.setVelocityY(-JUMP_VELOCITY*0.9);if(boss.hp<=0){boss.destroy();boss=null;score+=200;updateHud();setTimeout(()=>nextLevel(this),500)}else{score+=50;updateHud()}}else hit()});
          updateHud();
        },
        update(){
          if(gameOver||!player)return;
          if(cursors.left.isDown)player.body.setVelocityX(-PLAYER_SPEED);
          else if(cursors.right.isDown)player.body.setVelocityX(PLAYER_SPEED);
          else player.body.setVelocityX(0);
          if((cursors.up.isDown||cursors.space.isDown)&&player.body.touching.down)player.body.setVelocityY(-JUMP_VELOCITY);
        }
      }
    });
  }

  function hit(){
    lives--;updateHud();
    if(lives<=0){gameOver=true;saveHigh(score);const g=document.getElementById('g');g.innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>GAME OVER<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#3aa6ff href=javascript:location.reload()>R to restart</a></div>'}
    else player.setPosition(50,360);
  }

  function nextLevel(scene){
    if(currentLevel>=2){saveHigh(score);const g=document.getElementById('g');g.innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#3aa6ff href=javascript:location.reload()>Play again</a></div>';return}
    currentLevel++;score+=100;updateHud();scene.game.destroy(true);newGame();
  }

  const restartHandler = function(e){if(e.key==='r'||e.key==='R')location.reload()};
  window.addEventListener('keydown', restartHandler);
  newGame();
  window.__whimsy_cleanup = function() {
    try { game.destroy(true); } catch (e) {}
    document.removeEventListener('keydown', restartHandler);
  };
})();
</script></body></html>`;
}

export const sideScrollerComet: Template = {
  id: 'sideScrollerComet',
  genre: 'platformer',
  name: 'Side-Scroller Comet',
  howToPlay: '← → move · ↑/SPACE jump · reach the flag',
  defaultTheme: {
    primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid',
    flavorText: '像马里奥那样,主角是颗彗星,在太空里躲小行星。',
  },
  consumes: ['primary', 'secondary', 'playerLabel', 'enemyLabel', 'playerSpeed', 'jumpVelocity', 'gravity', 'enemyCount', 'enemySpeed', 'spawnIntervalMs', 'lives'],
  clamp: {
    playerSpeed: [50, 400],
    jumpVelocity: [200, 600],
    gravity: [400, 1200],
    enemyCount: [1, 15],
    enemySpeed: [50, 300],
    spawnIntervalMs: [500, 3000],
    lives: [1, 9],
  },
  render(theme: Theme, gameConfig: GameConfig): string {
    const cfg = clampConfig(gameConfig);
    return buildHtml(theme, cfg);
  },
};

export const PLATFORMER_TEMPLATES: Template[] = [sideScrollerComet];
