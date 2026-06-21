import Phaser from 'phaser';
import { runWFC } from '../../procgen/wfc';
import { biomeWeights, BIOMES } from '../../procgen/biomes';
import { createSession, advanceLevel, reachedExit } from '../../core/sessionLoop';
import { computeMove, canMoveTo } from '../entities/Player';
import { gameBus } from '../../core/eventBus';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private tilemap: number[] = [];
  private w = 0; private h = 0; private tileSize = 16;
  private exitPos = { x: 0, y: 0 };
  private session = createSession();
  private hudText!: Phaser.GameObjects.Text;

  init(data: { levelIndex?: number }) {
    // Override default level index from data if provided (used on level transitions).
    if (typeof data?.levelIndex === 'number') {
      this.session = { ...this.session, currentLevelIndex: data.levelIndex };
    }
  }

  create() {
    const biome = BIOMES[Math.floor(Math.random() * BIOMES.length)]!;
    this.w = 64; this.h = 48;
    this.tilemap = runWFC(this.w, this.h, { seed: Date.now() & 0xffff, weights: biomeWeights(biome.id) });
    this.exitPos = { x: this.w - 2, y: this.h - 2 };
    this.drawTilemap();
    this.player = this.add.rectangle(this.tileSize * 2, this.tileSize * 2, 20, 20, 0xffffff);
    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.hudText = this.add.text(8, 8, `Level ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}`, { color: '#fff' });
  }

  private drawTilemap() {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = this.tilemap[y * this.w + x]!;
        const color = t === 1 ? 0x444444 : t === 2 ? 0x2244aa : 0x222222;
        this.add.rectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize, color).setOrigin(0);
      }
    }
    this.add.rectangle(this.exitPos.x * this.tileSize, this.exitPos.y * this.tileSize, this.tileSize, this.tileSize, 0xffff00).setOrigin(0);
  }

  override update(_t: number, dt: number) {
    if (!this.player) return;
    const next = computeMove(
      { x: this.player.x, y: this.player.y },
      {
        up: this.keys.up.isDown || this.wasd.W!.isDown,
        down: this.keys.down.isDown || this.wasd.S!.isDown,
        left: this.keys.left.isDown || this.wasd.A!.isDown,
        right: this.keys.right.isDown || this.wasd.D!.isDown,
      },
      dt / 1000,
    );
    const tx = Math.floor(next.x / this.tileSize);
    const ty = Math.floor(next.y / this.tileSize);
    if (canMoveTo(tx, ty, this.w, this.h, this.tilemap)) {
      this.player.x = next.x; this.player.y = next.y;
    }
    if (reachedExit({ x: tx, y: ty }, this.exitPos)) {
      this.session = advanceLevel(this.session);
      gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
      this.hudText.setText(`Level ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}`);
      this.scene.start('GameScene', { levelIndex: this.session.currentLevelIndex });
    }
  }
}