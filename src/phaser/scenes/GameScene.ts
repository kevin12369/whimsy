import Phaser from 'phaser';
import { runWFC } from '../../procgen/wfc';
import { THEME_WORLDS, biomeWeightsFor } from '../../procgen/themeWorlds';
import type { ThemeWorld, WorldId } from '../../procgen/themeWorlds';
import { buildFallbackDeck } from '../../procgen/deckFallback';
import { createSession, advanceLevel, reachedExitPixel } from '../../core/sessionLoop';
import { computeMove, canMoveTo, triggerDash, triggerDashWithCooldown, isDashReady, updateDashCooldown, DASH_COOLDOWN_MS } from '../entities/Player';
import { PLAYER_SPEED, TILE_SIZE } from '../../config/constants';
import { addToInventory, removeFromInventory, INVENTORY_MAX } from '../../core/inventory';
import { gameBus } from '../../core/eventBus';
import { spawnItemsForLevel, spawnNpcsForLevel, placeFusionAltar } from '../../procgen/levelSpawner';
import { itemInPickupRange, altarInOpenRange, npcInTalkRange } from '../../core/proximity';
import { pickDialogueLine, recordLine } from '../../core/dialogueOverlay';
import { safeAddSprite } from '../../core/assetLoader';
import { SPRITE_KEYS } from '../../config/assets';
import { getItemEffect, executeItemEffect } from '../../core/itemUseEffects';
import type { EffectContext } from '../../core/itemUseEffects';
import type { Card, Deck } from '../../core/cardSystem';
import { loadSave, saveSave, addEcho, addFragments, completeQuest, isQuestCompleted, addFavor, getFavor, isCompanionRecruited, recruitCompanion } from '../../core/persistence';
import { COMPANIONS, COMPANION_DIALOGUES, STORY_FRAGMENTS, QUEST_GIVERS, getQuestGiverForRealm, getBondLevel, getBondProgress } from '../../core/companion';
import type { CompanionId, CompanionDef, CompanionLine, QuestGiverDef, QuestDef } from '../../core/companion';
import { getTileFrame } from '../../procgen/tileFrames';
import { getItemFrame } from '../../procgen/itemFrames';
import { getEventsForRealm, resolveConflict, type ConflictState } from '../../core/domainConflict';
import { getMoralChoice } from '../../core/moralChoices';
import { CompanionEntity } from '../entities/Companion';
import { DialogueBox } from '../../ui/DialogueBox';
import { createKeyIcon } from '../../ui/KeyIcon';
import { spawnVFX, spawnVFXBurst } from '../../ui/VFX';
import { playSFX } from '../../ui/AudioManager';
import { TUTORIAL_STEPS, getTutorialStep } from '../../core/tutorial';

const SPAWN_PAD = 3;

interface Placement {
  cardId: string;
  tileX: number;
  tileY: number;
}

interface ExpeditionData {
  realmId: WorldId;
  realmPalette: [string, string, string, string, string];
  layer: number; // 0-4
  isExpedition: true;
  contaminatorId?: string; // Optional contamination source
}

interface LegacyData {
  levelIndex?: number;
  deck?: Deck;
}

interface TutorialData {
  isTutorial: true;
}

type InitData = ExpeditionData | LegacyData | TutorialData;

function isExpedition(data: InitData): data is ExpeditionData {
  return 'isExpedition' in data && data.isExpedition === true;
}

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  private player!: Phaser.GameObjects.Rectangle;
  private playerAnimPaused = false;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private escKey!: Phaser.Input.Keyboard.Key;
  private eKey!: Phaser.Input.Keyboard.Key;
  private qKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private tilemap: number[] = [];
  private w = 0; private h = 0; private tileSize = TILE_SIZE;
  private exitPos = { x: 0, y: 0 };
  private altarPos = { x: 0, y: 0 };
  private session = createSession();

  private currentWorld!: ThemeWorld;
  private deck!: Deck;
  private itemPlacements: Placement[] = [];
  private npcPlacements: Placement[] = [];
  private itemEntities: Map<string, Phaser.GameObjects.Container> = new Map();
  private npcEntities: Map<string, Phaser.GameObjects.Container> = new Map();
  private exitEntity?: Phaser.GameObjects.Container;
  private tileGraphics: Phaser.GameObjects.Rectangle[] = [];
  private fogOverlay?: Phaser.GameObjects.RenderTexture;
  private visionMask?: Phaser.GameObjects.Image;
  private readonly BASE_VISION_RADIUS = 100; // px radius of visible area
  private visionRadius = 100;

  private inventory: string[] = [];
  private hudText!: Phaser.GameObjects.Text;
  private invText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private dialogueText: Phaser.GameObjects.Text | null = null;
  private dialogueBox!: DialogueBox;

  private dialogueHistory: string[] = [];
  private currentDialogueRole?: string;

  // v2 expedition fields
  private isExpedition = false;
  private isTutorial = false;
  private tutorialStep = 0;
  private tutorialMarkers: Phaser.GameObjects.Container[] = [];
  private expeditionRealm?: WorldId;
  private contaminatorId?: string;
  private currentLayer = 0;
  private playerHp = 3;
  private trapCooldown = 0; // ms timestamp for next trap damage
  private maxHp = 3;
  private fragmentCount = 0;
  private fragmentEntities: any[] = [];

  // Level objective system
  private static readonly OBJECTIVE_TYPES = ['reach', 'collect', 'fusion'] as const;
  private currentObjective: typeof GameScene.OBJECTIVE_TYPES[number] = 'reach';
  private objectiveComplete = false;
  private objectiveText!: Phaser.GameObjects.Text;
  private dashCooldownIndicator?: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;

  // Companion fields
  private activeCompanion?: CompanionDef;
  private companionEntity?: CompanionEntity;
  private companionBondXp = 0;
  private companionBondLevel: number = 1;
  private companionBubbleCooldown = 0;
  private companionDialoguesSeen: string[] = [];
  private itemGlowState: Map<string, boolean> = new Map();
  private storyFragmentEntities: Phaser.GameObjects.Container[] = [];
  private questGiverEntity?: Phaser.GameObjects.Container;
  private questGiverPos?: { x: number; y: number };
  // Domain conflict fields
  private conflictEntities: Phaser.GameObjects.Container[] = [];
  private conflictEventPositions: Array<{ x: number; y: number; eventId: string }> = [];
  private moralEventPositions: Array<{ x: number; y: number; choiceId: string }> = [];
  private pendingConflictEvent?: import('../../core/domainConflict').ConflictEvent;
  private conflictTriggered = false; // prevent re-trigger

  init(data: InitData) {
    // Reset all state
    this.isTutorial = false;
    this.isExpedition = false;
    this.contaminatorId = undefined;
    this.playerHp = 3;
    this.trapCooldown = 0;
    this.fragmentCount = 0;
    this.currentObjective = 'reach';
    this.objectiveComplete = false;
    this.tutorialStep = 0;
    this.inventory = [];
    this.itemEntities.clear();
    this.npcEntities.clear();
    this.fragmentEntities = [];
    this.storyFragmentEntities = [];
    this.tutorialMarkers = [];
    this.itemPlacements = [];
    this.npcPlacements = [];
    this.tileGraphics = [];

    if (data && 'isTutorial' in data && data.isTutorial) {
      this.isTutorial = true;
    } else if (data && isExpedition(data)) {
      this.isExpedition = true;
      this.expeditionRealm = data.realmId;
      this.currentLayer = data.layer;
      this.contaminatorId = data.contaminatorId;
    } else {
      if ((data as any) && typeof (data as any).levelIndex === 'number') {
        this.session = { ...this.session, currentLevelIndex: (data as any).levelIndex };
      }
      if ((data as any)?.deck) {
        this.deck = (data as any).deck;
      }
    }
  }

  create() {
    if (this.isTutorial) {
      this.createTutorialLevel();
    } else if (!this.isExpedition) {
      this.createLegacyLevel();
    } else {
      this.createExpeditionLayer();
    }
  }

  // ─── TUTORIAL MODE ─────────────────────────────────────────
  private createTutorialLevel() {
    try {
      this.dialogueBox = new DialogueBox(this);
      this.currentWorld = THEME_WORLDS[0]!;
      this.w = 25;
      this.h = 20;
      this.deck = buildFallbackDeck(0);
      this.registry.set('deck', this.deck);

      this.tilemap = new Array(this.w * this.h).fill(0);
      for (let y = 0; y < this.h; y++) {
        for (let x = 0; x < this.w; x++) {
          if (x === 0 || y === 0 || x === this.w - 1 || y === this.h - 1) this.tilemap[y * this.w + x] = 1;
        }
      }

      this.setupHUD();
      this.setupInput();
      const offsetX = (1280 - this.w * this.tileSize) / 2;
      const offsetY = (720 - this.h * this.tileSize) / 2;
      this.drawTilemap(offsetX, offsetY);
      this.spawnPlayer(2, 2);

      this.createTutorialMarker(offsetX + 6 * this.tileSize, offsetY + 2 * this.tileSize);

      const itemCard = this.deck.itemCards[0];
      if (itemCard) {
        this.itemPlacements.push({ cardId: itemCard.id, tileX: 10, tileY: 2 });
        this.createItemVisual(offsetX, offsetY, itemCard.id, 10, 2);
      }
      this.createTutorialMarker(offsetX + 10 * this.tileSize, offsetY + 2 * this.tileSize - 20);

      const iceItem = this.deck.itemCards.find(c => c.name.includes('brine') || c.name.includes('frost'));
      if (iceItem) this.inventory = [iceItem.id];
      for (let dx = 0; dx < 4; dx++) this.tilemap[5 * this.w + (8 + dx)] = 2;
      this.createTutorialMarker(offsetX + 10 * this.tileSize, offsetY + 5 * this.tileSize - 20);

      const npcCard = this.deck.npcCards[0];
      if (npcCard) {
        this.npcPlacements.push({ cardId: npcCard.id, tileX: 15, tileY: 10 });
        this.createNpcVisual(offsetX, offsetY, npcCard.id, 15, 10);
      }
      this.createTutorialMarker(offsetX + 15 * this.tileSize, offsetY + 10 * this.tileSize - 20);

      this.altarPos = { x: 18, y: 16 };
      this.createAltarVisual(offsetX, offsetY);
      this.createTutorialMarker(offsetX + 18 * this.tileSize, offsetY + 16 * this.tileSize - 20);

      this.showTutorialStep(0);

      const forcePad = (cx: number, cy: number) => {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const x = cx + dx, y = cy + dy;
          if (x >= 0 && x < this.w && y >= 0 && y < this.h) this.tilemap[y * this.w + x] = 0;
        }
      };
      for (const p of this.itemPlacements) forcePad(p.tileX, p.tileY);
      for (const p of this.npcPlacements) forcePad(p.tileX, p.tileY);
      forcePad(this.altarPos.x, this.altarPos.y);
    } catch (e) {
      console.error('TUTORIAL INIT ERROR:', e);
      // Fallback: use expedition mode
      this.scene.start('MenuScene');
    }
  }

  private createTutorialMarker(px: number, py: number) {
    const marker = this.add.rectangle(px, py, 16, 4, 0xfbbf24, 0.8).setOrigin(0.5);
    this.tweens.add({ targets: marker, alpha: { from: 1, to: 0.3 }, duration: 600, yoyo: true, repeat: -1 });
    const container = this.add.container(px, py, [marker]);
    this.tutorialMarkers.push(container);
  }

  private showTutorialStep(stepIdx: number) {
    const step = getTutorialStep(stepIdx);
    if (!step) return;
    this.dialogueBox.show(`教程: ${step.title}\n${step.instruction}`, 15000);
    // Update HUD hint
    this.promptText.setText(step.hint ? `[${step.hint}]` : '');
  }

  private advanceTutorial() {
    this.tutorialStep++;
    if (this.tutorialStep >= TUTORIAL_STEPS.length) {
      // Tutorial complete!
      const save = loadSave();
      save.tutorialCompleted = true;
      saveSave(save);
      this.showFloatingText('教程完成！前往回声档案开始探险吧！', '#52b788');
      this.time.delayedCall(2000, () => {
        this.scene.start('MenuScene');
      });
      return;
    }
    // Hide any current dialogue before showing the next step
    if (this.dialogueBox.isShowing()) {
      this.dialogueBox.hide();
    }
    this.showTutorialStep(this.tutorialStep);
  }

  private createItemVisual(offsetX: number, offsetY: number, cardId: string, tileX: number, tileY: number) {
    const px = offsetX + tileX * this.tileSize + this.tileSize / 2;
    const py = offsetY + tileY * this.tileSize + this.tileSize / 2;
    const card = this.deck.itemCards.find(c => c.id === cardId);
    const c = this.add.container(px, py);
    // Use Kenney item sprite if tilesheet is loaded
    const itemName = card?.name ?? '';
    const itemFrame = getItemFrame(itemName);
    if (this.textures.exists('tilesheet') && itemFrame !== undefined) {
      const sprite = this.add.image(0, 0, 'tilesheet', itemFrame);
      sprite.setOrigin(0.5);
      sprite.setScale(this.tileSize / 16);
      c.add(sprite);
    } else {
      const rect = safeAddSprite(this, 0, 0, SPRITE_KEYS.item, 14, 14, 0xff8800);
      if ('setStrokeStyle' in rect) (rect as Phaser.GameObjects.Rectangle).setStrokeStyle(1, 0xffffff);
      c.add(rect);
    }
    const label = this.add.text(0, 0, itemName.slice(0, 4), { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
    c.add([label]);
    this.tweens.add({ targets: c, y: py - 2, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.itemEntities.set(cardId, c);
  }

  private createNpcVisual(offsetX: number, offsetY: number, cardId: string, tileX: number, tileY: number) {
    const px = offsetX + tileX * this.tileSize + this.tileSize / 2;
    const py = offsetY + tileY * this.tileSize + this.tileSize / 2;
    const card = this.deck.npcCards.find(c => c.id === cardId);
    const c = this.add.container(px, py);
    // Use Kenney character sprite (frame 731 = row 13 col 3) if available
    if (this.textures.exists('tilesheet')) {
      const sprite = this.add.image(0, 0, 'tilesheet', 731);
      sprite.setOrigin(0.5);
      sprite.setScale(this.tileSize / 16);
      c.add(sprite);
    } else {
      const body = safeAddSprite(this, 0, 0, SPRITE_KEYS.npc, 16, 16, 0x66ffaa);
      c.add(body);
    }
    const label = this.add.text(0, 0, '!', { fontSize: '12px', color: '#000' }).setOrigin(0.5);
    c.add([label]);
    c.setData('cardId', cardId);
    this.npcEntities.set(cardId, c);
  }

  // ─── LEGACY MODE (existing flow) ─────────────────────────────────
  private createLegacyLevel() {
    if (!this.deck) {
      this.deck = buildFallbackDeck(this.session.currentLevelIndex);
    }
    this.registry.set('deck', this.deck);
    this.currentWorld = THEME_WORLDS[this.session.currentLevelIndex % THEME_WORLDS.length]!;
    this.w = Phaser.Math.Between(30, 50);
    this.h = Phaser.Math.Between(25, 35);
    this.dialogueBox = new DialogueBox(this);
    this.generateMapAndEntities();
    this.setupHUD();
    this.setupInput();
    this.spawnPlayer(2, 2);
    this.handlePendingFusion();
    this.scene.launch('HandScene');
  }

  // ─── EXPEDITION MODE (v2) ────────────────────────────────────────
  private createExpeditionLayer() {
    // Build a minimal deck for item drops
    this.deck = buildFallbackDeck(this.currentLayer);
    this.registry.set('deck', this.deck);

    // Set world from expedition realm
    const worldDef = THEME_WORLDS.find(w => w.id === this.expeditionRealm) ?? THEME_WORLDS[0]!;
    this.currentWorld = worldDef;
    this.currentWorld.palette = [
      '#1b4332', '#2d6a4f', '#52b788', '#95d5b2', '#d8f3dc',
    ]; // will be overridden later

    // Map size based on layer
    const minW = 25 + this.currentLayer * 3;
    const maxW = 40 + this.currentLayer * 3;
    this.w = Phaser.Math.Between(minW, maxW);
    this.h = Phaser.Math.Between(20 + this.currentLayer * 2, 30 + this.currentLayer * 3);

    this.dialogueBox = new DialogueBox(this);
    this.generateMapAndEntities();

    // Scatter trap tiles on the map (expedition mode)
    if (this.isExpedition) {
      this.placeTrapsForRealm();
    }

    // Contamination effect
    if (this.contaminatorId && this.currentLayer === 0) {
      const contName = this.contaminatorId;
      this.showFloatingText(`此域已被 ${contName} 的残留能量污染！`, '#ff4444');
      this.dialogueBox?.show(`棱镜的回声:\n这片领域被 ${contName} 的残留能量渗透了...小心异常的变化。`, 5000);
    }

    // Fog of war: dark overlay with circle mask
    if (this.isExpedition) {
      this.createFogOverlay();
    }

    this.setupHUD();
    this.setupInput();
    this.spawnPlayer(2, 2);
    this.spawnEchoFragments();

    // Quest giver NPC (layer 0 only, if companion not yet recruited)
    if (this.currentLayer === 0 && this.expeditionRealm) {
      const save = loadSave();
      const qg = getQuestGiverForRealm(this.expeditionRealm);
      if (qg && !save.recruitedCompanions.includes(qg.companionId)) {
        this.spawnQuestGiver(qg);
      }
    }

    // Domain conflict event (layer 1 or 3)
    if (this.isExpedition && this.expeditionRealm && (this.currentLayer === 1 || this.currentLayer === 3)) {
      this.spawnConflictEvent();
    }

    // Moral choice node (layer 0, 2, or 4)
    if (this.isExpedition && (this.currentLayer === 0 || this.currentLayer === 2 || this.currentLayer === 4)) {
      this.spawnMoralChoice();
    }

    // Spawn companion if already recruited via quests
    if (this.expeditionRealm) {
      const save = loadSave();
      const qg = getQuestGiverForRealm(this.expeditionRealm);
      if (qg && save.recruitedCompanions.includes(qg.companionId)) {
        this.activeCompanion = COMPANIONS.find(c => c.id === qg.companionId);
        this.companionBondXp = 0;
        this.companionBondLevel = 1;
        this.spawnCompanionVisual();
        this.triggerCompanionDialogue('enter_layer');
      }
    }

    // Spawn story fragments
    this.spawnStoryFragments();

    this.handlePendingFusion();

    // HUD additions for expedition
    this.hpText = this.add.text(16, 16, this.getHpDisplay(), { fontSize: '14px', color: '#ff6b6b' });
    this.dashCooldownIndicator = this.add.text(16, 36, this.getDashDisplay(), { fontSize: '12px', color: '#4fc3f7' });

    // Level objective
    this.initObjective();
    this.objectiveText = this.add.text(16, 56, this.getObjectiveDisplay(), { fontSize: '11px', color: '#fbbf24' });

    // Create keyboard icon HUD for expedition mode
    if (this.isExpedition) {
      this.createKeyHints();
    }

    // No hand scene in expedition mode (simplified)
  }

  /** Create keyboard-icon-based HUD hints at bottom of screen */
  private createKeyHints() {
    const y = 662;
    const depth = 1800;
    const hints = [
      { key: 'q', label: 'Scan' },
      { key: 'e', label: 'Interact' },
      { key: 'space', label: 'Dash' },
      { key: 'i', label: 'Inv' },
      { key: 'esc', label: 'Menu' },
    ];
    let x = 900;
    const gap = 75;
    for (const hint of hints) {
      const icon = createKeyIcon(this, hint.key, x, y, 16, depth, false);
      const label = this.add.text(x + 12, y, hint.label, {
        fontSize: '10px', color: '#9ca3af',
      }).setOrigin(0, 0.5).setDepth(depth);
      x += gap;
    }
  }

  private getHpDisplay(): string {
    return 'HP: ' + '❤'.repeat(this.playerHp) + '🖤'.repeat(3 - this.playerHp);
  }

  private getDashDisplay(): string {
    if (isDashReady()) return 'DASH: ready [SPACE]';
    return 'DASH: cooling...';
  }

  // ─── LEVEL OBJECTIVES ───────────────────────────────────────

  private readonly OBJECTIVE_LABELS: Record<string, { label: string; desc: string }> = {
    reach: { label: '到达', desc: '到达出口传送门' },
    collect: { label: '收集', desc: '收集回声碎片' },
    fusion: { label: '融合', desc: '在祭坛进行一次融合' },
  };

  /** Pick a random objective for the current layer (expedition only) */
  private initObjective() {
    if (!this.isExpedition) return;
    // First layer is always "reach" (tutorial-light), later layers vary
    if (this.currentLayer === 0) {
      this.currentObjective = 'reach';
    } else {
      const roll = Math.random();
      if (roll < 0.4) this.currentObjective = 'reach';
      else if (roll < 0.7) this.currentObjective = 'collect';
      else this.currentObjective = 'fusion';
    }
    this.objectiveComplete = this.currentObjective === 'reach'; // reach starts complete
  }

  /** Get HUD display string for current objective */
  private getObjectiveDisplay(): string {
    const info = this.OBJECTIVE_LABELS[this.currentObjective];
    if (!info) return '目标: —';
    // Check completion state
    let status = this.objectiveComplete ? '✓' : '○';
    if (this.currentObjective === 'collect') {
      const needed = 3;
      status = `${this.fragmentCount}/${needed}`;
      if (this.fragmentCount >= needed) this.objectiveComplete = true;
    }
    if (this.currentObjective === 'fusion') {
      const hasUsed = this.registry.get('fusionUsedInSession') === true;
      if (hasUsed) this.objectiveComplete = true;
    }
    return `目标: ${info.label} — ${status} ${info.desc}`;
  }

  /** Check if the exit objective is met (called before allowing exit) */
  private isExitAllowed(): boolean {
    if (!this.isExpedition) return true;
    if (this.objectiveComplete) return true;
    // Runtime check for objectives that can be completed reactively
    if (this.currentObjective === 'collect') {
      return this.fragmentCount >= 3;
    }
    if (this.currentObjective === 'fusion') {
      return this.registry.get('fusionUsedInSession') === true;
    }
    return false;
  }

  /** Exit blocked — show floating text to guide player */
  private showObjectiveHint() {
    const info = this.OBJECTIVE_LABELS[this.currentObjective];
    if (!info) return;
    this.showFloatingText(`先完成目标: ${info.desc}`, '#fbbf24');
  }

  // ─── DOMAIN CONFLICT SYSTEM ──────────────────────────────

  /** Spawn a conflict event zone on the map */
  private spawnConflictEvent() {
    if (!this.expeditionRealm) return;
    const save = loadSave();
    const state: import('../../core/domainConflict').ConflictState = {
      favor: save.conflictFavor,
      completedEvents: save.conflictCompletedEvents,
      allegiance: save.conflictAllegiance,
    };
    const events = getEventsForRealm(this.expeditionRealm, state);
    if (events.length === 0) return;
    const event = events[0]!;
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    for (let attempt = 0; attempt < 50; attempt++) {
      const tx = Phaser.Math.Between(5, this.w - 5);
      const ty = Phaser.Math.Between(5, this.h - 5);
      if (this.tilemap[ty * this.w + tx] !== 0) continue;
      if (this.itemPlacements.some(p => Math.abs(p.tileX - tx) + Math.abs(p.tileY - ty) < 3)) continue;
      const px = offsetX + tx * this.tileSize + this.tileSize / 2;
      const py = offsetY + ty * this.tileSize + this.tileSize / 2;
      const container = this.add.container(px, py);
      const marker = this.add.rectangle(0, 0, 20, 20, 0x7c3aed).setOrigin(0.5);
      const pulse = this.add.rectangle(0, 0, 28, 28, 0x7c3aed, 0.3).setOrigin(0.5);
      container.add([pulse, marker]);
      this.tweens.add({ targets: pulse, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 1000, repeat: -1 });
      this.conflictEventPositions.push({ x: tx, y: ty, eventId: event.id });
      break;
    }
  }

  /** Trigger conflict event dialogue on approach */
  private triggerConflictEvent(eventId: string) {
    if (!this.expeditionRealm) return;
    const save = loadSave();
    const state: import('../../core/domainConflict').ConflictState = {
      favor: save.conflictFavor,
      completedEvents: save.conflictCompletedEvents,
      allegiance: save.conflictAllegiance,
    };
    const events = getEventsForRealm(this.expeditionRealm, state);
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    this.pendingConflictEvent = event;
    this.dialogueBox?.show(
      `⚔ ${event.title}\n\n${event.setup}\n\n[E] ${event.options[0]!.label}\n[Q] ${event.options[1]!.label}`,
      0,
    );
  }

  /** Resolve a conflict event with the chosen option */
  private resolveConflictEvent(optionIdx: 0 | 1) {
    const event = this.pendingConflictEvent;
    if (!event) return;
    const save = loadSave();
    const state: import('../../core/domainConflict').ConflictState = {
      favor: save.conflictFavor,
      completedEvents: save.conflictCompletedEvents,
      allegiance: save.conflictAllegiance,
    };
    const result = resolveConflict(event, optionIdx, state);
    save.conflictFavor = result.state.favor;
    save.conflictCompletedEvents = result.state.completedEvents;
    const chosenOption = event.options[optionIdx]!;
    this.showDialogue(
      `[${chosenOption.faction} 好感度 ${chosenOption.favorDelta > 0 ? '+' : ''}${chosenOption.favorDelta}]\n${result.result}` +
      (result.companionReact ? `\n\n${result.companionReact}` : '')
    );
    this.showFloatingText(`好感 +${chosenOption.favorDelta}`, '#c084fc');
    this.pendingConflictEvent = undefined;
    this.conflictTriggered = false;
    saveSave(save);
  }

  // ─── MORAL CHOICE NODES ────────────────────────────────

  private pendingMoralChoice?: import('../../core/moralChoices').MoralChoice;
  private moralChoiceTriggered = false;

  /** Spawn a moral choice encounter on the map */
  private spawnMoralChoice() {
    if (!this.expeditionRealm) return;
    const save = loadSave();
    const completedMoralIds = save.collectedEchoIds.filter(id => id.startsWith('moral_'));
    const bondLevel = this.companionBondLevel ?? 1;
    const choice = getMoralChoice(this.currentLayer, bondLevel, completedMoralIds);
    if (!choice) return;

    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    for (let attempt = 0; attempt < 50; attempt++) {
      const tx = Phaser.Math.Between(5, this.w - 5);
      const ty = Phaser.Math.Between(5, this.h - 5);
      if (this.tilemap[ty * this.w + tx] !== 0) continue;
      if (this.itemPlacements.some(p => Math.abs(p.tileX - tx) + Math.abs(p.tileY - ty) < 3)) continue;
      const px = offsetX + tx * this.tileSize + this.tileSize / 2;
      const py = offsetY + ty * this.tileSize + this.tileSize / 2;
      const container = this.add.container(px, py);
      const marker = this.add.rectangle(0, 0, 20, 20, 0xfbbf24).setOrigin(0.5); // Gold marker
      const pulse = this.add.rectangle(0, 0, 28, 28, 0xfbbf24, 0.3).setOrigin(0.5);
      container.add([pulse, marker]);
      this.tweens.add({ targets: pulse, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 1000, repeat: -1 });
      this.moralEventPositions.push({ x: tx, y: ty, choiceId: choice.id });
      break;
    }
  }

  /** Trigger moral choice dialogue on approach */
  private triggerMoralChoice(choiceId: string) {
    const save = loadSave();
    const completedIds = save.collectedEchoIds.filter(id => id.startsWith('moral_'));
    const bondLevel = this.companionBondLevel ?? 1;
    const choice = getMoralChoice(this.currentLayer, bondLevel, completedIds);
    if (!choice) return;
    this.pendingMoralChoice = choice;
    this.dialogueBox?.show(
      `⚖ ${choice.title}\n\n${choice.setup}\n\n[E] ${choice.options[0]!.label}\n[Q] ${choice.options[1]!.label}`,
      0,
    );
  }

  /** Resolve a moral choice */
  private resolveMoralChoice(optionIdx: 0 | 1) {
    const choice = this.pendingMoralChoice;
    if (!choice) return;
    const save = loadSave();
    const option = choice.options[optionIdx]!;
    const effects = option.effects;

    // Apply effects
    if (effects.fragments) {
      this.fragmentCount = Math.max(0, this.fragmentCount + effects.fragments);
    }
    if (effects.hpChange) {
      this.playerHp = Math.max(1, Math.min(this.maxHp, this.playerHp + effects.hpChange));
      this.hpText?.setText(this.getHpDisplay());
    }
    if (effects.bondXp) {
      this.companionBondXp = Math.max(0, (this.companionBondXp ?? 0) + effects.bondXp);
    }

    // Track moral choices for ending calculation (not in persistence yet)
    if (option.virtue) {
      const key = `moral_${choice.id}`;
      save.conflictFavor = save.conflictFavor ?? {};
      save.conflictFavor[`virtue_${option.virtue}`] = (save.conflictFavor[`virtue_${option.virtue}`] ?? 0) + 1;
      save.completedQuests = save.completedQuests ?? [];
      save.completedQuests.push(key);
    }

    this.showDialogue(`[${option.virtue}] ${option.outcomeText}`);
    this.showFloatingText(option.outcomeText.slice(0, 40), '#fbbf24');
    this.pendingMoralChoice = undefined;
    this.moralChoiceTriggered = false;
    saveSave(save);
  }

  // ─── COMPANION SYSTEM ────────────────────────────────────────

  private tryRecruitCompanion() {
    if (!this.expeditionRealm) return;
    const save = loadSave();
    const realmCompanion = COMPANIONS.find(c => c.realmId === this.expeditionRealm);
    if (!realmCompanion) return;
    // Check if already recruited
    if (save.collectedEchoIds.includes(`companion_${realmCompanion.id}`)) {
      this.activeCompanion = realmCompanion;
      this.companionBondXp = 0;
      this.companionBondLevel = 1;
      return;
    }
    // Recruit!
    this.activeCompanion = realmCompanion;
    this.companionBondXp = 0;
    this.companionBondLevel = 1;
    save.unlockedAbilities.push(`companion_${realmCompanion.id}`);
    saveSave(save);
    this.showFloatingText(`${realmCompanion.name} 加入了你的旅程！`, '#52b788');
    this.showDialogue(`${realmCompanion.name}: "${realmCompanion.personality}"`);
  }

  private spawnCompanionVisual() {
    if (!this.activeCompanion || !this.player) return;
    const c = this.activeCompanion;
    this.companionEntity = new CompanionEntity(
      this, this.player.x - 20, this.player.y - 20,
      c.color, c.name,
    );
  }

  private addBondXp(amount: number) {
    if (!this.activeCompanion) return;
    const oldLevel = this.companionBondLevel;
    this.companionBondXp += amount;
    const def = this.activeCompanion;
    const newLevel = getBondLevel(this.companionBondXp, def.bondXpThreshold);
    this.companionBondLevel = newLevel;
    if (newLevel > oldLevel) {
      this.showFloatingText(`${def.name} 羁绊 Lv.${newLevel}!`, '#c084fc');
      this.companionEntity?.showBubble(this, this.getBondUpLine(def.id, newLevel), 5000);
    }
  }

  private getBondUpLine(cid: CompanionId, level: number): string {
    const lines: Record<string, string[]> = {
      moss: ['你开始信任我了...', '森林的呼吸与你同步了。', '我们是真正的伙伴了。'],
      tide: ['你愿意听我讲述了吗？', '潮汐认同你了。', '我的记忆...是你的了。'],
      ember: ['我不会再让你受伤了。', '你的勇气唤醒了我的。', '一起面对一切。'],
    };
    const pool = lines[cid];
    if (!pool) return '羁绊加深了...';
    return pool[level - 2] ?? pool[pool.length - 1]!;
  }

  private triggerCompanionDialogue(trigger: CompanionLine['trigger']) {
    if (!this.activeCompanion || !this.companionEntity) return;
    const now = Date.now();
    if (now < this.companionBubbleCooldown) return;
    const possible = (COMPANION_DIALOGUES[this.activeCompanion.id] ?? [])
      .filter(d => d.trigger === trigger && d.bondRequired <= this.companionBondLevel
        && !this.companionDialoguesSeen.includes(d.text));
    if (possible.length === 0) return;
    const line = possible[Math.floor(Math.random() * possible.length)]!;
    this.companionDialoguesSeen.push(line.text);
    this.companionEntity.showBubble(this, line.text, 5000);
    this.companionBubbleCooldown = now + 8000;
    this.addBondXp(5);
  }

  // ─── STORY FRAGMENTS ─────────────────────────────────────────

  private spawnStoryFragments() {
    if (!this.isExpedition || !this.expeditionRealm) return;
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    // Find fragments for this realm
    const realmFragments = STORY_FRAGMENTS.filter(f => f.realmId === this.expeditionRealm);
    const save = loadSave();
    for (const frag of realmFragments) {
      if (save.collectedEchoIds.includes(`story_${frag.id}`)) continue;
      // Place on a random floor tile
      for (let attempt = 0; attempt < 20; attempt++) {
        const x = Phaser.Math.Between(4, this.w - 5);
        const y = Phaser.Math.Between(4, this.h - 5);
        if (this.tilemap[y * this.w + x] !== 0) continue;
        const px = offsetX + x * this.tileSize + this.tileSize / 2;
        const py = offsetY + y * this.tileSize + this.tileSize / 2;
        const icon = this.add.text(px, py, '?', { fontSize: '16px', color: '#fbbf24' }).setOrigin(0.5);
        const glow = this.add.rectangle(px, py, 20, 20, 0xfbbf24, 0.15).setOrigin(0.5);
        const container = this.add.container(px, py, [glow, icon]);
        this.tweens.add({ targets: container, scaleX: 1.1, scaleY: 1.1, duration: 1500, yoyo: true, repeat: -1 });
        this.storyFragmentEntities.push(container);
        break;
      }
    }
  }

  private collectStoryFragment(container: Phaser.GameObjects.Container, fragId: string) {
    const frag = STORY_FRAGMENTS.find(f => f.id === fragId);
    if (!frag) return;
    // Save as collected
    const save = loadSave();
    save.collectedEchoIds.push(`story_${fragId}`);
    saveSave(save);
    // Animate
    this.tweens.add({ targets: container, scaleX: 2, scaleY: 2, alpha: 0, duration: 300, onComplete: () => container.destroy() });
    // Show story
    this.showDialogue(`记忆碎片 — ${frag.title}\n"${frag.text}"`);
    this.addBondXp(15);
    // Companion reaction
    if (frag.companionHint && this.activeCompanion?.id === frag.companionHint) {
      this.time.delayedCall(2000, () => {
        this.triggerCompanionDialogue('find_fragment');
      });
    }
  }

  // ─── FOG OF WAR (RenderTexture + BitmapMask) ─────────────────

  private createFogOverlay() {
    // Determine vision radius based on active companion
    this.visionRadius = this.activeCompanion?.id === 'ember'
      ? this.BASE_VISION_RADIUS + 50
      : this.BASE_VISION_RADIUS;
    const visionSize = this.visionRadius * 2 + 40;
    const canvas = document.createElement('canvas');
    canvas.width = visionSize;
    canvas.height = visionSize;
    const ctx = canvas.getContext('2d')!;
    const cx = visionSize / 2;
    const cy = visionSize / 2;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.visionRadius);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');     // center: fully visible
    gradient.addColorStop(0.5, 'rgba(255,255,255,1)');   // inner: fully visible
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.6)');// edge start: fading
    gradient.addColorStop(0.9, 'rgba(255,255,255,0.15)');// edge: dim
    gradient.addColorStop(1, 'rgba(255,255,255,0)');     // outside: hidden
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, visionSize, visionSize);
    // Add to Phaser's texture manager
    if (this.textures.exists('vision_gradient')) {
      this.textures.remove('vision_gradient');
    }
    this.textures.addCanvas('vision_gradient', canvas);

    // 2. Create full-screen fog overlay (RenderTexture)
    this.fogOverlay = this.add.renderTexture(0, 0, 1280, 720);
    this.fogOverlay.setOrigin(0);
    this.fogOverlay.fill(0x050510, 0.95); // very dark blue-black
    this.fogOverlay.setDepth(1000); // on top of everything

    // 3. Create the vision mask image (NOT added to scene)
    this.visionMask = this.make.image({
      x: 640, y: 360, // will be moved to player position
      key: 'vision_gradient',
      add: false,
    });

    // 4. Apply BitmapMask to the fog overlay
    this.fogOverlay.mask = new Phaser.Display.Masks.BitmapMask(this, this.visionMask);
    this.fogOverlay.mask.invertAlpha = true;
    // invertAlpha = true: white in mask = show through (visible), black = hidden (fog stays)
  }

  private updateFogPosition() {
    if (!this.fogOverlay || !this.visionMask || !this.player) return;
    this.visionMask.x = this.player.x;
    this.visionMask.y = this.player.y;
  }

  // ─── QUEST GIVER ────────────────────────────────────────────

  private spawnQuestGiver(qg: QuestGiverDef) {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    // Place on a random floor tile, away from spawn
    for (let attempt = 0; attempt < 30; attempt++) {
      const x = Phaser.Math.Between(6, this.w - 7);
      const y = Phaser.Math.Between(6, this.h - 7);
      if (this.tilemap[y * this.w + x] !== 0) continue;
      const px = offsetX + x * this.tileSize + this.tileSize / 2;
      const py = offsetY + y * this.tileSize + this.tileSize / 2;
      // Gold-trimmed NPC
      const body = this.add.rectangle(0, 0, 16, 16, 0xffd700).setOrigin(0.5);
      const glow = this.add.rectangle(0, 0, 22, 22, 0xffd700, 0.2).setOrigin(0.5);
      const label = this.add.text(0, -14, '?', { fontSize: '10px', color: '#fff' }).setOrigin(0.5);
      const container = this.add.container(px, py, [glow, body, label]);
      container.setData('questGiver', true);
      this.tweens.add({ targets: glow, alpha: { from: 0.1, to: 0.3 }, duration: 1200, yoyo: true, repeat: -1 });
      this.questGiverEntity = container;
      this.questGiverPos = { x, y };
      // Clear a tile pad
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const tx = x + dx, ty = y + dy;
        if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h) this.tilemap[ty * this.w + tx] = 0;
      }
      break;
    }
  }

  private handleQuestGiver(qg: QuestGiverDef) {
    const save = loadSave();
    const favor = getFavor(qg.npcName);

    // Check if companion can be recruited
    if (favor >= (qg.favorThresholds[2] ?? 120) && !isCompanionRecruited(qg.companionId)) {
      recruitCompanion(qg.companionId);
      this.showDialogue(`${qg.npcName}: "${qg.recruitDialogue}"`);
      this.showFloatingText(`${COMPANIONS.find(c => c.id === qg.companionId)?.name} 成为了你的伙伴！`, '#52b788');
      // Spawn companion now
      this.activeCompanion = COMPANIONS.find(c => c.id === qg.companionId);
      this.companionBondXp = 0;
      this.companionBondLevel = 1;      this.spawnCompanionVisual();
      // Remove quest giver
      this.questGiverEntity?.destroy();
      this.questGiverEntity = undefined;
      this.questGiverPos = undefined;
      return;
    }

    // Show available quests and favor
    const completedIds = save.completedQuests;
    const availableQuests = qg.quests.filter(q => !completedIds.includes(q.id));
    const completedCount = qg.quests.length - availableQuests.length;
    const favorPct = Math.min(100, Math.floor((favor / (qg.favorThresholds[2] ?? 120)) * 100));

    let dialogue = `${qg.npcName}: "${qg.greeting}"\n好感度: ${favorPct}%  任务: ${completedCount}/${qg.quests.length}`;

    if (availableQuests.length > 0) {
      const next = availableQuests[0]!;
      dialogue += `\n\n当前任务: ${next.description}`;
      // Check if quest condition is met
      if (this.checkQuestCompletion(next)) {
        completeQuest(next.id, qg.npcName, next.rewardFavor);
        this.showDialogue(`${qg.npcName}: "${next.rewardDialogue}"\n好感度 +${next.rewardFavor}`);
        this.showFloatingText(`任务完成! +${next.rewardFavor}好感`, '#fbbf24');
        this.addBondXp(10);
        return;
      }
    } else {
      dialogue += '\n\n你已经完成了所有任务。继续探索加深羁绊吧。';
    }
    this.showDialogue(dialogue);
  }

  private checkQuestCompletion(quest: QuestDef): boolean {
    switch (quest.type) {
      case 'reach_layer':
        return this.currentLayer >= (quest.target as number) - 1;
      case 'collect_fragments':
        return this.fragmentCount >= (quest.target as number);
      case 'use_fusion':
        // Tracked via session-level flag set in handlePendingFusion,
        // since pendingFusedItem is cleared immediately after fusion.
        return this.registry.get('fusionUsedInSession') === true;
      case 'deliver_item': {
        const targetName = quest.target as string;
        const byId = new Map<string, Card>();
        for (const c of this.deck.itemCards) byId.set(c.id, c);
        for (const c of this.deck.physicsCards) byId.set(c.id, c);
        return this.inventory.some(id => byId.get(id)?.name === targetName);
      }
      default:
        return false;
    }
  }

  private spawnEchoFragments() {
    // Place 4-6 echo fragments on floor tiles
    const count = Phaser.Math.Between(4, 6);
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const x = Phaser.Math.Between(3, this.w - 4);
        const y = Phaser.Math.Between(3, this.h - 4);
        if (this.tilemap[y * this.w + x] !== 0) continue;
        const px = offsetX + x * this.tileSize + this.tileSize / 2;
        const py = offsetY + y * this.tileSize + this.tileSize / 2;
        const crystal = this.add.rectangle(px, py, 8, 12, 0xc084fc).setOrigin(0.5);
        this.tweens.add({
          targets: crystal, y: py - 3, duration: 800 + Math.random() * 400,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        this.fragmentEntities.push(crystal);
        break;
      }
    }
  }

  private collectFragment(fragment: Phaser.GameObjects.Rectangle) {
    this.fragmentCount++;
    playSFX(this, 'collect');
    spawnVFXBurst(this, 'collect', fragment.x, fragment.y, 6, { spread: 25 });
    this.tweens.add({
      targets: fragment, scaleX: 2, scaleY: 2, alpha: 0, duration: 200,
      onComplete: () => fragment.destroy(),
    });
    this.showFloatingText(`+1 echo fragment`, '#c084fc');
  }

  // ─── SHARED UTILITIES ────────────────────────────────────────────
  private generateMapAndEntities() {
    this.tilemap = runWFC(this.w, this.h, {
      seed: (Date.now() & 0xffff) ^ this.currentLayer,
      weights: biomeWeightsFor(this.currentWorld.id),
    });
    // Clear spawn area
    for (let y = 0; y < SPAWN_PAD; y++) {
      for (let x = 0; x < SPAWN_PAD; x++) this.tilemap[y * this.w + x] = 0;
    }
    // Place exit in bottom-right
    this.exitPos = { x: this.w - 3, y: this.h - 3 };
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const ex = this.exitPos.x + dx, ey = this.exitPos.y + dy;
        if (ex >= 0 && ex < this.w && ey >= 0 && ey < this.h) this.tilemap[ey * this.w + ex] = 0;
      }
    }
    // Spawn items, NPCs, altar
    this.itemPlacements = spawnItemsForLevel(this.tilemap, this.w, this.h,
      this.deck.itemCards.slice(0, 4).map(c => c.id), this.currentLayer + 1);
    this.npcPlacements = spawnNpcsForLevel(this.tilemap, this.w, this.h,
      this.deck.npcCards.slice(0, 2).map(c => c.id), this.currentLayer + 1, this.itemPlacements);
    const altar = placeFusionAltar(this.tilemap, this.w, this.h, this.currentLayer + 1);
    this.altarPos = { x: altar.tileX, y: altar.tileY };
    // Force pads
    const forcePad = (cx: number, cy: number) => {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
        this.tilemap[y * this.w + x] = 0;
      }
    };
    for (const p of this.itemPlacements) forcePad(p.tileX, p.tileY);
    for (const p of this.npcPlacements) forcePad(p.tileX, p.tileY);
    forcePad(this.altarPos.x, this.altarPos.y);
    // Draw map
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    this.drawTilemap(offsetX, offsetY);
    // Exit portal
    this.createExitPortal(offsetX, offsetY);
    // Spawn entity visuals
    this.createItemVisuals(offsetX, offsetY);
    this.createNpcVisuals(offsetX, offsetY);
    this.createAltarVisual(offsetX, offsetY);
  }

  /** Per-realm trap name lookup */
  private readonly TRAP_NAMES: Record<string, string> = {
    forest: '荆棘丛', ocean: '漩涡', dungeon: '尖刺', scifi: '能量场',
    desert: '流沙', tundra: '冰裂缝', jungle: '毒藤', crystal: '水晶刺',
    neon: '电击板', haunted: '亡灵之火', sky: '虚空裂隙',
  };

  /** Place 3-5 trap tiles (tile type 5) on the map for the current realm */
  private placeTrapsForRealm() {
    const realm = this.expeditionRealm ?? 'forest';
    const count = 3 + Math.min(this.currentLayer, 3); // 3-6 traps, more on deeper layers
    for (let i = 0; i < count; i++) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const x = Phaser.Math.Between(SPAWN_PAD + 2, this.w - 4);
        const y = Phaser.Math.Between(SPAWN_PAD + 2, this.h - 4);
        const idx = y * this.w + x;
        // Only place on floor tiles that are not near spawn or key entities
        if (this.tilemap[idx] !== 0) continue;
        this.tilemap[idx] = 5; // trap tile
        break;
      }
    }
  }

  private drawTilemap(offsetX: number, offsetY: number) {
    this.tileGraphics = [];
    const pal = this.currentWorld.palette;
    const hasTileSheet = this.textures.exists('tilesheet');
    const worldId = this.currentWorld.id;
    const colorMap: Record<number, number> = {
      0: parseInt(pal[2].replace('#', ''), 16),
      1: parseInt(pal[0].replace('#', ''), 16),
      2: parseInt(pal[1].replace('#', ''), 16),
      3: parseInt(pal[3].replace('#', ''), 16),
      4: parseInt(pal[4].replace('#', ''), 16),
      5: 0xcc3333, // Trap tiles — red tint
    };
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const t = this.tilemap[y * this.w + x]!;
        if (hasTileSheet) {
          const frameIdx = getTileFrame(worldId, t);
          const img = this.add.image(offsetX + x * this.tileSize + this.tileSize / 2, offsetY + y * this.tileSize + this.tileSize / 2, 'tilesheet', frameIdx);
          img.setOrigin(0.5);
          img.setDepth(1);
          this.tileGraphics.push(img as unknown as Phaser.GameObjects.Rectangle);
          // Red overlay for traps
          if (t === 5) {
            const overlay = this.add.rectangle(offsetX + x * this.tileSize, offsetY + y * this.tileSize, this.tileSize, this.tileSize, 0xff0000, 0.25).setOrigin(0);
            overlay.setDepth(2);
            this.tileGraphics.push(overlay);
          }
        } else {
          const color = colorMap[t] ?? 0x333333;
          const tile = this.add.rectangle(offsetX + x * this.tileSize, offsetY + y * this.tileSize, this.tileSize, this.tileSize, color).setOrigin(0);
          if (t === 5) tile.setStrokeStyle(1, 0xff0000, 0.4);
          this.tileGraphics.push(tile);
        }
      }
    }
  }

  private createExitPortal(offsetX: number, offsetY: number) {
    const exitPx = offsetX + this.exitPos.x * this.tileSize;
    const exitPy = offsetY + this.exitPos.y * this.tileSize;
    const ec = this.add.container(exitPx, exitPy);
    const bg = this.add.rectangle(0, 0, this.tileSize * 2, this.tileSize * 2, 0xffff00).setOrigin(0);
    const inner = this.add.rectangle(4, 4, this.tileSize * 2 - 8, this.tileSize * 2 - 8, 0x444400).setOrigin(0);
    const label = this.add.text(4, -18, this.isExpedition ? 'DEEPER' : 'EXIT', { fontSize: '12px', color: '#ff0' });
    ec.add([bg, inner, label]);
    this.exitEntity = ec;
    this.tweens.add({ targets: bg, alpha: { from: 0.6, to: 1 }, duration: 800, yoyo: true, repeat: -1 });
  }

  private createItemVisuals(offsetX: number, offsetY: number) {
    for (const p of this.itemPlacements) {
      const px = offsetX + p.tileX * this.tileSize + this.tileSize / 2;
      const py = offsetY + p.tileY * this.tileSize + this.tileSize / 2;
      const card = this.deck.itemCards.find(c => c.id === p.cardId);
      const c = this.add.container(px, py);
      const rect = safeAddSprite(this, 0, 0, SPRITE_KEYS.item, 14, 14, 0xff8800);
      if ('setStrokeStyle' in rect) (rect as Phaser.GameObjects.Rectangle).setStrokeStyle(1, 0xffffff);
      const label = this.add.text(0, 0, card?.name.slice(0, 4) ?? '?', { fontSize: '8px', color: '#fff' }).setOrigin(0.5);
      c.add([rect, label]);
      this.tweens.add({ targets: c, y: py - 2, duration: 600 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.itemEntities.set(p.cardId, c);
    }
  }

  private createNpcVisuals(offsetX: number, offsetY: number) {
    for (const p of this.npcPlacements) {
      const px = offsetX + p.tileX * this.tileSize + this.tileSize / 2;
      const py = offsetY + p.tileY * this.tileSize + this.tileSize / 2;
      const card = this.deck.npcCards.find(c => c.id === p.cardId);
      const c = this.add.container(px, py);
      const body = safeAddSprite(this, 0, 0, SPRITE_KEYS.npc, 16, 16, 0x66ffaa);
      const label = this.add.text(0, 0, '!', { fontSize: '12px', color: '#000' }).setOrigin(0.5);
      c.add([body, label]);
      c.setData('cardId', p.cardId);
      this.npcEntities.set(p.cardId, c);
    }
  }

  private createAltarVisual(offsetX: number, offsetY: number) {
    const px = offsetX + this.altarPos.x * this.tileSize + this.tileSize / 2;
    const py = offsetY + this.altarPos.y * this.tileSize + this.tileSize / 2;
    const ae = this.add.container(px, py);
    ae.setData('isAltar', true);
    ae.add(safeAddSprite(this, 0, 0, SPRITE_KEYS.altar, 18, 18, 0xff00ff));
    ae.add(this.add.text(0, 0, '*', { fontSize: '14px', color: '#fff' }).setOrigin(0.5));
  }

  private spawnPlayer(tileX: number, tileY: number) {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const px = offsetX + tileX * this.tileSize + this.tileSize / 2;
    const py = offsetY + tileY * this.tileSize + this.tileSize / 2;
    if (this.textures.exists('tilesheet')) {
      // Create walk animation if not yet created
      if (!this.anims.exists('player_walk')) {
        this.anims.create({
          key: 'player_walk',
          frames: [
            { key: 'tilesheet', frame: 675 },
            { key: 'tilesheet', frame: 676 },
            { key: 'tilesheet', frame: 677 },
            { key: 'tilesheet', frame: 678 },
          ],
          frameRate: 8,
          repeat: -1,
        });
      }
      const spr = this.add.sprite(px, py, 'tilesheet', 677);
      spr.setOrigin(0.5);
      spr.setScale(this.tileSize / 16);
      spr.play('player_walk');
      this.player = spr as unknown as Phaser.GameObjects.Rectangle;
      this.playerAnimPaused = false;
    } else {
      this.player = safeAddSprite(this, offsetX + tileX * this.tileSize, offsetY + tileY * this.tileSize,
        SPRITE_KEYS.player, 12, 12, 0x00ffff) as Phaser.GameObjects.Rectangle;
    }
    this.player.setDepth(10);
  }

  private setupInput() {
    this.keys = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.eKey = this.input.keyboard!.addKey('E');
    this.qKey = this.input.keyboard!.addKey('Q');
    this.spaceKey = this.input.keyboard!.addKey('SPACE');
    this.escKey = this.input.keyboard!.addKey('ESC');
    this.input.keyboard!.on('keydown-I', () => this.openInventory());
    this.escKey.on('down', () => this.openPause());
    this.eKey.on('down', () => this.handleE());
    this.qKey.on('down', () => this.handleQ());
    this.spaceKey.on('down', () => {
      if (this.isExpedition && isDashReady()) {
        // Glitch passive: dash cooldown reduced by 30%
        const hasGlitch = this.activeCompanion?.id === 'glitch';
        if (hasGlitch) {
          triggerDashWithCooldown(Math.round(DASH_COOLDOWN_MS * 0.7));
        } else {
          triggerDash();
        }
        this.showFloatingText('Dash!', '#4fc3f7');
        playSFX(this, 'dash');
        spawnVFX(this, 'dash', this.player.x, this.player.y, { depth: 11 });
      }
    });

    // Handle pending item from inventory on scene resume
    this.events.on('resume', () => {
      const useItemId = this.registry.get('pendingUseItem') as string | undefined;
      if (useItemId) {
        this.registry.remove('pendingUseItem');
        this.handleUseFromInventory(useItemId);
      }
      const updated = this.registry.get('inventoryUpdated') as string[] | undefined;
      if (updated) {
        this.inventory = updated;
        this.registry.remove('inventoryUpdated');
        this.refreshInventoryText();
      }
    });
  }

  private setupHUD() {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const label = this.isExpedition
      ? `Layer ${this.currentLayer + 1}/5  ${this.currentWorld.name}`
      : `Lv ${this.session.currentLevelIndex + 1}/${this.session.maxLevels}  ${this.currentWorld.name}`;
    this.hudText = this.add.text(offsetX + 8, offsetY + 6, label, { color: '#fff', fontSize: '13px' });
    this.add.text(offsetX + 8, offsetY + 20, this.currentWorld.ruleQuirk, { color: '#aaa', fontSize: '10px' });
    this.invText = this.add.text(offsetX + 8, offsetY + 34, 'INV: (empty)', { color: '#aaa', fontSize: '11px', wordWrap: { width: this.w * this.tileSize - 16 } });
    this.promptText = this.add.text(offsetX + this.w * this.tileSize / 2, offsetY + this.h * this.tileSize - 12, '[Esc] Pause', { fontSize: '12px', color: '#ff0' }).setOrigin(0.5, 1);

    // Fusion altar compass (right side of HUD)
    this.updateAltarCompass();
  }

  private altarCompassText?: Phaser.GameObjects.Text;
  private frameCount = 0;

  private updateAltarCompass() {
    if (!this.player || !this.altarPos) return;
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const altarPx = offsetX + this.altarPos.x * this.tileSize + this.tileSize / 2;
    const altarPy = offsetY + this.altarPos.y * this.tileSize + this.tileSize / 2;
    const dx = altarPx - this.player.x;
    const dy = altarPy - this.player.y;
    const dist = Math.floor(Math.sqrt(dx * dx + dy * dy) / this.tileSize);
    // Direction arrow
    let arrow = '';
    const angle = Math.atan2(dy, dx);
    if (angle > -Math.PI / 8 && angle <= Math.PI / 8) arrow = '→';
    else if (angle > Math.PI / 8 && angle <= 3 * Math.PI / 8) arrow = '↘';
    else if (angle > 3 * Math.PI / 8 && angle <= 5 * Math.PI / 8) arrow = '↓';
    else if (angle > 5 * Math.PI / 8 && angle <= 7 * Math.PI / 8) arrow = '↙';
    else if (angle < -7 * Math.PI / 8 || angle > 7 * Math.PI / 8) arrow = '←';
    else if (angle < -5 * Math.PI / 8 && angle >= -7 * Math.PI / 8) arrow = '↖';
    else if (angle < -3 * Math.PI / 8 && angle >= -5 * Math.PI / 8) arrow = '↑';
    else arrow = '↗';

    if (!this.altarCompassText) {
      this.altarCompassText = this.add.text(1250, 20, '', { fontSize: '12px', color: '#c084fc' }).setOrigin(1, 0);
    }
    this.altarCompassText.setText(`祭坛 ${arrow} ${dist}格`);
  }

  override update(_t: number, dt: number) {
    if (!this.player) return;
    updateDashCooldown(dt);

    if (this.isExpedition && this.dashCooldownIndicator) {
      this.dashCooldownIndicator.setText(this.getDashDisplay());
    }

    // Fog of war: move vision mask to player position
    if (this.isExpedition) {
      this.updateFogPosition();
    }

    // Update altar compass
    if (this.isExpedition) {
      this.updateAltarCompass();
    }

    // Tutorial step progression
    if (this.isTutorial) {
      const offsetX = (1280 - this.w * this.tileSize) / 2;
      const offsetY = (720 - this.h * this.tileSize) / 2;
      const px = this.player.x - offsetX;
      const py = this.player.y - offsetY;
      const pTileX = Math.floor(px / this.tileSize);
      const pTileY = Math.floor(py / this.tileSize);

      // Step 0: reach marker at (6, 2)
      if (this.tutorialStep === 0 && Math.abs(pTileX - 6) <= 2 && Math.abs(pTileY - 2) <= 2) {
        this.advanceTutorial();
      }
      // Step 1 is handled in handleE (pick item)
      // Step 2 is handled when inventory is used on water
      // Step 3 is handled in handleE (talk to NPC)
      // Step 4 is handled when entering fusion altar
    }

    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;

    const pTileX = Math.floor((this.player.x - offsetX) / this.tileSize);
    const pTileY = Math.floor((this.player.y - offsetY) / this.tileSize);
    const currentTile = (pTileY >= 0 && pTileY < this.h && pTileX >= 0 && pTileX < this.w)
      ? this.tilemap[pTileY * this.w + pTileX] : 0;
    const speedMod = currentTile === 2
      ? (this.activeCompanion?.id === 'tide' ? 0.85 : (this.activeCompanion?.id === 'zephyr' ? 1.0 : 0.45))
      : 1;

    const next = computeMove(
      { x: this.player.x - offsetX, y: this.player.y - offsetY },
      { up: this.keys.up.isDown || this.wasd.W!.isDown, down: this.keys.down.isDown || this.wasd.S!.isDown, left: this.keys.left.isDown || this.wasd.A!.isDown, right: this.keys.right.isDown || this.wasd.D!.isDown },
      dt / 1000, PLAYER_SPEED * speedMod,
    );
    if (canMoveTo(next.x, next.y, this.w, this.h, this.tilemap)) {
      this.player.x = offsetX + next.x;
      this.player.y = offsetY + next.y;
    }

    // Animation control — pause walk when not moving
    const isMoving = this.keys.up.isDown || this.keys.down.isDown || this.keys.left.isDown || this.keys.right.isDown
      || this.wasd.W?.isDown || this.wasd.S?.isDown || this.wasd.A?.isDown || this.wasd.D?.isDown;
    const isSprite = (this.player as any).play !== undefined;
    if (isSprite && this.textures.exists('tilesheet')) {
      if (isMoving && this.playerAnimPaused) {
        (this.player as any).resume ? (this.player as any).resume() : (this.player as any).play('player_walk');
        this.playerAnimPaused = false;
      } else if (!isMoving && !this.playerAnimPaused) {
        (this.player as any).pause ? (this.player as any).pause() : ((this.player as any).stop(), (this.player as any).setFrame(677));
        this.playerAnimPaused = true;
      }
      // Flip sprite based on horizontal movement
      if (this.keys.left.isDown || this.wasd.A?.isDown) (this.player as any).setFlipX(true);
      else if (this.keys.right.isDown || this.wasd.D?.isDown) (this.player as any).setFlipX(false);
    }

    // Trap damage check (expedition only, with cooldown)
    if (this.isExpedition && this.playerHp > 0) {
      const now = Date.now();
      if (now > this.trapCooldown && currentTile === 5) {
        this.takeDamage(1);
        const trapName = this.TRAP_NAMES[this.expeditionRealm ?? 'forest'] ?? '陷阱';
        this.showFloatingText(`${trapName}！ -1 HP`, '#ff5252');
        playSFX(this, 'damage');
        spawnVFX(this, 'damage', this.player.x, this.player.y, { depth: 11 });
        this.trapCooldown = now + 1200; // 1.2s cooldown between trap damage
        this.playerFlash();
      }
    }

    // Companion following
    if (this.isExpedition && this.companionEntity) {
      this.companionEntity.follow(this.player.x, this.player.y);
    }

    // Check fragment collection (expedition mode)
    if (this.isExpedition) {
      const playerCenterX = this.player.x;
      const playerCenterY = this.player.y;

      // Echo fragments
      for (const frag of this.fragmentEntities) {
        if (!frag.active) continue;
        const dx = playerCenterX - frag.x;
        const dy = playerCenterY - frag.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          this.collectFragment(frag as Phaser.GameObjects.Rectangle);
          this.addBondXp(10);
          break;
        }
      }

      // Story fragments
      const save = loadSave();
      for (const storyCont of this.storyFragmentEntities) {
        if (!storyCont.active) continue;
        const dx = playerCenterX - storyCont.x;
        const dy = playerCenterY - storyCont.y;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          const fragId = STORY_FRAGMENTS.find(f => {
            return !save.collectedEchoIds.includes(`story_${f.id}`) &&
              f.realmId === this.expeditionRealm;
          });
          if (fragId) this.collectStoryFragment(storyCont, fragId.id);
          break;
        }
      }
    }

    // Throttle heavy operations to every 6 frames (~100ms at 60fps)
    this.frameCount++;
    const tick = this.frameCount % 6 === 0;

    // Moss passive: highlight nearby items and fragments (throttled)
    if (tick && this.activeCompanion?.id === 'moss') {
      const glowRadius = 64;
      const px = this.player.x;
      const py = this.player.y;
      for (const [id, container] of this.itemEntities) {
        if (!container.active) continue;
        const dx = px - container.x;
        const dy = py - container.y;
        const shouldGlow = Math.sqrt(dx * dx + dy * dy) < glowRadius;
        const wasGlowing = this.itemGlowState.get(id) ?? false;
        if (shouldGlow !== wasGlowing) {
          container.setAlpha(shouldGlow ? 0.6 : 1);
          this.itemGlowState.set(id, shouldGlow);
        }
      }
    } else if (tick && this.activeCompanion?.id === 'spore') {
      // Spore passive: double item detection range (128px vs 64px)
      const glowRadius = 128;
      const px = this.player.x;
      const py = this.player.y;
      for (const [id, container] of this.itemEntities) {
        if (!container.active) continue;
        const dx = px - container.x;
        const dy = py - container.y;
        const shouldGlow = Math.sqrt(dx * dx + dy * dy) < glowRadius;
        const wasGlowing = this.itemGlowState.get(id) ?? false;
        if (shouldGlow !== wasGlowing) {
          container.setAlpha(shouldGlow ? 0.6 : 1);
          this.itemGlowState.set(id, shouldGlow);
        }
      }
    } else if (tick && !this.activeCompanion) {
      // No companion — reset all glows
      for (const [id, _glowing] of this.itemGlowState) {
        const container = this.itemEntities.get(id);
        if (container) container.setAlpha(1);
      }
      this.itemGlowState.clear();
    }

    // Mirage passive: highlight trap tiles within 4 tiles (64px)
    if (tick && this.activeCompanion?.id === 'mirage' && this.isExpedition) {
      const px = this.player.x - offsetX;
      const py = this.player.y - offsetY;
      const pTileX = Math.floor(px / this.tileSize);
      const pTileY = Math.floor(py / this.tileSize);
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const tx = pTileX + dx, ty = pTileY + dy;
        if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h && this.tilemap[ty * this.w + tx] === 5) {
          const idx = ty * this.w + tx;
          if (idx < this.tileGraphics.length && this.tileGraphics[idx]) {
            const g = this.tileGraphics[idx];
            this.tweens.add({ targets: g, alpha: 0.4, duration: 300, yoyo: true });
          }
        }
      }
    }

    // Frost passive: auto-freeze nearby water (every 30 frames)
    if (this.frameCount % 30 === 0 && this.activeCompanion?.id === 'frost' && this.isExpedition) {
      const px = this.player.x - offsetX;
      const py = this.player.y - offsetY;
      const pTileX = Math.floor(px / this.tileSize);
      const pTileY = Math.floor(py / this.tileSize);
      let frozen = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const tx = pTileX + dx, ty = pTileY + dy;
        if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h && this.tilemap[ty * this.w + tx] === 2) {
          this.tilemap[ty * this.w + tx] = 0;
          frozen++;
        }
      }
      if (frozen > 0) {
        this.redrawTiles();
        this.showFloatingText(`霜语冻结了 ${frozen} 格水面`, '#90e0ef');
      }
    }

    // Echo passive: auto-reveal traps within 5 tiles (every 60 frames)
    if (this.frameCount % 60 === 0 && this.activeCompanion?.id === 'echo' && this.isExpedition) {
      const px = this.player.x - offsetX;
      const py = this.player.y - offsetY;
      const pTileX = Math.floor(px / this.tileSize);
      const pTileY = Math.floor(py / this.tileSize);
      for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
        const tx = pTileX + dx, ty = pTileY + dy;
        if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h && this.tilemap[ty * this.w + tx] === 5) {
          const idx = ty * this.w + tx;
          if (idx < this.tileGraphics.length && this.tileGraphics[idx]) {
            const g = this.tileGraphics[idx];
            this.tweens.add({ targets: g, alpha: 0.5, duration: 200, yoyo: true, repeat: 2 });
          }
        }
      }
    }

    // Companion low HP reaction
    if (this.isExpedition && this.playerHp <= 1 && this.companionBubbleCooldown < Date.now()) {
      this.triggerCompanionDialogue('low_hp');
    }

    this.refreshProximityPrompt();

    // Update objective display every frame
    if (this.isExpedition && this.objectiveText) {
      this.objectiveText.setText(this.getObjectiveDisplay());
    }

    // Check exit
    if (reachedExitPixel(this.player.x - offsetX, this.player.y - offsetY, this.exitPos.x, this.exitPos.y, this.tileSize, 2, 2)) {
      if (this.isExpedition && !this.isExitAllowed()) {
        this.showObjectiveHint();
      } else {
        this.triggerCompanionDialogue('near_exit');
        this.handleExit();
      }
    }
  }

  private handleExit() {
    if (this.isExpedition) {
      const nextLayer = this.currentLayer + 1;
      if (nextLayer >= 5) {
        // Completed the realm!
        if (this.expeditionRealm) {
          addEcho(this.expeditionRealm);
          addFragments(this.fragmentCount);
        }
        this.showFloatingText(`Echo of ${this.currentWorld.name} acquired!`, '#c084fc');
        spawnVFXBurst(this, 'light', 640, 360, 12, { spread: 200, scale: 2, duration: 800, depth: 2000 });
        this.time.delayedCall(1500, () => {
          this.scene.start('EchoArchiveScene');
        });
      } else {
        // Go to next layer
        addFragments(this.fragmentCount);
        this.scene.start('GameScene', {
          isExpedition: true,
          realmId: this.expeditionRealm,
          realmPalette: this.currentWorld.palette,
          layer: nextLayer,
          contaminatorId: this.contaminatorId,
        } as ExpeditionData);
      }
    } else {
      // Legacy mode
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

    const pTileX = Math.floor(px / this.tileSize);
    const pTileY = Math.floor(py / this.tileSize);
    const isInWater = pTileX >= 0 && pTileX < this.w && pTileY >= 0 && pTileY < this.h && this.tilemap[pTileY * this.w + pTileX] === 2;

    // Quest giver proximity
    const qg = this.expeditionRealm ? getQuestGiverForRealm(this.expeditionRealm) : undefined;
    const nearQuester = qg && this.questGiverPos && !isCompanionRecruited(qg.companionId) &&
      Math.abs(pTileX - this.questGiverPos.x) <= 2 && Math.abs(pTileY - this.questGiverPos.y) <= 2;

    const nearItem = this.itemPlacements.find(p => itemInPickupRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearItem) {
      const card = this.deck.itemCards.find(c => c.id === nearItem.cardId);
      this.promptText.setText(`[E] Pick up: ${card?.name ?? 'item'}`);
      return;
    }
    const nearNpc = this.npcPlacements.find(p => npcInTalkRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearNpc) {
      const card = this.deck.npcCards.find(c => c.id === nearNpc.cardId);
      this.promptText.setText(`[E] Talk to ${card?.name ?? 'NPC'}`);
      return;
    }
    if (nearQuester && qg) {
      this.promptText.setText(`[E] Talk: ${qg.npcName} (quest)`);
      return;
    }
    // Conflict zone proximity
    const nearConflict = this.conflictEventPositions.find(c =>
      Math.abs(pTileX - c.x) <= 2 && Math.abs(pTileY - c.y) <= 2
    );
    if (nearConflict) {
      this.promptText.setText(`[E] Enter conflict zone`);
      if (!this.conflictTriggered) {
        this.conflictTriggered = true;
        this.triggerConflictEvent(nearConflict.eventId);
      }
      return;
    }
    // Moral choice zone proximity
    const nearMoral = this.moralEventPositions.find(m =>
      Math.abs(pTileX - m.x) <= 2 && Math.abs(pTileY - m.y) <= 2
    );
    if (nearMoral) {
      this.promptText.setText(`[E] Approach`);
      if (!this.moralChoiceTriggered) {
        this.moralChoiceTriggered = true;
        this.triggerMoralChoice(nearMoral.choiceId);
      }
      return;
    }
    if (altarInOpenRange(px, py, (this.altarPos.x + 0.5) * this.tileSize, (this.altarPos.y + 0.5) * this.tileSize)) {
      this.promptText.setText('[E] Open Fusion Altar');
      return;
    }
    const usableItem = this.findUsableItem(isInWater);
    if (usableItem && this.isTutorial) {
      this.promptText.setText(`[Q] Use: ${usableItem}`);
      return;
    }
    if (this.isExpedition) {
      this.promptText.setText('[Q] Echo Scan  [SPACE] Dash  [Esc] Pause');
      return;
    }
    if (isInWater) {
      this.promptText.setText('In water - moving slow');
      return;
    }
    if (this.isExpedition) {
      this.promptText.setText('[Q] Echo Scan  [SPACE] Dash  [Esc] Pause');
    } else {
      this.promptText.setText('[Esc] Pause');
    }
  }

  private findUsableItem(isInWater: boolean): string | null {
    const byId = new Map<string, Card>();
    for (const c of this.deck.itemCards) byId.set(c.id, c);
    for (const c of this.deck.physicsCards) byId.set(c.id, c);
    for (const invId of this.inventory) {
      const card = byId.get(invId);
      if (!card) continue;
      const effect = getItemEffect(card.name);
      if (!effect) continue;
      if (effect.requiresWater && !isInWater) continue;
      return card.name;
    }
    return null;
  }

  private handleE() {
    // Conflict event resolution
    if (this.pendingConflictEvent && this.dialogueBox?.isShowing()) {
      this.resolveConflictEvent(0);
      return;
    }
    // Moral choice resolution
    if (this.pendingMoralChoice && this.dialogueBox?.isShowing()) {
      this.resolveMoralChoice(0);
      return;
    }
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const px = this.player.x - offsetX;
    const py = this.player.y - offsetY;

    // Quest giver interaction
    const pTileX = Math.floor(px / this.tileSize);
    const pTileY = Math.floor(py / this.tileSize);
    const qg = this.expeditionRealm ? getQuestGiverForRealm(this.expeditionRealm) : undefined;
    const nearQuester = qg && this.questGiverPos && !isCompanionRecruited(qg.companionId) &&
      Math.abs(pTileX - this.questGiverPos.x) <= 2 && Math.abs(pTileY - this.questGiverPos.y) <= 2;
    if (nearQuester && qg) {
      this.handleQuestGiver(qg);
      return;
    }

    const nearItemIdx = this.itemPlacements.findIndex(p => itemInPickupRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearItemIdx >= 0) {
      const placement = this.itemPlacements[nearItemIdx]!;
      const result = addToInventory(this.inventory, placement.cardId);
      if (result.added) {
        this.inventory = result.inv;
        this.itemPlacements.splice(nearItemIdx, 1);
        const entity = this.itemEntities.get(placement.cardId);
        if (entity) {
          this.tweens.add({ targets: entity, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 200, onComplete: () => entity.destroy() });
          this.tweens.add({ targets: entity, x: this.player.x, y: this.player.y, duration: 150, ease: 'Quad.easeIn' });
        }
        this.itemEntities.delete(placement.cardId);
        const card = this.deck.itemCards.find(c => c.id === placement.cardId);
        gameBus.emit('card:picked-up', { cardId: placement.cardId });
        this.refreshInventoryText();
        this.showFloatingText(`+ ${card?.name ?? 'item'}`, '#4fc3f7');
        playSFX(this, 'pickup');
        // Tutorial: Step 1 complete (picked up item)
        if (this.isTutorial && this.tutorialStep === 1) {
          this.advanceTutorial();
        }
      } else { this.showFloatingText('Inventory full!', '#ff5252'); playSFX(this, 'error'); }
      return;
    }

    const nearNpc = this.npcPlacements.find(p => npcInTalkRange(px, py, (p.tileX + 0.5) * this.tileSize, (p.tileY + 0.5) * this.tileSize));
    if (nearNpc) {
      const card = this.deck.npcCards.find(c => c.id === nearNpc.cardId);
      if (!card) return;
      const role = card.name;
      const history = this.currentDialogueRole === role ? this.dialogueHistory : [];
      const itemNames = [...this.deck.itemCards.slice(0, 6).map(c => c.name), ...this.inventory.map(id => this.deck.itemCards.find(x => x.id === id)?.name ?? this.deck.physicsCards.find(x => x.id === id)?.name).filter(Boolean)] as string[];
      const line = pickDialogueLine(role, history, { worldId: this.currentWorld.id, itemNames });
      this.currentDialogueRole = role;
      this.dialogueHistory = recordLine(history, line);
      this.showDialogue(`${role}: ${line}`);
      gameBus.emit('npc:dialogue', { npcId: nearNpc.cardId, line });
      // Tutorial: Step 3 complete (talked to NPC)
      if (this.isTutorial && this.tutorialStep === 3) {
        this.advanceTutorial();
      }
      // Companion reacts to NPC talk
      this.triggerCompanionDialogue('talk_npc');
      this.addBondXp(5);
      return;
    }

    if (altarInOpenRange(px, py, (this.altarPos.x + 0.5) * this.tileSize, (this.altarPos.y + 0.5) * this.tileSize)) {
      this.openFusionAltar();
      // Tutorial: Step 4 complete (opened fusion altar)
      if (this.isTutorial && this.tutorialStep === 4) {
        this.advanceTutorial();
      }
      return;
    }
  }

  /**
   * Echo scan — Q key.
   * Emits a pulse wave that highlights nearby interactable entities.
   * In tutorial mode, falls back to auto-using the first usable item
   * for backward compatibility with the "use item on water" step.
   */
  private handleQ() {
    // Conflict event resolution (Option B via Q)
    if (this.pendingConflictEvent && this.dialogueBox?.isShowing()) {
      this.resolveConflictEvent(1);
      return;
    }
    // Moral choice resolution (Option B via Q)
    if (this.pendingMoralChoice && this.dialogueBox?.isShowing()) {
      this.resolveMoralChoice(1);
      return;
    }
    if (this.isTutorial) {
      // Tutorial mode: keep legacy auto-use behavior for step 2
      this.handleQTutorialUse();
      return;
    }
    this.echoScan();
  }

  /** Legacy auto-use for tutorial step 2 (freeze water) */
  private handleQTutorialUse() {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const px = this.player.x - offsetX;
    const py = this.player.y - offsetY;
    const pTileX = Math.floor(px / this.tileSize);
    const pTileY = Math.floor(py / this.tileSize);
    const isInWater = pTileX >= 0 && pTileX < this.w && pTileY >= 0 && pTileY < this.h && this.tilemap[pTileY * this.w + pTileX] === 2;
    const usableItem = this.findUsableItem(isInWater);
    if (!usableItem) return;
    const ctx: EffectContext = { tilemap: this.tilemap, w: this.w, h: this.h, playerTileX: pTileX, playerTileY: pTileY, ...(this.expeditionRealm ? { realmId: this.expeditionRealm } : {}) };
    const result = executeItemEffect(usableItem, ctx);
    if (result) {
      this.showFloatingText(result, '#64ffda');
      if (this.isTutorial && this.tutorialStep === 2) this.advanceTutorial();
      const byId = new Map<string, Card>();
      for (const c of this.deck.itemCards) byId.set(c.id, c);
      for (const c of this.deck.physicsCards) byId.set(c.id, c);
      const card = [...byId.entries()].find(([_, c]) => c.name === usableItem)?.[0];
      if (card) { const idx = this.inventory.indexOf(card); if (idx >= 0) { this.inventory.splice(idx, 1); this.refreshInventoryText(); } }
      this.redrawTiles();
    }
  }

  /**
   * Echo scan: emit an expanding pulse ring that highlights nearby entities.
   * Highlights: items on ground, echo fragments, NPCs, quest giver, fusion altar.
   */
  private echoScan() {
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const cx = this.player.x;
    const cy = this.player.y;
    const SCAN_RADIUS_TILES = 6;
    const SCAN_RADIUS_PX = SCAN_RADIUS_TILES * this.tileSize;

    // Build list of interactive positions
    type ScanTarget = { x: number; y: number; obj: Phaser.GameObjects.GameObject; name: string };
    const targets: ScanTarget[] = [];

    // Item entities on the ground
    for (const [id, container] of this.itemEntities) {
      targets.push({ x: container.x, y: container.y, obj: container, name: id });
    }
    // Echo fragments
    for (const fragCont of this.storyFragmentEntities) {
      targets.push({ x: fragCont.x, y: fragCont.y, obj: fragCont, name: 'fragment' });
    }
    // NPC entities
    for (const [id, container] of this.npcEntities) {
      targets.push({ x: container.x, y: container.y, obj: container, name: id });
    }
    // Quest giver
    if (this.questGiverEntity) {
      targets.push({ x: this.questGiverEntity.x, y: this.questGiverEntity.y, obj: this.questGiverEntity, name: 'questgiver' });
    }
    // Fusion altar
    const altarPx = offsetX + this.altarPos.x * this.tileSize + this.tileSize / 2;
    const altarPy = offsetY + this.altarPos.y * this.tileSize + this.tileSize / 2;
    const altarObj = this.children.list.find(c => {
      const cont = c as Phaser.GameObjects.Container;
      return cont.getData && cont.getData('isAltar') === true;
    });
    if (altarObj) {
      targets.push({ x: altarPx, y: altarPy, obj: altarObj as Phaser.GameObjects.GameObject, name: 'altar' });
    }

    // Flash those within range
    const withinRange = targets.filter(t => {
      const dx = t.x - cx;
      const dy = t.y - cy;
      return Math.hypot(dx, dy) <= SCAN_RADIUS_PX;
    });

    if (withinRange.length === 0) {
      this.showFloatingText('扫描范围内没有发现任何东西', '#9ca3af');
    } else {
      this.showFloatingText(`扫描到 ${withinRange.length} 个目标`, '#c084fc');
    }

    // Visual pulse ring — expanding circle
    const ring = this.add.graphics();
    ring.setDepth(1500); // above map, below fog

    let pulseRadius = 0;
    const pulseStep = SCAN_RADIUS_PX / 12; // 12 steps for smooth animation
    const pulseTimer = this.time.addEvent({
      delay: 50,
      repeat: 12,
      callback: () => {
        pulseRadius += pulseStep;
        ring.clear();
        ring.lineStyle(2, 0xc084fc, 0.8 - pulseRadius / SCAN_RADIUS_PX * 0.6);
        ring.strokeCircle(cx, cy, pulseRadius);
        // Also a lighter outer ring
        ring.lineStyle(1, 0x7c3aed, 0.4 - pulseRadius / SCAN_RADIUS_PX * 0.3);
        ring.strokeCircle(cx, cy, pulseRadius + 4);
      },
    });

    // Clean up ring after animation
    this.time.delayedCall(700, () => ring.destroy());

    // Highlight entities within range (pulse/flash for 1.5s)
    withinRange.forEach(t => {
      // Try to flash the container/entity
      const cont = t.obj as Phaser.GameObjects.Container;
      const children = cont.list ?? [];
      children.forEach(child => {
        if (child.type === 'Rectangle') {
          this.tweens.add({
            targets: child,
            alpha: { from: 1, to: 0.3 },
            fillColor: { from: 0xc084fc, to: (child as Phaser.GameObjects.Rectangle).fillColor },
            duration: 300,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
              (child as Phaser.GameObjects.Rectangle).setAlpha(1);
            },
          });
        }
      });
      // Also flash any text child
      children.forEach(child => {
        if (child.type === 'Text') {
          this.tweens.add({
            targets: child,
            alpha: { from: 1, to: 0.3 },
            duration: 300,
            yoyo: true,
            repeat: 4,
          });
        }
      });
    });
  }

  private redrawTiles() {
    // Destroy old tiles and re-draw
    for (const g of this.tileGraphics) { try { g.destroy(); } catch { /* skip */ } }
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    this.drawTilemap(offsetX, offsetY);
  }

  private refreshInventoryText() {
    if (this.inventory.length === 0) { this.invText.setText('INV: (empty)'); return; }
    const byId = new Map<string, Card>();
    for (const c of this.deck.itemCards) byId.set(c.id, c);
    for (const c of this.deck.physicsCards) byId.set(c.id, c);
    const names = this.inventory.map(id => byId.get(id)?.name ?? '?');
    const shown = names.length <= 4 ? names.join(', ') : `${names.slice(0, 3).join(', ')} +${names.length - 3} more`;
    this.invText.setText(`INV (${this.inventory.length}/${INVENTORY_MAX}): ${shown}`);
  }

  private showFloatingText(text: string, color: string = '#ff0') {
    const t = this.add.text(this.player.x, this.player.y - 20, text, { fontSize: '13px', color, fontStyle: 'bold' }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: this.player.y - 60, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  private showDialogue(text: string) {
    this.dialogueBox?.show(text, 8000);
  }

  /** Take damage and update display. Returns false if player died. */
  private takeDamage(amount: number): boolean {
    this.playerHp = Math.max(0, this.playerHp - amount);
    this.hpText?.setText(this.getHpDisplay());
    if (this.playerHp <= 0) {
      this.handlePlayerDeath();
      return false;
    }
    return true;
  }

  /** Flash the player red on damage */
  private playerFlash() {
    const origFill = (this.player as Phaser.GameObjects.Rectangle).fillColor;
    this.tweens.add({
      targets: this.player,
      fillColor: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => (this.player as Phaser.GameObjects.Rectangle).setFillStyle(origFill),
    });
  }

  /** Handle player death — restart the current layer */
  private handlePlayerDeath() {
    this.showFloatingText('力尽... 重新开始', '#ff5252');
    // Clear the kill tweens before restarting
    this.tweens.killTweensOf(this.player);
    this.player.setAlpha(1);
    this.time.delayedCall(1500, () => {
      if (this.isExpedition && this.expeditionRealm) {
        this.scene.restart({
          isExpedition: true,
          realmId: this.expeditionRealm,
          realmPalette: this.currentWorld.palette,
          layer: this.currentLayer,
          contaminatorId: this.contaminatorId,
        });
      }
    });
  }

  private openFusionAltar() {
    this.scene.launch('FusionAltarScene', { inventoryIds: this.inventory, deck: this.deck });
    this.scene.pause();
  }

  private openPause() {
    this.scene.launch('PauseScene');
    this.scene.pause();
  }

  private openInventory() {
    // Check for updated inventory from previous inventory scene
    const updated = this.registry.get('inventoryUpdated') as string[] | undefined;
    if (updated) {
      this.inventory = updated;
      this.registry.remove('inventoryUpdated');
    }
    // Check for pending item to use (from inventory scene)
    const useItemId = this.registry.get('pendingUseItem') as string | undefined;
    if (useItemId) {
      this.registry.remove('pendingUseItem');
      // Auto-use it via the Q key logic
      this.handleUseFromInventory(useItemId);
      return;
    }
    this.scene.launch('InventoryScene', { inventoryIds: this.inventory, deck: this.deck });
    this.scene.pause();
  }

  private handleUseFromInventory(itemId: string) {
    const allCards = [...this.deck.itemCards, ...this.deck.physicsCards];
    const card = allCards.find(c => c.id === itemId);
    if (!card) return;
    const offsetX = (1280 - this.w * this.tileSize) / 2;
    const offsetY = (720 - this.h * this.tileSize) / 2;
    const px = this.player.x - offsetX;
    const py = this.player.y - offsetY;
    const pTileX = Math.floor(px / this.tileSize);
    const pTileY = Math.floor(py / this.tileSize);
    const isInWater = pTileX >= 0 && pTileX < this.w && pTileY >= 0 && pTileY < this.h
      && this.tilemap[pTileY * this.w + pTileX] === 2;
    const effect = getItemEffect(card.name);
    if (!effect) { this.showFloatingText(`${card.name} 现在无法使用`, '#ff5252'); return; }
    if (effect.requiresWater && !isInWater) { this.showFloatingText('需要在水中使用', '#ff5252'); return; }
    const ctx: EffectContext = { tilemap: this.tilemap, w: this.w, h: this.h, playerTileX: pTileX, playerTileY: pTileY, ...(this.expeditionRealm ? { realmId: this.expeditionRealm } : {}) };
    const result = executeItemEffect(card.name, ctx);
    if (result) {
      this.showFloatingText(result, '#64ffda');
      // Tutorial: Step 2 also completes when using item from inventory
      if (this.isTutorial && this.tutorialStep === 2) {
        this.advanceTutorial();
      }
      this.inventory = removeFromInventory(this.inventory, itemId);
      this.refreshInventoryText();
      this.redrawTiles();
    }
  }

  private handlePendingFusion() {
    const pending = this.registry.get('pendingFusedItem') as { id: string; name: string } | null;
    if (pending) {
      this.registry.remove('pendingFusedItem');
      // Mark fusion as used this session (for quest checking)
      this.registry.set('fusionUsedInSession', true);
      const result = addToInventory(this.inventory, pending.id);
      this.inventory = result.inv;
      this.refreshInventoryText();
      this.showFloatingText(`+ ${pending.name}`, '#ffd54f');
      playSFX(this, 'fusion');
      this.tweens.add({ targets: this.player, fillColor: 0xffd54f, duration: 200, yoyo: true, repeat: 2 });
      // Companion reacts to fusion
      this.triggerCompanionDialogue('fusion');
      this.addBondXp(15);
    }
  }
}
