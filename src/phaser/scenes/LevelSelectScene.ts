import Phaser from 'phaser';
import type { HiddenLevel } from '../../core/cardSystem';

export class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }
  create() {
    const base = 5;
    const unlocked = (this.registry.get('unlockedHiddenLevels') ?? []) as HiddenLevel[];
    this.add.text(20, 20, 'Level Select', { fontSize: '24px', color: '#fff' });
    for (let i = 0; i < base; i++) {
      this.add.text(20, 60 + i * 30, `Level ${i + 1}`, { color: '#fff' });
    }
    unlocked.forEach((h, i) => this.add.text(160, 60 + (base + i) * 30, `Hidden: ${h.name}`, { color: '#ff9' }));
  }
}