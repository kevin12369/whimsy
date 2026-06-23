import Phaser from 'phaser';
import { runWFC } from '../../procgen/wfc';
import { THEME_WORLDS, biomeWeightsFor } from '../../procgen/themeWorlds';
import { buildFallbackDeck } from '../../procgen/deckFallback';
import { createSession, advanceLevel, reachedExitPixel } from '../../core/sessionLoop';
import { computeMove, canMoveTo } from '../entities/Player';
import { addToInventory, INVENTORY_MAX } from '../../core/inventory';
import { gameBus } from '../../core/eventBus';
import { spawnItemsForLevel, spawnNpcsForLevel, placeFusionAltar } from '../../procgen/levelSpawner';
import { itemInPickupRange, altarInOpenRange, npcInTalkRange } from '../../core/proximity';
import { pickDialogueLine, recordLine } from '../../core/dialogueOverlay';
import type { Card, Deck } from '../../core/cardSystem';

const SPAWN_PAD = 3;

interface Placement {
  cardId: string;
  tileX: number;
  tileY: number;
}

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  private player!: Phaser.GameObjects.Rectangle;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private escKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;

  private tilemap: number[] = [];
  private w = 0; private h = 0; private tileSize = 16;
  private exitPos = { x: 0, y: 0 };
  private altarPos = { x: 0, y: 0 };
  private session = createSession();

  private deck!: Deck;
  private itemPlacements: Placement[] = [];
  private npcPlacements: Placement[] = [];
  private itemEntities: Map<string, Phaser.GameObjects.Container> = new Map();
  private npcEntities: Map<string, Phaser.GameObjects.Container> = new Map();

  private inventory: string[] = [];
  private hudText!: Phaser.GameObjects.Text;
  private invText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private dialogueText: Phaser.GameObjects.Text | null = null;

  private dialogueHistory: string[] = [];
  private currentDialogueRole?: string;

  init(data: { levelIndex?: number; deck?: Deck }) {
    if (typeof data?.levelIndex === 'number') {
      this.session = { ...this.session, currentLevelIndex: data.levelIndex };
    }
    if (data?.deck) {
      this.deck = data.deck;
    }
  }

  create() {
    if (!this.deck) {
      this.deck = buildFallbackDeck(this.session.currentLevelIndex);
    }
    this.registry.set('deck', this.deck);

    const world = THEME_WORLDS[this.session.currentLevelIndex % THEME_WORLDS.length]!;
    this.w = 40; this.h = 30;
    this.tilemap = runWFC(this.w, this.h, {
      seed: (Date.now() & 0xffff) ^ this.session.currentLevelIndex,
      weights: biomeWeightsFor(world.id),
    });
    for (let y = 0; y < SPAWN_PAD; y++) {
      for (let x = 0; x < SPAWN_PAD; x++) {
        this.tilemap[y * this.w + x] = 0;
      }
    }
    for (let y = this.h - SPAWN_PAD; y < this.h; y++) {
      for (let x = this.w - SPAWN_PAD; x < this.w; x++) {
        this.tilemap[y * this.w + x] = 0;
      }
    }
    this.exitPos = { x: this.w - 2, y: this.h - 2 };

    this.itemPlacements = spawnItemsForLevel(
      this.tilemap, this.w, this.h,
      this.deck.itemCards.slice(0, 6).map(c => c.id),
      this.session.currentLevelIndex + 1,
    );
    this.npcPlacements = spawnNpcsForLevel(
      this.tilemap, this.w, this.h,
      this.deck.npcCards.slice(0, 3).map(c => c.id),
      this.session.currentLevelIndex + 1,
      this.itemPlacements,
    );
    const altar = placeFusionAltar(this.tilemap, this.w, this.h, this.session.currentLevelIndex + 1);
    this.altarPos = { x: altar.tileX, y: altar.tileY };

    // Force a 3x3 floor pad around every spawned entity so the
    // player can always walk up to them, even when the surrounding
    // WFC output is mostly walls (forest biome: 36% floor only).
    const forcePad = (cx: number, cy: number) => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
          this.tilemap[y * this.w + x] = 0;
        }
      }
    };
    for (const p of this.itemPlacements) forcePad(p.tileX, p.tileY);
    for (const p of this.npcPlacements) forcePad(p.tileX, p.tileY);
    forcePad(this.altarPos.x, this.altarPos.y);

    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    this.drawTilemap(offsetX, offsetY);

    const exitPx = offsetX + this.exitPos.x * this.tileSize;
    const exitPy = offsetY + this.exitPos.y * this.tileSize;
    this.add.rectangle(exitPx, exitPy, this.tileSize * 2, this.tileSize * 2, 0xffff00).setOrigin(0);
    this.add.rectangle(exitPx + 4, exitPy + 4, this.tileSize * 2 - 8, this.tileSize * 2 - 8, 0x444400).setOrigin(0);
    this.add.text(exitPx + 4, exitPy - 18, 'EXIT', { fontSize: '12px', color: '#ff0' });

    for (const p of this.itemPlacements) {
      const px = offsetX + p.tileX * this.tileSize + this.tileSize / 2;
      const py = offsetY + p.tileY * this.tileSize + this.tileSize / 2;
      const card = this.deck.itemCards.find(c => c.id === p.cardId);
      const c = this.add.container(px, py);
      const rect = this.add.rectangle(0, 0, 14, 14, 0xff8800).setStrokeStyle(1, 0xffffff);
      const label = this.add.text(0, 0, card?.name.slice(0, 4) ?? '?', {
        fontSize: '8px', color: '#000',
      }).setOrigin(0.5);
      c.add([rect, label]);
      this.itemEntities.set(p.cardId, c);
    }

    for (const p of this.npcPlacements) {
      const px = offsetX + p.tileX * this.tileSize + this.tileSize / 2;
      const py = offsetY + p.tileY * this.tileSize + this.tileSize / 2;
      const card = this.deck.npcCards.find(c => c.id === p.cardId);
      const c = this.add.container(px, py);
      const body = this.add.rectangle(0, 0, 16, 16, 0x66ffaa).setStrokeStyle(1, 0xffffff);
      const label = this.add.text(0, 0, '!', { fontSize: '12px', color: '#000' }).setOrigin(0.5);
      c.add([body, label]);
      c.setData('cardId', p.cardId);
      this.npcEntities.set(p.cardId, c);
    }

    const altarPx = offsetX + this.altarPos.x * this.tileSize + this.tileSize / 2;
    const altarPy = offsetY + this.altarPos.y * this.tileSize + this.tileSize / 2;
    const altarEntity = this.add.container(altarPx, altarPy);
    altarEntity.add(this.add.rectangle(0, 0, 18, 18, 0xff00ff).setStrokeStyle(2, 0xffffff));
    altarEntity.add(this.add.text(0, 0, '*', { fontSize: '14px', color: '#fff' }).setOrigin(0.5));

    this.player = this.add.rectangle(
      offsetX + this.tileSize * 2, offsetY + this.tileSize * 2,
      12, 12, 0x00ffff,
    );

    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.eKey = this.input.keyboard!.addKey('E');
    this.escKey = this.input.keyboard!.addKey('ESC');

    this.hudText = this.add.text(offsetX + 8, offsetY + 6,
      `Level ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}  World: ${world.name}`,
      { color: '#fff', fontSize: '13px' });
    this.invText = this.add.text(offsetX + 8, offsetY + 24,
      'INV: (empty)', { color: '#aaa', fontSize: '11px',
      wordWrap: { width: this.w * this.tileSize - 16 } });
    // Prompt lives at the bottom of the map (above the hand cards at y=720-80).
    this.promptText = this.add.text(offsetX + this.w * this.tileSize / 2,
      offsetY + this.h * this.tileSize - 12, '[Esc] Pause', {
      fontSize: '12px', color: '#ff0',
    }).setOrigin(0.5, 1);

    this.escKey.on('down', () => this.openPause());
    this.eKey.on('down', () => this.handleE());

    this.scene.launch('HandScene');

    const pending = this.registry.get('pendingFusedItem') as { id: string; name: string } | null;
    if (pending) {
      this.registry.remove('pendingFusedItem');
      const result = addToInventory(this.inventory, pending.id);
      this.inventory = result.inv;
      this.refreshInventoryText();
      this.showFloatingText(`+ ${pending.name}`);
    }
  }

  private drawTilemap(offsetX: number, offsetY: number) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = this.tilemap[y * this.w + x]!;
        const color = t === 1 ? 0x444444 : t === 2 ? 0x2244aa : 0x222222;
        this.add.rectangle(offsetX + x * this.tileSize, offsetY + y * this.tileSize, this.tileSize, this.tileSize, color).setOrigin(0);
      }
    }
  }

  override update(_t: number, dt: number) {
    if (!this.player) return;
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const next = computeMove(
      { x: this.player.x - offsetX, y: this.player.y - offsetY },
      {
        up: this.keys.up.isDown || this.wasd.W!.isDown,
        down: this.keys.down.isDown || this.wasd.S!.isDown,
        left: this.keys.left.isDown || this.wasd.A!.isDown,
        right: this.keys.right.isDown || this.wasd.D!.isDown,
      },
      dt / 1000,
    );
    if (canMoveTo(next.x, next.y, this.w, this.h, this.tilemap)) {
      this.player.x = offsetX + next.x;
      this.player.y = offsetY + next.y;
    }

    this.refreshProximityPrompt();

    if (reachedExitPixel(this.player.x - offsetX, this.player.y - offsetY, this.exitPos.x, this.exitPos.y, this.tileSize, 2, 2)) {
      if (this.session.currentLevelIndex >= this.session.maxLevels - 1) {
        gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
        this.scene.start('MenuScene');
        return;
      }
      this.session = advanceLevel(this.session);
      gameBus.emit('level:exit', { levelIndex: this.session.currentLevelIndex });
      this.scene.start('GameScene', { levelIndex: this.session.currentLevelIndex, deck: this.deck });
    }
  }

  private refreshProximityPrompt() {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const px = this.player.x - offsetX;
    const py = this.player.y - offsetY;

    const nearItem = this.itemPlacements.find(p =>
      itemInPickupRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearItem) {
      const card = this.deck.itemCards.find(c => c.id === nearItem.cardId);
      this.promptText.setText(`[E] Pick up: ${card?.name ?? 'item'}`);
      return;
    }
    const nearNpc = this.npcPlacements.find(p =>
      npcInTalkRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearNpc) {
      const card = this.deck.npcCards.find(c => c.id === nearNpc.cardId);
      this.promptText.setText(`[E] Talk to ${card?.name ?? 'NPC'}`);
      return;
    }
    if (altarInOpenRange(px, py,
      (this.altarPos.x + 0.5) * this.tileSize,
      (this.altarPos.y + 0.5) * this.tileSize)) {
      this.promptText.setText('[E] Open Fusion Altar');
      return;
    }
    this.promptText.setText('[Esc] Pause');
  }

  private handleE() {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const px = this.player.x - offsetX;
    const py = this.player.y - offsetY;

    const nearItemIdx = this.itemPlacements.findIndex(p =>
      itemInPickupRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearItemIdx >= 0) {
      const placement = this.itemPlacements[nearItemIdx]!;
      const result = addToInventory(this.inventory, placement.cardId);
      if (result.added) {
        this.inventory = result.inv;
        this.itemPlacements.splice(nearItemIdx, 1);
        const entity = this.itemEntities.get(placement.cardId);
        entity?.destroy();
        this.itemEntities.delete(placement.cardId);
        const card = this.deck.itemCards.find(c => c.id === placement.cardId);
        gameBus.emit('card:picked-up', { cardId: placement.cardId });
        this.refreshInventoryText();
        this.showFloatingText(`+ ${card?.name ?? 'item'}`);
      }
      return;
    }

    const nearNpc = this.npcPlacements.find(p =>
      npcInTalkRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearNpc) {
      const card = this.deck.npcCards.find(c => c.id === nearNpc.cardId);
      if (!card) return;
      const role = card.name;
      const history = this.currentDialogueRole === role ? this.dialogueHistory : [];
      const line = pickDialogueLine(role, history);
      this.currentDialogueRole = role;
      this.dialogueHistory = recordLine(history, line);
      this.showDialogue(`${role}: ${line}`);
      gameBus.emit('npc:dialogue', { npcId: nearNpc.cardId, line });
      return;
    }

    if (altarInOpenRange(px, py,
      (this.altarPos.x + 0.5) * this.tileSize,
      (this.altarPos.y + 0.5) * this.tileSize)) {
      this.openFusionAltar();
      return;
    }
  }

  private refreshInventoryText() {
    if (this.inventory.length === 0) {
      this.invText.setText('INV: (empty)');
      return;
    }
    const byId = new Map<string, Card>();
    for (const c of this.deck.itemCards) byId.set(c.id, c);
    for (const c of this.deck.physicsCards) byId.set(c.id, c);
    const names = this.inventory.map(id => byId.get(id)?.name ?? '?');
    const shown = names.length <= 4
      ? names.join(', ')
      : `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    this.invText.setText(`INV (${this.inventory.length}/${INVENTORY_MAX}): ${shown}`);
  }

  private showFloatingText(text: string) {
    const t = this.add.text(this.player.x, this.player.y - 20, text, {
      fontSize: '12px', color: '#ff0',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t, y: this.player.y - 60, alpha: 0, duration: 1000,
      onComplete: () => t.destroy(),
    });
  }

  private showDialogue(text: string) {
    if (this.dialogueText) this.dialogueText.destroy();
    this.dialogueText = this.add.text(640, 600, text, {
      fontSize: '14px', color: '#fff', backgroundColor: '#222',
      padding: { x: 12, y: 6 }, wordWrap: { width: 600 },
    }).setOrigin(0.5);
    this.time.delayedCall(4000, () => {
      this.dialogueText?.destroy();
      this.dialogueText = null;
    });
  }

  private openFusionAltar() {
    this.scene.launch('FusionAltarScene', {
      inventoryIds: this.inventory,
      deck: this.deck,
    });
    this.scene.pause();
  }

  private openPause() {
    this.scene.launch('PauseScene');
    this.scene.pause();
  }
}
