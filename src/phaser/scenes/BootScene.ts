import Phaser from 'phaser';
import { preloadAllAssets } from '../../core/assetLoader';
import { preloadVFX } from '../../ui/VFX';
import { preloadSFX } from '../../ui/AudioManager';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  private progressText?: Phaser.GameObjects.Text;

  preload() {
    this.add.text(640, 320, 'Whimsy Shuffle', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    this.progressText = this.add.text(640, 380, 'Loading 0%', {
      fontSize: '16px', color: '#aaa',
    }).setOrigin(0.5);

    preloadAllAssets(this);
    preloadVFX(this);
    preloadSFX(this);

    this.load.on('progress', (v: number) => {
      if (this.progressText) {
        this.progressText.setText(`Loading ${Math.round(v * 100)}%`);
      }
    });
  }

  create() {
    const startMenu = () => this.scene.start('MenuScene');
    this.load.once('complete', startMenu);
    // If the load queue was already empty (instant cache hit),
    // 'complete' may have fired before this listener attached.
    if (this.load.isLoading() === false && (this.load.progress as unknown as number) === 1) {
      startMenu();
    }
  }
}
