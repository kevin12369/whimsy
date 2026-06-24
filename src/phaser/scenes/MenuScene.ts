import Phaser from 'phaser';
import { loadSave, saveSave } from '../../core/persistence';

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const save = loadSave();
    const tutorialDone = save.tutorialCompleted === true;

    this.add.text(640, 120, 'Whimsy Shuffle', { fontSize: '48px', color: '#c4b5fd' }).setOrigin(0.5);
    this.add.text(640, 170, 'Echoes of a Fractured World', { fontSize: '16px', color: '#6b7280' }).setOrigin(0.5);

    // New Game (Tutorial) — replaces old "New Shuffle"
    const newGameBg = this.add.rectangle(640, 260, 280, 50, 0x1e1e3a).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const newGameLabel = tutorialDone ? '新游戏' : '新游戏 (教程)';
    this.add.text(640, 260, newGameLabel, { fontSize: '18px', color: '#d1d5db' }).setOrigin(0.5);
    newGameBg.on('pointerdown', () => {
      if (!tutorialDone) {
        this.scene.start('GameScene', { isTutorial: true });
      } else {
        // Simple quick start for returning players
        this.scene.start('GameScene');
      }
    });

    // Tutorial badge if not completed
    if (!tutorialDone) {
      this.add.text(640, 290, '推荐新玩家从这里开始', { fontSize: '11px', color: '#fbbf24' }).setOrigin(0.5);
    }

    // Echo Archive (v2 expedition mode) — only after tutorial
    const archiveBg = this.add.rectangle(640, 350, 280, 50, tutorialDone ? 0x7c3aed : 0x2a2a3a).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add.text(640, 350, '回声档案 (Expedition)', { fontSize: '18px', color: tutorialDone ? '#fff' : '#6b7280' }).setOrigin(0.5);
    if (tutorialDone) {
      archiveBg.on('pointerdown', () => this.scene.start('EchoArchiveScene'));
    } else {
      archiveBg.on('pointerdown', () => {
        this.showDialogue('请先完成新手教程，再开始探险。');
      });
    }

    // Stats
    this.add.text(640, 410, `Echoes: ${save.collectedEchoIds.length}/11  |  Fragments: ${save.totalFragmentsCollected}`, {
      fontSize: '12px', color: '#6b7280',
    }).setOrigin(0.5);

    // Settings
    const settingsBg = this.add.rectangle(640, 470, 200, 36, 0x1e1e3a).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add.text(640, 470, 'Settings', { fontSize: '14px', color: '#6b7280' }).setOrigin(0.5);
    settingsBg.on('pointerdown', () => this.scene.start('SettingsScene'));
  }

  private showDialogue(text: string) {
    const txt = this.add.text(640, 530, text, {
      fontSize: '13px', color: '#fbbf24',
      backgroundColor: '#1a1a2ecc',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5);
    this.tweens.add({ targets: txt, alpha: { from: 0, to: 1 }, duration: 200 });
    this.time.delayedCall(3000, () => {
      this.tweens.add({ targets: txt, alpha: 0, duration: 300, onComplete: () => txt.destroy() });
    });
  }
}
