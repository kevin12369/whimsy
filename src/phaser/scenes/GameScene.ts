import Phaser from 'phaser';
import { runWFC } from '../../procgen/wfc';
import { THEME_WORLDS, biomeWeightsFor } from '../../procgen/themeWorlds';
import { createSession, advanceLevel, reachedExit, reachedExitPixel } from '../../core/sessionLoop';
import { computeMove, canMoveTo } from '../entities/Player';
import { gameBus } from '../../core/eventBus';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  private player!: Phaser.GameObjects.Rectangle;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private tilemap: number[] = [];
  private w = 0; private h = 0; private tileSize = 16;
  private exitPos = { x: 0, y: 0 };
  private session = createSession();
  private hudText!: Phaser.GameObjects.Text;
  private escKey!: Phaser.Input.Keyboard.Key;

  init(data: { levelIndex?: number }) {
    // Override default level index from data if provided (used on level transitions).
    if (typeof data?.levelIndex === 'number') {
      this.session = { ...this.session, currentLevelIndex: data.levelIndex };
    }
  }

  create() {
    // Phase 1: force forest biome for a playable tile mix (no impassable water lake).
    // biome selection will move to deck-aware picking in Task 12 follow-up.
    const biome = THEME_WORLDS.find(b => b.id === 'forest') ?? THEME_WORLDS[0]!;
    // Fit the 1280x720 canvas: 40 cols x 30 rows x 16px = 640x480, centered.
    this.w = 40; this.h = 30;
    this.tilemap = runWFC(this.w, this.h, { seed: Date.now() & 0xffff, weights: biomeWeightsFor(biome.id) });
    // Force player spawn area (top-left 3x3) to be floor so the player isn't trapped in water/wall.
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        this.tilemap[y * this.w + x] = 0;
      }
    }
    // Force exit area (bottom-right 3x3) to be floor too.
    for (let y = this.h - 3; y < this.h; y++) {
      for (let x = this.w - 3; x < this.w; x++) {
        this.tilemap[y * this.w + x] = 0;
      }
    }
    this.exitPos = { x: this.w - 2, y: this.h - 2 };
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    this.drawTilemap(offsetX, offsetY);
    // Place exit at the bottom-right exit tile; mark it with a pulsing 2x2
    // block plus a label so the player can see where to go.
    const exitPx = offsetX + this.exitPos.x * this.tileSize;
    const exitPy = offsetY + this.exitPos.y * this.tileSize;
    this.add.rectangle(exitPx, exitPy, this.tileSize * 2, this.tileSize * 2, 0xffff00).setOrigin(0);
    this.add.rectangle(exitPx + 4, exitPy + 4, this.tileSize * 2 - 8, this.tileSize * 2 - 8, 0x444400).setOrigin(0);
    this.add.text(exitPx + 4, exitPy - 18, 'EXIT', { fontSize: '12px', color: '#ff0' });
    this.player = this.add.rectangle(offsetX + this.tileSize * 2, offsetY + this.tileSize * 2, 12, 12, 0x00ffff);
    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.hudText = this.add.text(offsetX + 8, offsetY + 8, `Level ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}`, { color: '#fff' });
    // Back-to-menu hint, top-right of the map.
    this.add.text(1280 - offsetX - 110, offsetY + 8, '[Esc] Pause', { fontSize: '12px', color: '#aaa' });
    this.escKey = this.input.keyboard!.addKey('ESC');
    this.escKey.on('down', () => this.openPause());
  }

  private openPause() {
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  private drawTilemap(offsetX: number, offsetY: number) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = this.tilemap[y * this.w + x]!;
        const color = t === 1 ? 0x444444 : t === 2 ? 0x2244aa : 0x222222;
        this.add.rectangle(offsetX + x * this.tileSize, offsetY + y * this.tileSize, this.tileSize, this.tileSize, color).setOrigin(0);
      }
    }
  }

  override update(_t: number, dt: number) {
    if (!this.player) return;
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const next = computeMove(
      { x: this.player.x - offsetX, y: this.player.y - offsetY },
      {
        up: this.keys.up.isDown || this.wasd.W!.isDown,
        down: this.keys.down.isDown || this.wasd.S!.isDown,
        left: this.keys.left.isDown || this.wasd.A!.isDown,
        right: this.keys.right.isDown || this.wasd.D!.isDown,
      },
      dt / 1000,
    );
    const tx = Math.round(next.x / this.tileSize);
    const ty = Math.round(next.y / this.tileSize);
    if (canMoveTo(next.x, next.y, this.w, this.h, this.tilemap)) {
      this.player.x = offsetX + next.x;
      this.player.y = offsetY + next.y;
    }
    // Player trigger uses pixel bbox overlap against the 2x2 exit block.
    if (reachedExitPixel(this.player.x - offsetX, this.player.y - offsetY, this.exitPos.x, this.exitPos.y, this.tileSize, 2, 2)) {
      // If this was the final level, finish the session and return to menu.
      if (this.session.currentLevelIndex >= this.session.maxLevels - 1) {
        gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
        this.scene.start('MenuScene');
        return;
      }
      this.session = advanceLevel(this.session);
      gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
      this.hudText.setText(`Level ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}`);
      this.scene.start('GameScene', { levelIndex: this.session.currentLevelIndex });
    }
  }
}