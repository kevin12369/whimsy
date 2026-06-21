import Phaser from 'phaser';

type Mode = 'menu' | 'exit-confirm';

export class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }
  private mode: Mode = 'menu';
  private widgets: Phaser.GameObjects.GameObject[] = [];

  create() {
    // Dim the GameScene behind the modal.
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6).setOrigin(0.5);

    // ESC in the pause scene itself closes it (same binding as opening).
    this.input.keyboard!.on('keydown-ESC', () => {
      if (this.mode === 'menu') this.resumeGame();
      // ESC ignored on the exit-confirm screen — user must pick Yes/No.
    });

    this.renderMenu();
  }

  private clearWidgets() {
    for (const w of this.widgets) w.destroy();
    this.widgets = [];
  }

  private addButton(label: string, y: number, onClick: () => void): Phaser.GameObjects.Text {
    const bg = this.add.rectangle(640, y, 280, 50, 0x222233).setStrokeStyle(1, 0xaaaaff).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(640, y, label, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => bg.setFillStyle(0x333355));
    bg.on('pointerout', () => bg.setFillStyle(0x222233));
    this.widgets.push(bg, txt);
    return txt;
  }

  private renderMenu() {
    this.clearWidgets();
    this.mode = 'menu';
    this.add.text(640, 140, 'Paused', { fontSize: '36px', color: '#fff' }).setOrigin(0.5);
    this.add.text(640, 200, '[Esc] Resume', { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);
    this.addButton('Resume', 280, () => this.resumeGame());
    this.addButton('Settings', 360, () => this.scene.start('SettingsScene'));
    this.addButton('Exit to Menu', 440, () => this.renderExitConfirm());
  }

  private renderExitConfirm() {
    this.clearWidgets();
    this.mode = 'exit-confirm';
    this.add.text(640, 200, 'Exit to Menu?', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);
    this.add.text(640, 240, 'Phase 1: progress is not saved yet.', { fontSize: '12px', color: '#888' }).setOrigin(0.5);
    const yes = this.addButton('Yes, exit', 320, () => this.exitToMenu());
    const no = this.addButton('Cancel', 400, () => this.renderMenu());
  }

  private exitToMenu() {
    // Stop GameScene entirely so it doesn't resume at the same level.
    // (Resume would replay the level via init() since the next scene.start
    //  of GameScene would pick up the paused state; stopping is cleaner.)
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  private resumeGame() {
    // Resume GameScene (it was paused when PauseScene launched on top).
    this.scene.stop();
    this.scene.wake('GameScene');
  }
}