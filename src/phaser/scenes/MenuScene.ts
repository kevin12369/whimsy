import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }
  create() {
    this.add.text(640, 200, 'Whimsy Shuffle', { fontSize: '48px', color: '#fff' }).setOrigin(0.5);
    const start = this.add.text(640, 360, 'New Shuffle', { fontSize: '24px', color: '#fff', backgroundColor: '#222' })
      .setOrigin(0.5).setPadding(12).setInteractive({ useHandCursor: true });
    start.on('pointerdown', () => this.scene.start('GameScene'));
    const settings = this.add.text(640, 420, 'Settings', { fontSize: '20px', color: '#aaa' })
      .setOrigin(0.5).setPadding(8).setInteractive({ useHandCursor: true });
    settings.on('pointerdown', () => this.scene.start('SettingsScene'));
  }
}