import Phaser from 'phaser';
import type { Card, Deck, FusedItem } from '../../core/cardSystem';
import { openFusionAltar } from '../../ui/FusionAltarUI';
import { gameBus } from '../../core/eventBus';
import { checkRecipe } from '../../core/recipeCheck';
import { unlockHiddenLevel } from '../../core/hiddenLevelUnlock';

interface LaunchData {
  inventoryIds: string[];
  deck: Deck;
}

export class FusionAltarScene extends Phaser.Scene {
  constructor() { super('FusionAltarScene'); }

  private inventoryIds: string[] = [];
  private deck!: Deck;
  private selectedIds: string[] = [];
  private inventoryCards: Card[] = [];
  private cardRects: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private slotRects: Phaser.GameObjects.Rectangle[] = [];
  private slotLabels: Phaser.GameObjects.Text[] = [];
  private fuseButton?: Phaser.GameObjects.Rectangle;
  private fuseLabel?: Phaser.GameObjects.Text;
  private resultText?: Phaser.GameObjects.Text;

  init(data: LaunchData) {
    this.inventoryIds = data.inventoryIds ?? [];
    this.deck = data.deck;
    this.selectedIds = [];
  }

  create() {
    const byId = new Map<string, Card>();
    for (const c of this.deck.itemCards) byId.set(c.id, c);
    for (const c of this.deck.physicsCards) byId.set(c.id, c);
    this.inventoryCards = this.inventoryIds
      .map(id => byId.get(id))
      .filter((c): c is Card => Boolean(c));

    this.add.text(640, 60, 'Fusion Altar', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);

    if (this.inventoryCards.length < 2) {
      this.add.text(640, 360, 'Find at least 2 items to fuse.', {
        fontSize: '18px', color: '#aaa',
      }).setOrigin(0.5);
      this.addButton('Back', 600, () => this.exit(null));
      return;
    }

    this.add.text(640, 110, 'Click two cards to fuse:', {
      fontSize: '14px', color: '#aaa',
    }).setOrigin(0.5);

    this.inventoryCards.forEach((card, i) => {
      const x = 120 + i * 110;
      const y = 220;
      const rect = this.add.rectangle(x, y, 80, 100, 0x222244)
        .setStrokeStyle(1, 0xaaaaff)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, card.name, {
        fontSize: '11px', color: '#fff', wordWrap: { width: 76 },
      }).setOrigin(0.5);
      rect.on('pointerdown', () => this.toggle(card.id));
      this.cardRects.set(card.id, rect);
    });

    this.slotRects = [
      this.add.rectangle(540, 420, 120, 80, 0x111122).setStrokeStyle(1, 0x666688),
      this.add.rectangle(740, 420, 120, 80, 0x111122).setStrokeStyle(1, 0x666688),
    ];
    this.slotLabels = [
      this.add.text(540, 420, 'Slot 1', { fontSize: '12px', color: '#888' }).setOrigin(0.5),
      this.add.text(740, 420, 'Slot 2', { fontSize: '12px', color: '#888' }).setOrigin(0.5),
    ];

    this.fuseButton = this.add.rectangle(640, 560, 200, 50, 0x333344)
      .setStrokeStyle(1, 0xaaaaff)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.fuseLabel = this.add.text(640, 560, 'FUSE', {
      fontSize: '18px', color: '#fff',
    }).setOrigin(0.5);
    this.fuseButton.on('pointerdown', () => this.doFuse());
    this.updateFuseButton();

    this.addButton('Back', 640, () => this.exit(null));
  }

  private toggle(cardId: string) {
    const idx = this.selectedIds.indexOf(cardId);
    const rect = this.cardRects.get(cardId);
    if (!rect) return;
    if (idx >= 0) {
      this.selectedIds.splice(idx, 1);
      rect.setFillStyle(0x222244);
    } else {
      if (this.selectedIds.length >= 2) return;
      this.selectedIds.push(cardId);
      rect.setFillStyle(0x4444aa);
    }
    this.updateFuseButton();
  }

  private updateFuseButton() {
    if (!this.fuseButton || !this.fuseLabel) return;
    const ready = this.selectedIds.length === 2;
    this.fuseButton.setFillStyle(ready ? 0x6666aa : 0x333344);
    this.fuseLabel.setAlpha(ready ? 1 : 0.5);
  }

  private doFuse() {
    if (this.selectedIds.length !== 2) return;
    const a = this.inventoryCards.find(c => c.id === this.selectedIds[0]);
    const b = this.inventoryCards.find(c => c.id === this.selectedIds[1]);
    if (!a || !b) return;
    const result = openFusionAltar(this, a, b, this.inventoryCards);
    if (!result) {
      if (this.resultText) this.resultText.destroy();
      this.resultText = this.add.text(640, 380, 'No recipe for this pair.', {
        fontSize: '14px', color: '#f88',
      }).setOrigin(0.5);
      return;
    }
    this.showResult(result);
    gameBus.emit('fusion:complete', { fusedItemId: result.id });

    const hidden = checkRecipe(this.deck, a.name, b.name);
    if (hidden) {
      const palette = this.deck.themeCard.themePayload?.palette
        ?? ['#000000', '#000000', '#000000', '#000000', '#000000'];
      const hl = unlockHiddenLevel(hidden, palette);
      gameBus.emit('hidden:unlocked', { hiddenLevelId: hl.id });
      const existing = (this.registry.get('unlockedHiddenLevels') as unknown[] | null) ?? [];
      this.registry.set('unlockedHiddenLevels', [...existing, hl]);
    }
  }

  private showResult(result: FusedItem) {
    if (this.resultText) this.resultText.destroy();
    this.resultText = this.add.text(640, 380, `Fused: ${result.name}\n${result.behavior}`, {
      fontSize: '16px', color: '#ff0', align: 'center',
    }).setOrigin(0.5);
  }

  private addButton(label: string, y: number, onClick: () => void) {
    const bg = this.add.rectangle(640, y, 200, 36, 0x222233).setStrokeStyle(1, 0xaaaaff)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(640, y, label, { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
    bg.on('pointerdown', onClick);
  }

  private exit(fusedItem: FusedItem | null) {
    this.registry.set('pendingFusedItem', fusedItem);
    this.scene.stop();
    this.scene.wake('GameScene');
  }
}
