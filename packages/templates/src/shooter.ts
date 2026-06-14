import type { Template, Theme } from './types';

// 1) Twin-Stick Battler — independent aim + movement via mouse + WASD.
export const twinStickBattler: Template = {
  id: 'shooter-twin-stick-battler',
  genre: 'shooter',
  name: 'Twin-Stick Battler',
  defaultTheme: {
    primary: '#ff00ff', secondary: '#ffffff', playerLabel: 'ship', enemyLabel: 'ufo',
    flavorText: 'WASD 移动 + 鼠标瞄准射击,经典双摇杆 — 像 Geometry Wars。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#050010;color:#fff;font-family:monospace;overflow:hidden;cursor:none}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let ship, bullets, enemies, score=0, scoreText, hp=3, hpText, gameOver=false;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:600,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#050010');
        ship=this.add.rectangle(400,300,28,28,COLOR);
        bullets=[];
        enemies=[];
        scoreText=this.add.text(16,16,'Score: 0',{fontSize:'18px',fill:'#fff'});
        hpText=this.add.text(16,40,'HP: 3',{fontSize:'18px',fill:'#ffaaaa'});
        this.input.keyboard.addKeys('W,A,S,D');
        this.input.on('pointermove',(p)=>{/*aim handled in update*/});
        this.input.on('pointerdown',()=>{
          const wx=ship.x, wy=ship.y;
          const dx=this.input.activePointer.worldX-wx, dy=this.input.activePointer.worldY-wy;
          const len=Math.sqrt(dx*dx+dy*dy)||1;
          bullets.push({x:wx,y:wy,vx:dx/len*520,vy:dy/len*520});
        });
        setInterval(()=>{enemies.push({x:Math.random()*800,y:0});},1100);
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        const k=this.input.keyboard;
        if(k.keys[17]?.isDown||k.keys[87]?.isDown)ship.y-=3.5;
        if(k.keys[65]?.isDown)ship.x-=3.5;
        if(k.keys[83]?.isDown)ship.y+=3.5;
        if(k.keys[68]?.isDown)ship.x+=3.5;
        ship.x=Math.max(15,Math.min(785,ship.x));
        ship.y=Math.max(15,Math.min(585,ship.y));
        // bullets
        for(let i=bullets.length-1;i>=0;i--){
          const b=bullets[i];
          if(!b.g){b.g=this.add.rectangle(b.x,b.y,6,6,0xffff66);}else{b.g.x+=b.vx*0.016;b.g.y+=b.vy*0.016;}
          if(b.g.x<0||b.g.x>800||b.g.y<0||b.g.y>600){b.g.destroy();bullets.splice(i,1);continue;}
          for(let j=enemies.length-1;j>=0;j--){
            const en=enemies[j];
            if(!en.g)en.g=this.add.rectangle(en.x,en.y,22,22,0xff3344);
            const dx=b.g.x-en.g.x,dy=b.g.y-en.g.y;
            if(dx*dx+dy*dy<400){b.g.destroy();bullets.splice(i,1);en.g.destroy();enemies.splice(j,1);score+=15;scoreText.setText('Score: '+score);break;}
          }
        }
        // enemies
        for(let i=enemies.length-1;i>=0;i--){
          const en=enemies[i];
          en.y+=2;
          if(!en.g)en.g=this.add.rectangle(en.x,en.y,22,22,0xff3344);
          else en.g.y=en.y;
          if(en.y>620){en.g.destroy();enemies.splice(i,1);continue;}
          const dx=en.g.x-ship.x,dy=en.g.y-ship.y;
          if(dx*dx+dy*dy<700){en.g.destroy();enemies.splice(i,1);hp--;hpText.setText('HP: '+hp);if(hp<=0){gameOver=true;this.add.text(280,280,'DEAD — R',{fontSize:'30px',fill:'#ff4444'});}}
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 2) Vertical Shmup — Touhou-like descending bullets, player auto-fires.
export const verticalShmup: Template = {
  id: 'shooter-vertical-shmup',
  genre: 'shooter',
  name: 'Vertical Shmup',
  defaultTheme: {
    primary: '#ff2266', secondary: '#fff', playerLabel: 'witch', enemyLabel: 'fairy',
    flavorText: '纵向弹幕射击,自机固定底部,左右躲子弹,自动射击。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#000010;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let ship, cursors, buls, eBuls, enemies, score=0, scoreText, gameOver=false;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:480,height:640,
    physics:{default:'arcade'},
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#000010');
        ship=this.add.rectangle(240,580,20,24,COLOR);
        cursors=this.input.keyboard.createCursorKeys();
        buls=this.add.group();
        eBuls=this.add.group();
        enemies=this.add.group();
        scoreText=this.add.text(16,16,'Score: 0',{fontSize:'16px',fill:'#fff'});
        this.time.addEvent({delay:280,loop:true,callback:()=>{
          const b=this.add.rectangle(ship.x,ship.y-16,4,10,0x66ffff);buls.add(b);
        }});
        this.time.addEvent({delay:1200,loop:true,callback:()=>{
          const e=this.add.rectangle(Phaser.Math.Between(40,440),-20,24,24,0xff88aa);enemies.add(e);
          this.physics.add.existing(e);e.body.setVelocityY(70);
          this.time.addEvent({delay:600,loop:true,callback:()=>{
            const b=this.add.rectangle(e.x,e.y+12,4,8,0xff66aa);eBuls.add(b);this.physics.add.existing(b);b.body.setVelocityY(220);
            if(!e.active)return false;
          }});
        }});
        this.physics.add.overlap(buls,enemies,(b,e)=>{b.destroy();e.destroy();score+=50;scoreText.setText('Score: '+score);});
        this.physics.add.overlap(ship,eBuls,()=>{gameOver=true;this.add.text(140,290,'BOMB — R',{fontSize:'30px',fill:'#ff4444'});});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        if(cursors.left.isDown)ship.x-=4;
        else if(cursors.right.isDown)ship.x+=4;
        ship.x=Math.max(15,Math.min(465,ship.x));
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 3) Bullet Hell — fixed ship, hundreds of rotating bullets.
export const bulletHell: Template = {
  id: 'shooter-bullet-hell',
  genre: 'shooter',
  name: 'Bullet Hell',
  defaultTheme: {
    primary: '#ff8800', secondary: '#000', playerLabel: 'core', enemyLabel: 'orb',
    flavorText: '固定自机 + 大量放射子弹,只有一个小躲避点。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#000;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let ship, cursors, bullets, score=0, scoreText, hitRadius=14, gameOver=false, frame=0;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:500,height:500,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#000');
        ship=this.add.rectangle(250,250,16,16,COLOR);
        cursors=this.input.keyboard.createCursorKeys();
        bullets=[];
        scoreText=this.add.text(16,16,'Survive',{fontSize:'14px',fill:'#fff'});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        frame++;
        if(cursors.left.isDown)ship.x-=3;
        if(cursors.right.isDown)ship.x+=3;
        if(cursors.up.isDown)ship.y-=3;
        if(cursors.down.isDown)ship.y+=3;
        ship.x=Math.max(10,Math.min(490,ship.x));
        ship.y=Math.max(10,Math.min(490,ship.y));
        if(frame%30===0){
          const cx=250,cy=80,n=24;
          for(let i=0;i<n;i++){
            const ang=(i/n)*Math.PI*2;
            bullets.push({x:cx,y:cy,vx:Math.cos(ang)*2.4,vy:Math.sin(ang)*2.4,g:null});
          }
        }
        if(frame%120===0){score+=1;scoreText.setText('Wave: '+score);}
        for(let i=bullets.length-1;i>=0;i--){
          const b=bullets[i];
          if(!b.g)b.g=this.add.rectangle(b.x,b.y,5,5,0xffff66);
          b.x+=b.vx;b.y+=b.vy;b.g.x=b.x;b.g.y=b.y;
          if(b.x<0||b.x>500||b.y<0||b.y>500){b.g.destroy();bullets.splice(i,1);continue;}
          const dx=b.x-ship.x,dy=b.y-ship.y;
          if(dx*dx+dy*dy<hitRadius*hitRadius){gameOver=true;this.add.text(170,230,'HIT — R',{fontSize:'28px',fill:'#ff6666'});}
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 4) Tower Defense — bottom row of towers, place to shoot descending waves.
export const towerDefense: Template = {
  id: 'shooter-tower-defense',
  genre: 'shooter',
  name: 'Tower Defense',
  defaultTheme: {
    primary: '#44ffaa', secondary: '#224422', playerLabel: 'turret', enemyLabel: 'invader',
    flavorText: '底部放塔,上面刷怪。塔自动朝最近的怪开火,漏 5 个就 GG。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#001a14;color:#fff;font-family:monospace;overflow:hidden}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let towers, enemies, shots, misses=0, score=0, scoreText, missText, gameOver=false, frame=0;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:600,height:600,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#001a14');
        towers=[]; enemies=[]; shots=[];
        for(let i=0;i<4;i++){
          const g=this.add.rectangle(80+i*160,520,40,40,0x224422);
          towers.push({x:80+i*160,y:520,cooldown:0,g});
        }
        scoreText=this.add.text(16,16,'Kills: 0',{fontSize:'16px',fill:'#fff'});
        missText=this.add.text(16,40,'Miss: 0/5',{fontSize:'16px',fill:'#ffaaaa'});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        frame++;
        if(frame%90===0){
          enemies.push({x:Math.random()*580+10,y:-20,hp:2,vy:1.0+Math.random()*0.8,g:null});
        }
        for(let i=enemies.length-1;i>=0;i--){
          const e=enemies[i];
          if(!e.g)e.g=this.add.rectangle(e.x,e.y,18,18,0xff3344);
          e.y+=e.vy;e.g.y=e.y;
          if(e.y>580){e.g.destroy();enemies.splice(i,1);misses++;missText.setText('Miss: '+misses+'/5');if(misses>=5){gameOver=true;this.add.text(180,280,'BREACH — R',{fontSize:'28px',fill:'#ff4444'});}continue;}
          for(const t of towers){
            if(t.cooldown<=0){
              const dx=e.x-t.x,dy=e.y-t.y;
              if(dx*dx+dy*dy<200*200){const len=Math.sqrt(dx*dx+dy*dy)||1;shots.push({x:t.x,y:t.y,vx:dx/len*8,vy:dy/len*8,g:null});t.cooldown=24;break;}
            }
          }
        }
        for(let i=shots.length-1;i>=0;i--){
          const s=shots[i];
          if(!s.g)s.g=this.add.rectangle(s.x,s.y,4,4,COLOR);
          s.x+=s.vx;s.y+=s.vy;s.g.x=s.x;s.g.y=s.y;
          if(s.x<0||s.x>600||s.y<0||s.y>600){s.g.destroy();shots.splice(i,1);continue;}
          for(let j=enemies.length-1;j>=0;j--){
            const e=enemies[j];
            const dx=s.x-e.x,dy=s.y-e.y;
            if(dx*dx+dy*dy<160){s.g.destroy();shots.splice(i,1);e.hp--;if(e.hp<=0){e.g.destroy();enemies.splice(j,1);score++;scoreText.setText('Kills: '+score);}break;}
          }
        }
        for(const t of towers)if(t.cooldown>0)t.cooldown--;
      }
    }
  });
})();
</script></body></html>`;
  },
};

// 5) Target Shooting Gallery — stationary aim, 30s to hit 30 targets.
export const targetShootingGallery: Template = {
  id: 'shooter-target-shooting-gallery',
  genre: 'shooter',
  name: 'Target Shooting Gallery',
  defaultTheme: {
    primary: '#ffd700', secondary: '#000', playerLabel: 'sniper', enemyLabel: 'target',
    flavorText: '固定机位打靶,30 秒内击 30 个靶 — 漏一个扣分。',
  },
  render(theme: Theme): string {
    const c = parseInt(theme.primary.slice(1), 16);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${theme.playerLabel}</title>
<style>html,body{margin:0;background:#1a1408;color:#fff;font-family:monospace;overflow:hidden;cursor:crosshair}canvas{display:block}</style>
</head><body><div id="g"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR=${c}, PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  let targets, hits=0, miss=0, time=30, hText, tText, frame=0, gameOver=false, reticle;
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:500,
    scene:{
      create(){
        this.cameras.main.setBackgroundColor('#1a1408');
        targets=[];
        reticle=this.add.rectangle(400,250,10,10,COLOR);
        this.input.on('pointermove',(p)=>{reticle.x=p.x;reticle.y=p.y;});
        this.input.on('pointerdown',()=>{
          let hit=false;
          for(let i=targets.length-1;i>=0;i--){
            const t=targets[i];
            const dx=reticle.x-t.x,dy=reticle.y-t.y;
            if(dx*dx+dy*dy<t.r*t.r){t.g.destroy();targets.splice(i,1);hits++;hText.setText('Hits: '+hits+'/30');hit=true;break;}
          }
          if(!hit){miss++;}
        });
        hText=this.add.text(16,16,'Hits: 0/30',{fontSize:'16px',fill:'#fff'});
        tText=this.add.text(16,40,'Time: 30',{fontSize:'16px',fill:'#fff'});
        this.time.addEvent({delay:1000,loop:true,callback:()=>{time--;tText.setText('Time: '+time);if(time<=0){gameOver=true;this.add.text(220,230,'DONE — R',{fontSize:'28px',fill:'#ffaa44'});}}});
        this.input.keyboard.on('keydown-R',()=>location.reload());
      },
      update(){
        if(gameOver)return;
        frame++;
        if(frame%60===0&&hits+miss<30){
          const x=Math.random()*780+10,y=Math.random()*440+40;
          const r=14+Math.random()*16;
          const g=this.add.circle(x,y,r,0xff3344);
          targets.push({x,y,r,g});
        }
      }
    }
  });
})();
</script></body></html>`;
  },
};

export const SHOOTER_TEMPLATES: Template[] = [
  twinStickBattler,
  verticalShmup,
  bulletHell,
  towerDefense,
  targetShootingGallery,
];