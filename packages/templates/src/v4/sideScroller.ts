// Side-Scroller Comet (v4): Mario-style platformer.
// 3 hand-designed levels with progressive difficulty. Final level has a boss.
// Level-complete screen between levels; win screen after level 3.

import type { KAPLAYCtx, GameConfig, Template, Theme, LevelData } from '@whimsy/runtime';
import type { GameObj } from 'kaplay';

const PLAYER_SIZE = 28;
const ENEMY_SIZE = 24;
const STAR_SIZE = 12;
const GROUND_Y = 440;
const GROUND_H = 40;

interface PlatformSpec { x: number; y: number; w: number; h: number; }
interface EnemySpec { x: number; y: number; vx: number; }
interface StarSpec { x: number; y: number; }
interface BossSpec { x: number; y: number; w: number; h: number; hp: number; speed: number; }
interface LevelSpec {
  name: string;
  platforms: PlatformSpec[];
  enemies: EnemySpec[];
  stars: StarSpec[];
  goal: { x: number; y: number };
  boss?: BossSpec;
  bg: [number, number, number];
}

const LEVELS: LevelSpec[] = [
  {
    name: 'Asteroid Field',
    bg: [2, 3, 10],
    platforms: [
      { x: 0, y: GROUND_Y, w: 800, h: GROUND_H },
      { x: 200, y: 380, w: 100, h: 20 },
      { x: 400, y: 320, w: 100, h: 20 },
      { x: 600, y: 360, w: 100, h: 20 },
    ],
    enemies: [
      { x: 250, y: GROUND_Y - ENEMY_SIZE, vx: -80 },
      { x: 450, y: GROUND_Y - ENEMY_SIZE, vx: -100 },
      { x: 650, y: GROUND_Y - ENEMY_SIZE, vx: -90 },
    ],
    stars: [
      { x: 250, y: 340 },
      { x: 450, y: 280 },
      { x: 650, y: 320 },
    ],
    goal: { x: 720, y: GROUND_Y - 60 },
  },
  {
    name: 'Cosmic Cliffs',
    bg: [10, 5, 30],
    platforms: [
      { x: 0, y: GROUND_Y, w: 200, h: GROUND_H },
      { x: 250, y: GROUND_Y - 80, w: 100, h: 20 },
      { x: 400, y: GROUND_Y - 160, w: 100, h: 20 },
      { x: 550, y: GROUND_Y - 80, w: 100, h: 20 },
      { x: 700, y: GROUND_Y, w: 100, h: GROUND_H },
    ],
    enemies: [
      { x: 290, y: GROUND_Y - 80 - ENEMY_SIZE, vx: -120 },
      { x: 440, y: GROUND_Y - 160 - ENEMY_SIZE, vx: -150 },
      { x: 590, y: GROUND_Y - 80 - ENEMY_SIZE, vx: -130 },
      { x: 100, y: GROUND_Y - ENEMY_SIZE, vx: -100 },
    ],
    stars: [
      { x: 300, y: GROUND_Y - 110 },
      { x: 450, y: GROUND_Y - 190 },
      { x: 600, y: GROUND_Y - 110 },
      { x: 720, y: GROUND_Y - 30 },
    ],
    goal: { x: 740, y: GROUND_Y - 60 },
  },
  {
    name: 'Boss: Nebula Heart',
    bg: [30, 5, 20],
    platforms: [
      { x: 0, y: GROUND_Y, w: 800, h: GROUND_H },
      { x: 50, y: 360, w: 80, h: 20 },
      { x: 670, y: 360, w: 80, h: 20 },
      { x: 350, y: 320, w: 100, h: 20 },
    ],
    enemies: [
      { x: 200, y: GROUND_Y - ENEMY_SIZE, vx: -120 },
      { x: 500, y: GROUND_Y - ENEMY_SIZE, vx: -130 },
    ],
    stars: [
      { x: 90, y: 320 },
      { x: 400, y: 280 },
      { x: 710, y: 320 },
    ],
    goal: { x: 0, y: 0 }, // not used on boss level
    boss: { x: 400, y: GROUND_Y - 80, w: 60, h: 80, hp: 5, speed: 200 },
  },
];

function hexToKcolor(hex: string): [number, number, number] {
  const s = hex.startsWith('#') ? hex.slice(1) : hex;
  const n = parseInt(s.padEnd(6, '0').slice(0, 6), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

type GameState = 'playing' | 'levelComplete' | 'win' | 'gameOver';

export const sideScrollerComet: Template = {
  id: 'sideScroller',
  name: 'Side-Scroller Comet',
  howToPlay: '← → move · ↑/SPACE jump · stomp enemies · reach the flag',
  defaultTheme: {
    primary: '#3aa6ff',
    secondary: '#ffffff',
    enemyColor: '#ff6b6b',
    playerLabel: 'comet',
    enemyLabel: 'asteroid',
    flavorText: '像马里奥那样,主角是颗彗星,在太空里躲小行星。',
  },

  setup(ctx: KAPLAYCtx, cfg: GameConfig & { levelData?: LevelData }): void {
    let currentLevel = 0;
    let state: GameState = 'playing';
    let score = 0;
    let totalStars = 0;
    let bossRef: GameObj | null = null;
    let playerRef: GameObj | null = null;

    const playerSpeed = cfg.playerSpeed ?? 220;
    const jumpVelocity = cfg.jumpVelocity ?? 460;
    const gravity = cfg.gravity ?? 900;
    const enemyRGB = hexToKcolor(cfg.enemyColor ?? cfg.primary ?? '#ff6b6b');
    const playerRGB = hexToKcolor(cfg.primary ?? '#3aa6ff');

    // Spec-driven levelData (from SpecCompiler) takes priority over hardcoded LEVELS
    const specLevelData = (cfg as any).levelData as LevelData | undefined;

    function loadLevel(idx: number): void {
      // Clear existing game objects (except HUD)
      ctx.get('platform').forEach((o) => o.destroy());
      ctx.get('enemy').forEach((o) => o.destroy());
      ctx.get('star').forEach((o) => o.destroy());
      ctx.get('goal').forEach((o) => o.destroy());
      if (bossRef) { bossRef.destroy(); bossRef = null; }

      ctx.setGravity(gravity);

      // If spec compiler provided levelData, use it (path 1: AI-driven)
      if (specLevelData) {
        for (const p of specLevelData.platforms) {
          ctx.add([
            ctx.rect(p.w, p.h),
            ctx.pos(p.x, p.y),
            ctx.area(),
            ctx.body({ isStatic: true }),
            ctx.color(60, 70, 90),
            'platform',
          ]);
        }
        for (const e of specLevelData.enemies) {
          ctx.add([
            ctx.rect(ENEMY_SIZE, ENEMY_SIZE),
            ctx.pos(e.x, e.y),
            ctx.area(),
            ctx.body(),
            ctx.color(enemyRGB),
            'enemy',
            { vx: e.vx, startX: e.x, patrol: 60 },
          ]);
        }
        for (const s of specLevelData.stars) {
          ctx.add([
            ctx.rect(STAR_SIZE, STAR_SIZE),
            ctx.pos(s.x, s.y),
            ctx.area(),
            ctx.color(255, 255, 100),
            'star',
          ]);
        }
        if (specLevelData.boss) {
          bossRef = ctx.add([
            ctx.rect(specLevelData.boss.w, specLevelData.boss.h),
            ctx.pos(specLevelData.boss.x, specLevelData.boss.y),
            ctx.area(),
            ctx.color(170, 0, 170),
            'boss',
            { hp: specLevelData.boss.hp, speed: specLevelData.boss.speed, dir: 1, startX: specLevelData.boss.x },
          ]) as GameObj;
        } else {
          ctx.add([
            ctx.rect(20, 60),
            ctx.pos(specLevelData.goal.x, specLevelData.goal.y),
            ctx.area(),
            ctx.color(80, 220, 80),
            'goal',
          ]);
        }
        // Player
        const groundY = specLevelData.platforms[0]!.y - PLAYER_SIZE;
        if (!playerRef) {
          playerRef = ctx.add([
            ctx.rect(PLAYER_SIZE, PLAYER_SIZE),
            ctx.pos(50, groundY),
            ctx.area(),
            ctx.body(),
            ctx.color(playerRGB),
            'player',
            { speed: playerSpeed, jumpVel: jumpVelocity, invincible: 0, groundY, jumpHeld: false },
          ]) as GameObj;
        }
        return;
      }

      // Fallback: hardcoded LEVELS (path 2: original flow)
      const lvl = LEVELS[idx];
      if (!lvl) return;

      // Platforms
      for (const p of lvl.platforms) {
        ctx.add([
          ctx.rect(p.w, p.h),
          ctx.pos(p.x, p.y),
          ctx.area(),
          ctx.body({ isStatic: true }),
          ctx.color(60, 70, 90),
          'platform',
        ]);
      }
      // Enemies
      for (const e of lvl.enemies) {
        ctx.add([
          ctx.rect(ENEMY_SIZE, ENEMY_SIZE),
          ctx.pos(e.x, e.y),
          ctx.area(),
          ctx.body(),
          ctx.color(enemyRGB),
          'enemy',
          { vx: e.vx, startX: e.x, patrol: 80 },
        ]);
      }
      // Stars
      for (const s of lvl.stars) {
        ctx.add([
          ctx.rect(STAR_SIZE, STAR_SIZE),
          ctx.pos(s.x, s.y),
          ctx.area(),
          ctx.color(255, 255, 100),
          'star',
        ]);
        totalStars++;
      }
      // Goal (skip on boss level)
      if (!lvl.boss) {
        ctx.add([
          ctx.rect(20, 60),
          ctx.pos(lvl.goal.x, lvl.goal.y),
          ctx.area(),
          ctx.color(80, 220, 80),
          'goal',
        ]);
      }
      // Boss
      if (lvl.boss) {
        bossRef = ctx.add([
          ctx.rect(lvl.boss.w, lvl.boss.h),
          ctx.pos(lvl.boss.x, lvl.boss.y),
          ctx.area(),
          ctx.color(170, 0, 170),
          'boss',
          { hp: lvl.boss.hp, speed: lvl.boss.speed, dir: 1, startX: lvl.boss.x },
        ]) as GameObj;
      }
      // Player
      const groundY = GROUND_Y - PLAYER_SIZE;
      if (!playerRef) {
        playerRef = ctx.add([
          ctx.rect(PLAYER_SIZE, PLAYER_SIZE),
          ctx.pos(50, groundY),
          ctx.area(),
          ctx.body(),
          ctx.color(playerRGB),
          'player',
          {
            speed: playerSpeed,
            jumpVel: jumpVelocity,
            invincible: 0,
            // Self-tracked ground state lives on the player so update()
            // can read it without invoking Kaplay's isGrounded() (which
            // can throw on the physics-step frame).
            groundY,
            jumpHeld: false,
          },
        ]) as GameObj;
      } else {
        const p = playerRef as any;
        p.pos = ctx.vec2(50, groundY);
        p.speed = playerSpeed;
        p.jumpVel = jumpVelocity;
        p.invincible = performance.now() + 1500;
        p.groundY = groundY;
        p.jumpHeld = false;
        // Clear any residual velocity so the player doesn't get a phantom launch.
        // Guard: in rare race conditions the body may be detached mid-frame.
        if (p.body?.velocity) {
          p.body.velocity.x = 0;
          p.body.velocity.y = 0;
        }
      }
    }

    loadLevel(0);

    // Enemy patrol + player collect
    ctx.onCollide('player', 'star', (_p: GameObj, s: GameObj) => {
      s.destroy();
      score += 100;
    });
    ctx.onCollide('player', 'goal', () => {
      if (state !== 'playing') return;
      if (currentLevel < LEVELS.length - 1) {
        state = 'levelComplete';
      } else {
        state = 'win';
      }
    });
    ctx.onCollide('player', 'boss', (p: GameObj, b: any) => {
      const ppos = (p as any).pos;
      const bpos = b.pos;
      if (!ppos || !bpos) return;
      // Stomp from above: player y + size < boss y + size/2
      const playerBottom = ppos.y + PLAYER_SIZE;
      const bossTop = bpos.y;
      const pBodyVel = (p as any).body?.velocity;
      if (playerBottom < bossTop + 16 && pBodyVel && pBodyVel.y > 100) {
        b.hp -= 1;
        pBodyVel.y = -jumpVelocity * 0.7; // bounce
        if (b.hp <= 0) {
          b.destroy();
          bossRef = null;
          state = 'win';
        }
      } else {
        // Hit = lose a life
        hit();
      }
    });
    ctx.onCollide('player', 'enemy', (p: GameObj) => {
      const po = p as any;
      if (performance.now() < (po.invincible ?? 0)) return;
      const pBodyVel = po.body?.velocity;
      // Stomp check — enemy stomp uses velocity, not body, so optional
      // chain lets the callback no-op safely if the body is detached.
      if (pBodyVel && pBodyVel.y > 50) {
        // Stomped an enemy — destroy it, bounce
        const enemies = ctx.get('enemy');
        const hitEnemy = enemies.find((e: any) => Math.abs(e.pos.x - po.pos.x) < ENEMY_SIZE && Math.abs(e.pos.y - po.pos.y) < ENEMY_SIZE);
        if (hitEnemy) {
          hitEnemy.destroy();
          score += 200;
          pBodyVel.y = -jumpVelocity * 0.6;
          return;
        }
      }
      hit();
    });

    let lives = 3;
    function hit(): void {
      lives = Math.max(0, lives - 1);
      if (lives <= 0) {
        state = 'gameOver';
        return;
      }
      const p = playerRef as any;
      if (!p) return;
      p.pos = ctx.vec2(50, GROUND_Y - PLAYER_SIZE);
      p.invincible = performance.now() + 1500;
    }

    // HUD
    ctx.onDraw(() => {
      ctx.drawText({
        text: `Lv ${currentLevel + 1}/${LEVELS.length}: ${LEVELS[currentLevel]!.name}  ·  score ${score}  ·  lives ${lives}`,
        pos: ctx.vec2(8, 8),
        size: 16,
        color: ctx.rgb(255, 255, 255),
      });
      if (state === 'levelComplete') {
        ctx.drawText({ text: 'LEVEL CLEARED', pos: ctx.vec2(280, 200), size: 36, color: ctx.rgb(80, 220, 80) });
        ctx.drawText({ text: 'Press ENTER for next level', pos: ctx.vec2(280, 250), size: 16, color: ctx.rgb(200, 200, 200) });
      } else if (state === 'win') {
        ctx.drawText({ text: 'YOU WIN!', pos: ctx.vec2(300, 200), size: 48, color: ctx.rgb(255, 220, 80) });
        ctx.drawText({ text: `Final score: ${score}`, pos: ctx.vec2(310, 260), size: 20, color: ctx.rgb(255, 255, 255) });
        ctx.drawText({ text: 'Press R to restart', pos: ctx.vec2(300, 290), size: 16, color: ctx.rgb(200, 200, 200) });
      } else if (state === 'gameOver') {
        ctx.drawText({ text: 'GAME OVER', pos: ctx.vec2(300, 200), size: 48, color: ctx.rgb(220, 80, 80) });
        ctx.drawText({ text: 'Press R to restart', pos: ctx.vec2(300, 260), size: 16, color: ctx.rgb(200, 200, 200) });
      }
    });

    // Keyboard: Enter to advance, R to restart
    ctx.onKeyPress('enter', () => {
      if (state === 'levelComplete') {
        currentLevel++;
        state = 'playing';
        loadLevel(currentLevel);
      }
    });
    ctx.onKeyPress('r', () => {
      if (state === 'win' || state === 'gameOver') {
        currentLevel = 0;
        state = 'playing';
        score = 0;
        lives = 3;
        totalStars = 0;
        loadLevel(0);
      }
    });
  },

  update(ctx: KAPLAYCtx, dt: number, _cfg: GameConfig): void {
    if (!ctx.get('player').length) return;
    const player = ctx.get('player')[0] as any;
    if (!player) return;
    const speed = player.speed as number;
    const jumpVel = player.jumpVel as number;
    // `move(x, y)` in Kaplay adds (x, y) directly to pos each frame.
    // We treat `speed` as px/sec, so multiply by dt for frame-rate independence.
    if (ctx.isKeyDown('left')) player.move(-speed * dt, 0);
    else if (ctx.isKeyDown('right')) player.move(speed * dt, 0);

    // Self-tracked "on ground": the player is on the ground when their
    // y is at the stored groundY (top of the floor). Avoids calling
    // Kaplay isGrounded() / accessing body.velocity, both of which can
    // throw during physics-step race conditions. The previous build
    // threw "Cannot read properties of undefined (reading 'velocity')"
    // on every jump; this rewrite keeps all body access behind optional
    // chains and never relies on a method like isGrounded() that
    // internally dereferences body.
    const groundY = (player.groundY as number) ?? (GROUND_Y - PLAYER_SIZE);
    const onGround = Math.abs((player.pos.y ?? 0) - groundY) < 2;
    const jumpKey = ctx.isKeyDown('up') || ctx.isKeyDown('space');
    const jumpHeld = !!player.jumpHeld;

    if (jumpKey && onGround && !jumpHeld) {
      // Rising edge of jump key — apply upward velocity directly via
      // optional chain. We avoid player.jump() which also touches body.
      const v = player.body?.velocity;
      if (v) v.y = -jumpVel;
    }
    player.jumpHeld = jumpKey;

    // Variable jump height: cut upward velocity when key released.
    // Guarded — falls through silently if body is detached.
    if (!jumpKey && !onGround) {
      const v = player.body?.velocity;
      if (v && v.y < 0) v.y *= 0.85;
    }

    // Enemy patrol: bounce off walls / patrol range
    const enemies = ctx.get('enemy');
    for (const e of enemies) {
      const eo = e as any;
      eo.move(eo.vx * dt, 0);
      if (eo.pos.x < eo.startX - eo.patrol || eo.pos.x > eo.startX + eo.patrol) {
        eo.vx = -eo.vx;
      }
    }
    // Boss patrol
    const bosses = ctx.get('boss');
    for (const b of bosses) {
      const bo = b as any;
      bo.move(bo.dir * bo.speed * dt, 0);
      if (bo.pos.x < 100 || bo.pos.x > 700) bo.dir = -bo.dir;
    }
  },

  exportConfig(cfg: GameConfig, theme: Theme): string {
    return JSON.stringify({ ...cfg, ...theme, levels: LEVELS.length }, null, 2);
  },
};
