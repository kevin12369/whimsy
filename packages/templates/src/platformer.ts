import type { Template, Theme } from './types';

export const spaceComet: Template = {
  id: 'platformer-space-comet',
  genre: 'platformer',
  name: 'Space Comet',
  defaultTheme: {
    primary: '#3aa6ff', secondary: '#ffffff', playerLabel: 'comet', enemyLabel: 'asteroid',
    flavorText: 'Dodge asteroids and collect stardust.',
  },
  render(theme: Theme): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${theme.playerLabel} in Space</title>
<style>body{margin:0;background:#000;color:#fff;font-family:sans-serif;overflow:hidden}canvas{display:block}</style>
</head>
<body>
<div id="game" style="width:800px;height:600px"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
<script>
(function(){
  const COLOR = '${theme.primary}';
  const PLAYER = '${theme.playerLabel}';
  const ENEMY = '${theme.enemyLabel}';
  const config = {
    type: Phaser.AUTO, parent: 'game', width: 800, height: 600,
    physics: { default: 'arcade', arcade: { gravity: { y: 800 }, debug: false } },
    scene: { preload, create, update }
  };
  let player, cursors, stars, enemies, score = 0, scoreText, gameOver = false;
  new Phaser.Game(config);
  function preload(){}
  function create(){
    this.add.rectangle(400,580,800,40,0x444444).setOrigin(0.5,0.5);
    player = this.physics.add.rectangle(100,500,32,32,parseInt(COLOR.slice(1),16));
    this.physics.add.collider(player, this.add.rectangle(400,580,800,40,0x444444));
    cursors = this.input.keyboard.createCursorKeys();
    stars = this.physics.add.group({ key: 'star', repeat: 8, setXY: { x: 200, y: 0, stepX: 70 } });
    enemies = this.physics.add.group();
    setInterval(()=>{ const e = this.add.rectangle(800, Phaser.Math.Between(50,500), 24,24,0xff4444); enemies.add(e); e.body.velocity.x = -200; }, 1500);
    this.physics.add.overlap(player, stars, (p,s)=>{ s.destroy(); score += 10; scoreText.setText('Score: '+score); });
    this.physics.add.overlap(player, enemies, ()=>{ gameOver = true; this.physics.pause(); this.add.text(250,280,'Game Over — press R',{fontSize:'24px',fill:'#fff'}); });
    scoreText = this.add.text(16,16,'Score: 0',{fontSize:'20px',fill:'#fff'});
    this.input.keyboard.on('keydown-R', ()=>{ location.reload(); });
  }
  function update(){
    if(gameOver) return;
    if(cursors.left.isDown) player.body.velocity.x = -200;
    else if(cursors.right.isDown) player.body.velocity.x = 200;
    else player.body.velocity.x = 0;
    if(cursors.up.isDown && player.body.blocked.down) player.body.velocity.y = -400;
  }
})();
</script>
</body>
</html>`;
  },
};

// Four more template stubs that will be filled in subsequent tasks.
export const otherPlatformer: Template = { ...spaceComet, id: 'platformer-other', name: 'Other' };
export const castleJumper: Template = { ...spaceComet, id: 'platformer-castle-jumper', name: 'Castle Jumper' };
export const forestRunner: Template = { ...spaceComet, id: 'platformer-forest-runner', name: 'Forest Runner' };
export const lavaLeaper: Template = { ...spaceComet, id: 'platformer-lava-leaper', name: 'Lava Leaper' };

export const PLATFORMER_TEMPLATES: Template[] = [
  spaceComet, otherPlatformer, castleJumper, forestRunner, lavaLeaper,
];
