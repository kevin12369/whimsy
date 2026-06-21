import Phaser from 'phaser';
import { computeMove } from '../entities/Player';

export class PlayerTestScene extends Phaser.Scene {
  constructor() { super('PlayerTestScene'); }
  private player?: Phaser.GameObjects.Rectangle;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W'|'A'|'S'|'D', Phaser.Input.Keyboard.Key>;
  create() {
    this.player = this.add.rectangle(640, 360, 24, 24, 0xffffff);
    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
  }
  override update(_t: number, dt: number) {
    if (!this.player) return;
    const next = computeMove(
      { x: this.player.x, y: this.player.y },
      {
        up: this.keys.up.isDown || this.wasd.W.isDown,
        down: this.keys.down.isDown || this.wasd.S.isDown,
        left: this.keys.left.isDown || this.wasd.A.isDown,
        right: this.keys.right.isDown || this.wasd.D.isDown,
      },
      dt / 1000,
    );
    this.player.x = next.x; this.player.y = next.y;
  }
}
