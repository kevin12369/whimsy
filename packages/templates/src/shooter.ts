import type { Template, Theme } from './types';
import type { GameConfig } from './game-config';
import { LEVEL_DATA, BOSS_DATA } from './level-data';
import { renderHud, hudStyles } from './hud';
import { clampConfig } from './game-config';

const c = (cfg: GameConfig, key: keyof GameConfig, lo: number, hi: number, fallback: number, int = true): number => {
  const v = cfg[key] as number | undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback;
  let x = Math.max(lo, Math.min(hi, v));
  if (int) x = Math.round(x);
  return x;
};

function buildVerticalShmup(theme: Theme, cfg: GameConfig): string {
  const scrollSpeed = c(cfg, 'scrollSpeed', 1, 3, 1.5, false);
  const enemyFireRate = c(cfg, 'enemyFireRateMs', 0, 3000, 1500);
  const enemyRows = c(cfg, 'enemyRows', 1, 5, 3);
  const lives = c(cfg, 'lives', 1, 9, 3);
  const c1 = parseInt(theme.primary.slice(1), 16);
  const scoreKey = 'whimsy:score:verticalShmup';
  const enemyColor = parseInt((cfg.enemyColor ?? theme.primary).replace('#', ''), 16);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#000018;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay: '← → move · SPACE shoot · dodge bullets', currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c1}, ENEMY_COLOR=${enemyColor}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const SCROLL_SPEED=${scrollSpeed}, ENEMY_FIRE_RATE=${enemyFireRate}, ENEMY_ROWS=${enemyRows}, LIVES=${lives};
  const LEVELS=${JSON.stringify(LEVEL_DATA.verticalShmup)};
  const BOSS=${JSON.stringify(BOSS_DATA.verticalShmup)};
  let score=0, lives=LIVES, currentLevel=0, gameOver=false, bossActive=false, bossPhase=0, bossHp=BOSS.hp, invincibleUntil=0;
  let player, cursors, bullets, enemies, enemyBullets, boss, lastFire=0, lastEnemyFire=0, phaseTimer=0;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){document.getElementById('hud').innerHTML='HOW TO PLAY: ← → move · SPACE shoot · dodge bullets | Level: '+(currentLevel+1)+'/3 | Score: '+score+' | High: '+loadHigh()}

  function newGame(){
    new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:480,
      scene:{
        create(){
          this.add.rectangle(400,240,800,480,0x000018);
          player=this.add.rectangle(400,420,24,24,COLOR);this.physics.add.existing(player);player.body.setCollideWorldBounds(true);
          cursors=this.input.keyboard.createCursorKeys();
          bullets=this.physics.add.group();
          enemies=this.physics.add.group();
          enemyBullets=this.physics.add.group();
          const baseCount=8;
          for(let r=0;r<ENEMY_ROWS;r++){for(let i=0;i<baseCount;i++){const e=this.add.rectangle(50+i*45,50+r*45,20,20,ENEMY_COLOR);this.physics.add.existing(e);enemies.add(e);e.body.setVelocity(0,80*SCROLL_SPEED)}}
          if(currentLevel===2)spawnBoss(this);
          invincibleUntil=Date.now()+1500;
          this.input.keyboard.on('keydown-SPACE',()=>{if(gameOver)return;const now=Date.now();if(now-lastFire<200)return;lastFire=now;const b=this.add.rectangle(player.x,player.y-12,4,8,0xffffff);this.physics.add.existing(b);bullets.add(b);b.body.setVelocity(0,-500)});
          updateHud();
        },
        update(t,d){
          if(gameOver)return;
          if(cursors.left.isDown)player.body.setVelocityX(-200);
          else if(cursors.right.isDown)player.body.setVelocityX(200);
          else player.body.setVelocityX(0);
          const now=Date.now();
          if(ENEMY_FIRE_RATE>0&&now-lastEnemyFire>ENEMY_FIRE_RATE){
            lastEnemyFire=now;
            for(const e of enemies.getChildren()){if(Math.random()<0.3){const b=this.add.rectangle(e.x,e.y+12,4,8,0xff6666);this.physics.add.existing(b);enemyBullets.add(b);b.body.setVelocity(0,180)}}
          }
          this.physics.overlap(bullets,enemies,(b,e)=>{b.destroy();e.destroy();score+=20;updateHud()});
          this.physics.overlap(player,enemyBullets,()=>{if(Date.now()<invincibleUntil)return;hit(this)});
          this.physics.overlap(player,enemies,()=>{if(Date.now()<invincibleUntil)return;hit(this)});
          if(boss){
            phaseTimer+=d;
            if(phaseTimer>3000){phaseTimer=0;bossPhase=(bossPhase+1)%3}
            if(now%200<20){
              const angle=phaseTimer*0.01;
              for(let i=0;i<8;i++){
                const a=angle+i*Math.PI/4+phaseTimer*0.005;
                const b=this.add.rectangle(boss.x,boss.y+30,4,8,0xffaa00);
                this.physics.add.existing(b);enemyBullets.add(b);
                b.body.setVelocity(Math.cos(a)*200,Math.sin(a)*200+50);
              }
            }
            this.physics.overlap(bullets,boss,(b)=>{b.destroy();bossHp--;score+=50;updateHud();if(bossHp<=0){boss.destroy();boss=null;score+=500;updateHud();setTimeout(()=>nextLevel(this),500)}});
          }
        }
      }
    });
  }

  function spawnBoss(scene){boss=scene.add.rectangle(400,80,BOSS.w,BOSS.h,0xaa00aa);scene.physics.add.existing(boss);boss.body.setVelocity(50,0);boss.body.setCollideWorldBounds(true);boss.body.setBounce(1)}
  function hit(scene){lives--;updateHud();if(lives<=0){gameOver=true;saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>GAME OVER<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>R to restart</a></div>'}else{player.setPosition(400,420)}}
  function nextLevel(scene){if(currentLevel>=2){saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>Play again</a></div>';return}currentLevel++;score+=150;bossHp=BOSS.hp;updateHud();scene.game.destroy(true);newGame()}

  window.addEventListener('keydown',function(e){if(e.key==='r'||e.key==='R')location.reload()});
  newGame();
})();
</script></body></html>`;
}

function buildTwinStick(theme: Theme, cfg: GameConfig): string {
  const rooms = c(cfg, 'roomCount', 1, 8, 4);
  const enemiesPerRoom = c(cfg, 'enemiesPerRoom', 2, 10, 5);
  const enemyFireMs = c(cfg, 'enemyFireMs', 0, 3000, 1500);
  const c1 = parseInt(theme.primary.slice(1), 16);
  const scoreKey = 'whimsy:score:twinStickBattler';

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#0a0202;color:#fff;font-family:monospace;overflow:hidden;cursor:crosshair}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay: 'WASD move · mouse aim · click to shoot · survive N rooms', currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c1}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const ROOMS=${rooms}, ENEMIES_PER_ROOM=${enemiesPerRoom}, ENEMY_FIRE_MS=${enemyFireMs};
  const LEVELS=${JSON.stringify(LEVEL_DATA.twinStickBattler)};
  const BOSS=${JSON.stringify(BOSS_DATA.twinStickBattler)};
  let score=0, currentLevel=0, roomIdx=0, gameOver=false, bossActive=false, invincibleUntil=0;
  let player, enemies, enemyBullets, bullets, keyW, keyA, keyS, keyD, boss;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){document.getElementById('hud').innerHTML='HOW TO PLAY: WASD move · mouse aim · click to shoot · survive N rooms | Room: '+(roomIdx+1)+'/'+ROOMS+' | Score: '+score+' | High: '+loadHigh()}

  function newGame(){
    new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:480,
      scene:{
        create(){
          this.add.rectangle(400,240,800,480,0x0a0202);
          player=this.add.rectangle(400,240,20,20,COLOR);this.physics.add.existing(player);player.body.setCollideWorldBounds(true);
          enemies=this.physics.add.group();enemyBullets=this.physics.add.group();bullets=this.physics.add.group();
          keyW=this.input.keyboard.addKey('W');keyA=this.input.keyboard.addKey('A');keyS=this.input.keyboard.addKey('S');keyD=this.input.keyboard.addKey('D');
          this.input.on('pointerdown',(p)=>{const b=this.add.rectangle(player.x,player.y,4,8,0xffff66);this.physics.add.existing(b);bullets.add(b);const dx=p.x-player.x,dy=p.y-player.y;const m=Math.sqrt(dx*dx+dy*dy)||1;b.body.setVelocity(dx/m*400,dy/m*400)});
          spawnRoom(this);
          if(currentLevel===2&&roomIdx===ROOMS-1)spawnBoss(this);
          invincibleUntil=Date.now()+1500;
          this.physics.overlap(bullets,enemies,(b,e)=>{b.destroy();e.destroy();score+=20;updateHud()});
          this.physics.overlap(player,enemies,()=>{if(Date.now()<invincibleUntil)return;die(this)});
          this.physics.overlap(player,enemyBullets,()=>{if(Date.now()<invincibleUntil)return;die(this)});
          if(boss){this.physics.overlap(bullets,boss,(b)=>{b.destroy();boss.hp--;score+=50;updateHud();if(boss.hp<=0){boss.destroy();boss=null;score+=500;updateHud();setTimeout(()=>nextRoom(this),500)}});this.physics.overlap(player,boss,()=>die(this))}
          updateHud();
        },
        update(){
          if(gameOver||!player)return;
          if(keyA.isDown)player.body.setVelocityX(-200);
          else if(keyD.isDown)player.body.setVelocityX(200);
          else player.body.setVelocityX(0);
          if(keyW.isDown)player.body.setVelocityY(-200);
          else if(keyS.isDown)player.body.setVelocityY(200);
          else player.body.setVelocityY(0);
        }
      }
    });
  }

  function spawnRoom(scene){
    for(let i=0;i<ENEMIES_PER_ROOM;i++){const e=scene.add.rectangle(100+Math.random()*600,100+Math.random()*300,18,18,0xff4444);scene.physics.add.existing(e);enemies.add(e);e.body.setVelocity((Math.random()-0.5)*60,(Math.random()-0.5)*60);e.body.setCollideWorldBounds(true);e.body.setBounce(1)}
  }
  function spawnBoss(scene){boss=scene.add.rectangle(400,240,BOSS.w,BOSS.h,0xaa00aa);scene.physics.add.existing(boss);boss.hp=BOSS.hp;scene.time.addEvent({delay:Math.max(ENEMY_FIRE_MS,200),loop:true,callback:()=>{for(let i=0;i<8;i++){const a=i*Math.PI/4+Date.now()*0.002;const b=scene.add.rectangle(boss.x,boss.y,4,8,0xffaa00);scene.physics.add.existing(b);enemyBullets.add(b);b.body.setVelocity(Math.cos(a)*200,Math.sin(a)*200)}}})}
  function die(scene){if(gameOver)return;gameOver=true;saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>GAME OVER<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>R to restart</a></div>'}
  function nextRoom(scene){roomIdx++;if(roomIdx>=ROOMS){if(currentLevel>=2){saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>Play again</a></div>';return}currentLevel++;roomIdx=0;score+=150;scene.game.destroy(true);newGame()}else{spawnRoom(scene)}}
  function isRoomCleared(){return enemies.countActive()===0}

  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:480,scene:{create(){this.add.rectangle(400,240,800,480,0x0a0202);this.add.text(300,230,'Loading…',{fontSize:'20px',fill:'#fff'})}}});
  setTimeout(()=>{document.getElementById('g').innerHTML='<div id="g"></div>';newGame()},100);

  window.addEventListener('keydown',function(e){if(e.key==='r'||e.key==='R')location.reload()});
})();
</script></body></html>`;
}

export const verticalShmup: Template = {
  id: 'verticalShmup', genre: 'shooter', name: 'Vertical Shmup',
  howToPlay: '← → move · SPACE shoot · dodge bullets',
  defaultTheme: { primary: '#ff6b3a', secondary: '#ffffff', playerLabel: 'ship', enemyLabel: 'alien', flavorText: '纵版弹幕射击,经典街机风。' },
  consumes: ['primary', 'secondary', 'playerLabel', 'enemyLabel', 'scrollSpeed', 'enemyFireRateMs', 'enemyRows', 'lives'],
  clamp: {
    scrollSpeed: [1, 3],
    enemyFireRateMs: [0, 3000],
    enemyRows: [1, 5],
    lives: [1, 9],
  },
  render(theme: Theme, gameConfig: GameConfig): string {
    return buildVerticalShmup(theme, clampConfig(gameConfig));
  },
};

export const twinStickBattler: Template = {
  id: 'twinStickBattler', genre: 'shooter', name: 'Twin-Stick Battler',
  howToPlay: 'WASD move · mouse aim · click to shoot · survive N rooms',
  defaultTheme: { primary: '#ff6b3a', secondary: '#ffffff', playerLabel: 'hero', enemyLabel: 'zombie', flavorText: '双摇杆射击,roguelike 风格。' },
  consumes: ['primary', 'secondary', 'playerLabel', 'enemyLabel', 'roomCount', 'enemiesPerRoom', 'enemyFireMs'],
  clamp: {
    roomCount: [1, 8],
    enemiesPerRoom: [2, 10],
    enemyFireMs: [0, 3000],
  },
  render(theme: Theme, gameConfig: GameConfig): string {
    return buildTwinStick(theme, clampConfig(gameConfig));
  },
};

export const SHOOTER_TEMPLATES: Template[] = [verticalShmup, twinStickBattler];
