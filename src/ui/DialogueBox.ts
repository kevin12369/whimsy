import Phaser from 'phaser';

interface QueuedMessage {
  text: string;
  duration: number;
}

/**
 * Standard RPG-style dialogue box.
 * Features: queue system, name tag, click-to-advance, blinking indicator.
 * Uses Kenney Pixel UI for styled background with fallback to solid color.
 */
export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.GameObject;
  private nameTag: Phaser.GameObjects.Text;
  private textContent: Phaser.GameObjects.Text;
  private indicator: Phaser.GameObjects.Text;
  private isActive = false;
  private queue: QueuedMessage[] = [];
  private currentTimer?: Phaser.Time.TimerEvent;

  private static readonly DEPTH = 2000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const cx = 640;
    // Positioned at the bottom of screen, just above the hand card area (y=640+).
    // This overlays the bottom of the map — standard RPG convention.
    const BOX_TOP = 584;
    const BOX_BOT = 638;
    const BOX_HEIGHT = BOX_BOT - BOX_TOP;
    const BOX_CY = (BOX_TOP + BOX_BOT) / 2;

    // Kenney pixel UI panel (fallback: dark rectangle)
    if (scene.textures.exists('ui_panel')) {
      const img = scene.add.image(cx, BOX_CY, 'ui_panel');
      img.setDisplaySize(1100, BOX_HEIGHT);
      img.setOrigin(0.5);
      img.setDepth(DialogueBox.DEPTH);
      this.bg = img;
    } else {
      this.bg = scene.add.rectangle(cx, BOX_CY, 1100, BOX_HEIGHT, 0x0a0a1e, 0.92)
        .setOrigin(0.5)
        .setStrokeStyle(1, 0x7c3aed, 0.6)
        .setDepth(DialogueBox.DEPTH);
    }

    this.nameTag = scene.add.text(80, BOX_TOP + 2, '', {
      fontSize: '12px', color: '#c4b5fd',
      fontStyle: 'bold',
      backgroundColor: '#1a1a3e',
      padding: { x: 8, y: 2 },
    }).setDepth(DialogueBox.DEPTH + 1);

    this.textContent = scene.add.text(90, BOX_TOP + 20, '', {
      fontSize: '12px',
      color: '#e0e0e0',
      wordWrap: { width: 1060 },
      lineSpacing: 2,
    }).setDepth(DialogueBox.DEPTH + 1);

    this.indicator = scene.add.text(1140, BOX_BOT - 6, '▼', {
      fontSize: '10px', color: '#7c3aed',
    }).setOrigin(0.5).setDepth(DialogueBox.DEPTH + 1);

    this.container = scene.add.container(0, 0, [this.bg, this.nameTag, this.textContent, this.indicator]);
    this.container.setDepth(DialogueBox.DEPTH);
    this.container.setVisible(false);
  }

  /**
   * Show a dialogue or add it to the queue if one is already showing.
   * Format: "SpeakerName: message text" or just "message text"
   */
  show(fullText: string, duration: number = 6000): void {
    if (this.isActive) {
      this.queue.push({ text: fullText, duration });
      return;
    }
    this.displayNow(fullText, duration);
  }

  private displayNow(fullText: string, duration: number): void {
    this.isActive = true;
    this.container.setVisible(true);

    // Parse speaker name
    const colonIdx = fullText.indexOf(':');
    if (colonIdx > 0 && colonIdx < 30) {
      const name = fullText.substring(0, colonIdx).trim();
      const text = fullText.substring(colonIdx + 1).trim().replace(/^"|"$/g, '');
      this.nameTag.setText(name);
      this.textContent.setText(text);
    } else {
      this.nameTag.setText('');
      this.textContent.setText(fullText);
    }

    // Blink indicator — kill previous tween first
    this.scene.tweens.killTweensOf(this.indicator);
    this.indicator.setAlpha(1);
    this.scene.tweens.add({
      targets: this.indicator,
      alpha: { from: 1, to: 0.2 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Auto-advance
    this.currentTimer = this.scene.time.delayedCall(duration, () => {
      this.advanceOrHide();
    });

    // Click to advance
    this.scene.input.off('pointerdown', this.onClick, this);
    this.scene.time.delayedCall(400, () => {
      if (this.isActive) {
        this.scene.input.once('pointerdown', this.onClick, this);
      }
    });
  }

  private onClick = (): void => {
    this.advanceOrHide();
  };

  private advanceOrHide(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.displayNow(next.text, next.duration);
    } else {
      this.hide();
    }
  }

  hide(): void {
    this.isActive = false;
    this.container.setVisible(false);
    this.scene.tweens.killTweensOf(this.indicator);
    this.indicator.setAlpha(1);
    if (this.currentTimer) {
      this.currentTimer.destroy();
      this.currentTimer = undefined;
    }
    this.scene.input.off('pointerdown', this.onClick, this);
  }

  isShowing(): boolean {
    return this.isActive;
  }

  destroy(): void {
    this.queue = [];
    this.hide();
    this.container.destroy();
  }
}
