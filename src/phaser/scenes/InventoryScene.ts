import Phaser from 'phaser';
import type { Card, Deck } from '../../core/cardSystem';
import { removeFromInventory } from '../../core/inventory';
import { loadSave, saveSave } from '../../core/persistence';
import { getItemEffect } from '../../core/itemUseEffects';

type Category = 'all' | 'consumable' | 'material' | 'fused' | 'key_item';

const CATEGORY_LABELS: Record<Category, string> = {
  all: '全部',
  consumable: '消耗品',
  material: '材料',
  fused: '融合品',
  key_item: '重要物品',
};

const CATEGORY_ORDER: Category[] = ['all', 'consumable', 'material', 'fused', 'key_item'];

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  card: Card;
}

export class InventoryScene extends Phaser.Scene {
  constructor() { super('InventoryScene'); }

  private inventory: string[] = [];
  private deck!: Deck;
  private selectedIdx = 0;
  private currentCategory: Category = 'all';
  private filteredItems: InventoryItem[] = [];
  private slotGraphics: Phaser.GameObjects.Rectangle[] = [];
  private nameText!: Phaser.GameObjects.Text;
  private descText!: Phaser.GameObjects.Text;
  private actionText!: Phaser.GameObjects.Text;
  private tabTexts: Phaser.GameObjects.Text[] = [];
  private categorySelection = 0;

  init(data: { inventoryIds: string[]; deck: Deck }) {
    this.inventory = data.inventoryIds;
    this.deck = data.deck;
    this.selectedIdx = 0;
    this.currentCategory = 'all';
    this.categorySelection = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0a1e, 0.92);
    const cx = 640;
    const cy = 360;

    // Background overlay
    const bg = this.add.rectangle(cx, cy, 1100, 620, 0x0a0a1e, 0.95).setOrigin(0.5);
    bg.setStrokeStyle(2, 0x7c3aed, 0.6);

    // Title
    this.add.text(cx, 30, '背包', { fontSize: '22px', color: '#c4b5fd' }).setOrigin(0.5);
    this.add.text(cx, 55, `持有: ${this.inventory.length}/6`, { fontSize: '12px', color: '#6b7280' }).setOrigin(0.5);

    // Category tabs
    let tabX = 100;
    this.tabTexts = [];
    CATEGORY_ORDER.forEach((cat, i) => {
      const isSelected = this.currentCategory === cat;
      const tab = this.add.text(tabX, 85, CATEGORY_LABELS[cat], {
        fontSize: '13px',
        color: isSelected ? '#c4b5fd' : '#4b5563',
        backgroundColor: isSelected ? '#1e1e3a' : undefined,
        padding: { x: 8, y: 4 },
      }).setInteractive({ useHandCursor: true });
      tab.on('pointerdown', () => { this.currentCategory = cat; this.categorySelection = i; this.refreshGrid(); });
      this.tabTexts.push(tab);
      tabX += 90;
    });

    // Refresh display
    this.refreshGrid();

    // Bottom info panel
    const infoY = 570;
    this.nameText = this.add.text(100, infoY, '', { fontSize: '15px', color: '#e0e0e0' });
    this.descText = this.add.text(100, infoY + 22, '', { fontSize: '12px', color: '#9ca3af' });
    this.actionText = this.add.text(cx, infoY + 22, '', { fontSize: '12px', color: '#6b7280' }).setOrigin(0.5, 0);

    // Controls hint
    this.add.text(cx, 650, '方向键/WASD 选择  |  E 使用  |  Q 丢弃  |  Tab 切换分类  |  I/Esc 关闭', {
      fontSize: '11px', color: '#4b5563',
    }).setOrigin(0.5);

    // Keyboard input
    this.input.keyboard!.on('keydown-I', () => this.closeInventory());
    this.input.keyboard!.on('keydown-ESC', () => this.closeInventory());
    this.input.keyboard!.on('keydown-TAB', () => { this.cycleCategory(); });

    // Arrow/WASD navigation
    this.input.keyboard!.on('keydown-UP', () => this.moveSelection(-3));
    this.input.keyboard!.on('keydown-W', () => this.moveSelection(-3));
    this.input.keyboard!.on('keydown-DOWN', () => this.moveSelection(3));
    this.input.keyboard!.on('keydown-S', () => this.moveSelection(3));
    this.input.keyboard!.on('keydown-LEFT', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-A', () => this.moveSelection(-1));
    this.input.keyboard!.on('keydown-RIGHT', () => this.moveSelection(1));
    this.input.keyboard!.on('keydown-D', () => this.moveSelection(1));

    this.input.keyboard!.on('keydown-E', () => this.useSelected());
    this.input.keyboard!.on('keydown-Q', () => this.dropSelected());

    // Refresh on any inventory change
    this.refreshGrid();
  }

  private cycleCategory() {
    this.categorySelection = (this.categorySelection + 1) % CATEGORY_ORDER.length;
    this.currentCategory = CATEGORY_ORDER[this.categorySelection]!;
    this.tabTexts.forEach((t, i) => {
      const isSel = this.currentCategory === CATEGORY_ORDER[i];
      t.setColor(isSel ? '#c4b5fd' : '#4b5563');
      t.setBackgroundColor(isSel ? '#1e1e3a' : undefined);
    });
    this.selectedIdx = 0;
    this.refreshGrid();
  }

  private refreshGrid() {
    // Clear old slots
    this.slotGraphics.forEach(g => g.destroy());
    this.slotGraphics = [];

    // Build filtered list
    const allCards = [...this.deck.itemCards, ...this.deck.physicsCards];
    const byId = new Map<string, Card>();
    allCards.forEach(c => byId.set(c.id, c));

    this.filteredItems = this.inventory
      .map(id => {
        const card = byId.get(id);
        if (!card) return null;
        return {
          id,
          name: card.name,
          description: card.type === 'item' ? (card as any).itemPayload?.behavior ?? '' : '',
          category: this.getItemCategory(card),
          card,
        } as InventoryItem;
      })
      .filter((item): item is InventoryItem => {
        if (!item) return false;
        if (this.currentCategory === 'all') return true;
        return item.category === this.currentCategory;
      });

    // Draw grid (3 columns)
    const startX = 120;
    const startY = 120;
    const slotSize = 80;
    const gap = 10;
    const cols = 3;

    this.filteredItems.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (slotSize + gap);
      const y = startY + row * (slotSize + gap);
      const isSelected = i === this.selectedIdx;

      // Slot background
      const slot = this.add.rectangle(x, y, slotSize, slotSize, isSelected ? 0x7c3aed : 0x1e1e3a, isSelected ? 0.4 : 0.8)
        .setOrigin(0);
      if (isSelected) {
        slot.setStrokeStyle(2, 0x7c3aed);
      }
      this.slotGraphics.push(slot);

      // Item name (first 6 chars)
      this.add.text(x + 4, y + 4, item.name.slice(0, 8), { fontSize: '10px', color: '#e0e0e0' });

      // Category badge
      const catColor = item.category === 'consumable' ? '#4ade80'
        : item.category === 'material' ? '#fbbf24'
        : item.category === 'fused' ? '#c084fc'
        : '#6b7280';
      this.add.text(x + 4, y + slotSize - 14, CATEGORY_LABELS[item.category], {
        fontSize: '8px', color: catColor,
      });
    });

    // Update info panel
    if (this.filteredItems.length > 0) {
      const sel = this.filteredItems[this.selectedIdx];
      if (sel) {
        this.nameText.setText(sel.name);
        this.descText.setText(sel.description || '没有描述');
        const effect = getItemEffect(sel.name);
        const canUse = effect !== null;
        this.actionText.setText(`[E] ${canUse ? '使用' : '不可使用'}  |  [Q] 丢弃`);
      }
    } else {
      this.nameText.setText('(空)');
      this.descText.setText('');
      this.actionText.setText('');
    }
  }

  private moveSelection(delta: number) {
    if (this.filteredItems.length === 0) return;
    this.selectedIdx = (this.selectedIdx + delta + this.filteredItems.length) % this.filteredItems.length;
    this.refreshGrid();
  }

  private useSelected() {
    const item = this.filteredItems[this.selectedIdx];
    if (!item) return;
    const effect = getItemEffect(item.name);
    if (!effect) {
      this.showToast(`${item.name} 无法在此使用`);
      return;
    }
    // Store the item to use and close inventory — GameScene will handle the effect
    this.registry.set('pendingUseItem', item.id);
    this.closeInventory();
  }

  private dropSelected() {
    const item = this.filteredItems[this.selectedIdx];
    if (!item) return;
    // Simple confirmation via text
    this.showToast(`丢弃 ${item.name}? 再按一次 Q 确认`);
    const handler = () => {
      this.inventory = removeFromInventory(this.inventory, item.id);
      const save = loadSave();
      save.collectedEchoIds.push(`dropped_${item.id}_${Date.now()}`);
      saveSave(save);
      this.registry.set('inventoryUpdated', this.inventory);
      this.refreshGrid();
      this.showToast(`${item.name} 已丢弃`);
      this.input.keyboard!.off('keydown-Q', handler);
    };
    this.input.keyboard!.once('keydown-Q', handler);
  }

  private getItemCategory(card: Card): Category {
    if (card.type === 'item') {
      const name = card.name;
      if (['rose potion', 'brine comet', 'frost splinter', 'cyan blade', 'ferment orb', 'ember shard', 'ash flake', 'sun coin', 'sour drop', 'glass mote', 'spore sac', 'charcoal twig'].includes(name)) {
        return 'consumable';
      }
      if (['pickled star', 'vine whip', 'dill drone', 'tide coin', 'moss pebble', 'glass fang', 'rune fragment', 'lantern wisp', 'brine pearl', 'saltspun coin', 'amber bead', 'fern chip', 'prism chip', 'echo shard', 'wax bell', 'gloam thread', 'marrow bead'].includes(name)) {
        return 'material';
      }
    }
    if (card.type === 'hidden' || name === 'fused') return 'fused';
    return 'key_item';
  }

  private showToast(text: string) {
    const t = this.add.text(640, 350, text, {
      fontSize: '14px', color: '#fff',
      backgroundColor: '#1a1a2ecc', padding: { x: 12, y: 6 },
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: { from: 0, to: 1 }, duration: 150 });
    this.time.delayedCall(2000, () => {
      this.tweens.add({ targets: t, alpha: 0, duration: 300, onComplete: () => t.destroy() });
    });
  }

  private closeInventory() {
    this.registry.set('inventoryUpdated', this.inventory);
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
