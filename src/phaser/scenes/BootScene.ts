import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    this.add.text(640, 360, 'Whimsy Shuffle', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
  }
}