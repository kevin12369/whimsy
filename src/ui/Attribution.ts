import Phaser from 'phaser';

export class AttributionScene extends Phaser.Scene {
  constructor() { super('AttributionScene'); }
  create() {
    this.add.text(640, 60, 'Credits', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    const lines = [
      'Kenney (kenney.nl) - CC0 - items, UI, VFX',
      'cafeDraw Fantasy Card Assets - Royalty-Free',
      'Praan Card Game 2D UI - Royalty-Free',
      'Mixkit - SFX - Mixkit License',
      'Pixabay Music - BGM - Pixabay License',
      'OpenGameArt - per-pack license',
      'Phaser examples - MIT placeholders',
      'Inter font (rsms.me/inter) - OFL 1.1',
    ];
    lines.forEach((l, i) => this.add.text(80, 120 + i * 28, l, { color: '#ddd' }));
  }
}