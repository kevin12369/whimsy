import type { Template, Theme } from './types';

export const spaceDefender: Template = {
  id: 'shooter-space-defender',
  genre: 'shooter',
  name: 'Space Defender',
  defaultTheme: {
    primary: '#ff00ff', secondary: '#ffffff', playerLabel: 'ship', enemyLabel: 'ufo', flavorText: '',
  },
  render(theme: Theme): string {
    return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${theme.playerLabel} defender</title>
<style>body{margin:0;background:#000;color:#fff;font-family:sans-serif;overflow:hidden}canvas{display:block}</style>
</head><body>
<div id="g" style="width:800px;height:600px"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR='${theme.primary}', PLAYER='${theme.playerLabel}', ENEMY='${theme.enemyLabel}';
  new Phaser.Game({type:Phaser.AUTO,parent:'g',width:800,height:600,
    scene:{create(){
      this.add.rectangle(400,580,800,20,0x222222);
      const ship=this.physics.add.rectangle(400,540,32,32,parseInt(COLOR.slice(1),16));
      const bullets=this.physics.add.group();
      const enemies=this.physics.add.group();
      let score=0; const txt=this.add.text(16,16,'Score: 0',{fontSize:'20px',fill:'#fff'});
      this.input.keyboard.on('keydown',(e)=>{ if(e.code==='Space'){ const b=this.add.rectangle(ship.x,ship.y-16,4,12,0xffff00); bullets.add(b); b.body.velocity.y=-400; } });
      this.input.keyboard.on('keydown-LEFT',()=>{ ship.x-=20; });
      this.input.keyboard.on('keydown-RIGHT',()=>{ ship.x+=20; });
      this.input.keyboard.on('keydown-R',()=>location.reload());
      setInterval(()=>{ const en=this.add.rectangle(Phaser.Math.Between(50,750),0,24,24,0xff4444); enemies.add(en); en.body.velocity.y=200; }, 900);
      this.physics.add.overlap(bullets,enemies,(b,e)=>{ b.destroy(); e.destroy(); score+=10; txt.setText('Score: '+score); });
      this.physics.add.overlap(ship,enemies,()=>{ this.physics.pause(); this.add.text(300,280,'Game Over — press R',{fontSize:'24px',fill:'#fff'}); });
    }}});
})();
</script></body></html>`;
  },
};

export const skyFighter: Template = { ...spaceDefender, id: 'shooter-sky-fighter', name: 'Sky Fighter' };
export const boatBattler: Template = { ...spaceDefender, id: 'shooter-boat-battler', name: 'Boat Battler' };
export const turretGuard: Template = { ...spaceDefender, id: 'shooter-turret-guard', name: 'Turret Guard' };
export const meteorMash: Template = { ...spaceDefender, id: 'shooter-meteor-mash', name: 'Meteor Mash' };

export const SHOOTER_TEMPLATES: Template[] = [
  spaceDefender, skyFighter, boatBattler, turretGuard, meteorMash,
];
