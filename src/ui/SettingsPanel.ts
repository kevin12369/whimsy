import Phaser from 'phaser';
import { defaultSettings } from '../core/settings';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }
  create() {
    const _settings = defaultSettings(); // resolved at runtime; UI shows static Phase 1 state
    this.add.text(640, 80, 'Settings', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    this.add.text(640, 200, 'Mode: Pure Procgen (locked in Phase 1)', { fontSize: '20px', color: '#9f9' }).setOrigin(0.5);
    this.add.text(640, 240, 'AI mode unlocks in Phase 2 (WebLLM).', { fontSize: '14px', color: '#888' }).setOrigin(0.5);
    const back = this.add.text(640, 600, 'Back', { fontSize: '18px', color: '#fff' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}