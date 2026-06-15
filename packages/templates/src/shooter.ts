import type { Template, Theme } from './types';
import { LEVEL_DATA, BOSS_DATA } from './level-data';
import { renderHud, hudStyles } from './hud';

function buildVerticalShmup(theme: Theme, levelDataJson: string, bossDataJson: string, howToPlay: string, scoreKey: string): string {
  const c = parseInt(theme.primary.slice(1), 16);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#000018;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay, currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const LEVELS=${levelDataJson};
  const BOSS=${bossDataJson};
  let score=0, lives=3, currentLevel=0, gameOver=false, bossActive=false, bossPhase=0, bossHp=BOSS.hp;
  let player, cursors, bullets, enemies, enemyBullets, boss, lastFire=0, lastEnemyFire=0, phaseTimer=0;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){document.getElementById('hud').innerHTML='HOW TO PLAY: ${howToPlay.replace(/'/g, "\\'")} | Level: '+(currentLevel+1)+'/3 | Score: '+score+' | High: '+loadHigh()}

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
          spawnWave(this,LEVELS[currentLevel]);
          if(currentLevel===2)spawnBoss(this);
          this.input.keyboard.on('keydown-SPACE',()=>{if(gameOver)return;const now=Date.now();if(now-lastFire<200)return;lastFire=now;const b=this.add.rectangle(player.x,player.y-12,4,8,0xffffff);this.physics.add.existing(b);bullets.add(b);b.body.setVelocity(0,-500)});
          updateHud();
        },
        update(t,d){
          if(gameOver)return;
          if(cursors.left.isDown)player.body.setVelocityX(-LEVELS[currentLevel].playerSpeed);
          else if(cursors.right.isDown)player.body.setVelocityX(LEVELS[currentLevel].playerSpeed);
          else player.body.setVelocityX(0);
          const now=Date.now();
          if(LEVELS[currentLevel].enemyFireRateMs>0&&now-lastEnemyFire>LEVELS[currentLevel].enemyFireRateMs){
            lastEnemyFire=now;
            for(const e of enemies.getChildren()){if(Math.random()<0.3){const b=this.add.rectangle(e.x,e.y+12,4,8,0xff6666);this.physics.add.existing(b);enemyBullets.add(b);b.body.setVelocity(0,180)}}
          }
          this.physics.overlap(bullets,enemies,(b,e)=>{b.destroy();e.destroy();score+=20;updateHud()});
          this.physics.overlap(player,enemyBullets,()=>{hit(this)});
          this.physics.overlap(player,enemies,()=>{hit(this)});
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

  function spawnWave(scene,lv){
    for(let i=0;i<lv.enemyCount;i++){const e=scene.add.rectangle(50+i*45,50+Math.random()*150,20,20,0xff4444);scene.physics.add.existing(e);enemies.add(e);e.body.setVelocity(0,lv.enemySpeed)}
  }
  function spawnBoss(scene){boss=scene.add.rectangle(400,80,BOSS.w,BOSS.h,0xaa00aa);scene.physics.add.existing(boss);boss.body.setVelocity(50,0);boss.body.setCollideWorldBounds(true);boss.body.setBounce(1)}
  function hit(scene){lives--;updateHud();if(lives<=0){gameOver=true;saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>GAME OVER<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>R to restart</a></div>'}else{player.setPosition(400,420)}}
  function nextLevel(scene){if(currentLevel>=2){saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>Play again</a></div>';return}currentLevel++;score+=150;bossHp=BOSS.hp;updateHud();scene.game.destroy(true);newGame()}

  window.addEventListener('keydown',function(e){if(e.key==='r'||e.key==='R')location.reload()});
  newGame();
})();
</script></body></html>`;
}

function buildTwinStick(theme: Theme, levelDataJson: string, bossDataJson: string, howToPlay: string, scoreKey: string): string {
  const c = parseInt(theme.primary.slice(1), 16);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
${hudStyles}
<style>html,body{margin:0;background:#0a0202;color:#fff;font-family:monospace;overflow:hidden;cursor:crosshair}canvas{display:block}</style>
</head><body>
${renderHud({ howToPlay, currentLevel: 1, totalLevels: 3, highScore: 0, score: 0 })}
<div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  const SCORE_KEY='${scoreKey}';
  const LEVELS=${levelDataJson};
  const BOSS=${bossDataJson};
  let score=0, currentLevel=0, roomIdx=0, gameOver=false, bossActive=false;
  let player, enemies, enemyBullets, bullets, keyW, keyA, keyS, keyD, boss;

  function loadHigh(){try{return JSON.parse(localStorage.getItem(SCORE_KEY)||'{"high":0}').high}catch(e){return 0}}
  function saveHigh(s){try{localStorage.setItem(SCORE_KEY,JSON.stringify({high:Math.max(s,loadHigh())}))}catch(e){}}
  function updateHud(){document.getElementById('hud').innerHTML='HOW TO PLAY: ${howToPlay.replace(/'/g, "\\'")} | Room: '+(roomIdx+1)+'/'+LEVELS[currentLevel].rooms+' | Score: '+score+' | High: '+loadHigh()}

  function newGame(){
    new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:480,
      scene:{
        create(){
          this.add.rectangle(400,240,800,480,0x0a0202);
          player=this.add.rectangle(400,240,20,20,COLOR);this.physics.add.existing(player);player.body.setCollideWorldBounds(true);
          enemies=this.physics.add.group();enemyBullets=this.physics.add.group();bullets=this.physics.add.group();
          keyW=this.input.keyboard.addKey('W');keyA=this.input.keyboard.addKey('A');keyS=this.input.keyboard.addKey('S');keyD=this.input.keyboard.addKey('D');
          this.input.on('pointerdown',(p)=>{const b=this.add.rectangle(player.x,player.y,4,8,0xffff66);this.physics.add.existing(b);bullets.add(b);const dx=p.x-player.x,dy=p.y-player.y;const m=Math.sqrt(dx*dx+dy*dy);b.body.setVelocity(dx/m*400,dy/m*400)});
          spawnRoom(this,LEVELS[currentLevel]);
          if(currentLevel===2&&roomIdx===LEVELS[currentLevel].rooms-1)spawnBoss(this);
          this.physics.overlap(bullets,enemies,(b,e)=>{b.destroy();e.destroy();score+=20;updateHud()});
          this.physics.overlap(player,enemies,()=>die(this));
          this.physics.overlap(player,enemyBullets,()=>die(this));
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

  function spawnRoom(scene,lv){
    for(let i=0;i<lv.enemiesPerRoom;i++){const e=scene.add.rectangle(100+Math.random()*600,100+Math.random()*300,18,18,0xff4444);scene.physics.add.existing(e);enemies.add(e);e.body.setVelocity((Math.random()-0.5)*lv.enemySpeed,(Math.random()-0.5)*lv.enemySpeed);e.body.setCollideWorldBounds(true);e.body.setBounce(1)}
  }
  function spawnBoss(scene){boss=scene.add.rectangle(400,240,BOSS.w,BOSS.h,0xaa00aa);scene.physics.add.existing(boss);boss.hp=BOSS.hp;scene.time.addEvent({delay:BOSS.fireRate,loop:true,callback:()=>{for(let i=0;i<8;i++){const a=i*Math.PI/4+Date.now()*0.002;const b=scene.add.rectangle(boss.x,boss.y,4,8,0xffaa00);scene.physics.add.existing(b);enemyBullets.add(b);b.body.setVelocity(Math.cos(a)*200,Math.sin(a)*200)}}})}
  function die(scene){if(gameOver)return;gameOver=true;saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>GAME OVER<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>R to restart</a></div>'}
  function nextRoom(scene){roomIdx++;if(roomIdx>=LEVELS[currentLevel].rooms){if(currentLevel>=2){saveHigh(score);document.getElementById('g').innerHTML='<div style=color:#fff;text-align:center;padding:80px;font:24px monospace>ALL LEVELS CLEARED<br><br>Score: '+score+'<br>High: '+loadHigh()+'<br><br><a style=color:#ff6b3a href=javascript:location.reload()>Play again</a></div>';return}currentLevel++;roomIdx=0;score+=150;scene.game.destroy(true);newGame()}else{spawnRoom(scene,LEVELS[currentLevel])}}
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
  render(theme: Theme): string {
    return buildVerticalShmup(theme, JSON.stringify(LEVEL_DATA.verticalShmup), JSON.stringify(BOSS_DATA.verticalShmup), verticalShmup.howToPlay, 'whimsy:score:verticalShmup');
  },
};

export const twinStickBattler: Template = {
  id: 'twinStickBattler', genre: 'shooter', name: 'Twin-Stick Battler',
  howToPlay: 'WASD move · mouse aim · click to shoot · survive N rooms',
  defaultTheme: { primary: '#ff6b3a', secondary: '#ffffff', playerLabel: 'hero', enemyLabel: 'zombie', flavorText: '双摇杆射击,roguelike 风格。' },
  render(theme: Theme): string {
    return buildTwinStick(theme, JSON.stringify(LEVEL_DATA.twinStickBattler), JSON.stringify(BOSS_DATA.twinStickBattler), twinStickBattler.howToPlay, 'whimsy:score:twinStickBattler');
  },
};

export const SHOOTER_TEMPLATES: Template[] = [verticalShmup, twinStickBattler];
