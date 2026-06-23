import Phaser from 'phaser';
import type { Card } from '../core/cardSystem';
import { SPRITE_KEYS } from '../config/assets';
import { safeAddSprite } from '../core/assetLoader';

// Map physics card note -> SPRITE_KEYS hand_* key.
// Phase 1.5 buildPhysicsCards uses these exact note strings.
const NOTE_TO_HAND_KEY: Record<string, string> = {
  'moon bounce': SPRITE_KEYS.hand_moon_bounce,
  'heavy brine': SPRITE_KEYS.hand_heavy_brine,
  'icy ground': SPRITE_KEYS.hand_icy_ground,
  'sticky vine': SPRITE_KEYS.hand_sticky_vine,
  'gentle drift': SPRITE_KEYS.hand_gentle_drift,
  'earth pull': SPRITE_KEYS.hand_earth_pull,
  'feather fall': SPRITE_KEYS.hand_feather_fall,
  'mud walk': SPRITE_KEYS.hand_mud_walk,
};

function handKeyFor(card: Card): string {
  const note = card.physicsPayload?.note;
  if (note && NOTE_TO_HAND_KEY[note]) return NOTE_TO_HAND_KEY[note]!;
  // Fallback: deterministic key from the card id so the rectangle
  // color is at least stable across reloads.
  return `unknown_${card.id}`;
}

const FALLBACK_COLORS = [0x222244, 0x442222, 0x224422, 0x444422, 0x442244, 0x224444, 0x333344, 0x443333];

function fallbackColorFor(card: Card, idx: number): number {
  let hash = 0;
  for (const ch of card.id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return FALLBACK_COLORS[Math.abs(hash + idx) % FALLBACK_COLORS.length]!;
}

export function renderHand(scene: Phaser.Scene, hand: Card[]): Phaser.GameObjects.Container {
  const c = scene.add.container(0, scene.scale.height - 80);
  hand.slice(0, 8).forEach((card, i) => {
    const handKey = handKeyFor(card);
    const rect = safeAddSprite(scene, 80 + i * 100, 0, handKey, 80, 60, fallbackColorFor(card, i));
    if ('setStrokeStyle' in rect && typeof (rect as { setStrokeStyle?: unknown }).setStrokeStyle === 'function') {
      (rect as Phaser.GameObjects.Rectangle).setStrokeStyle(1, 0xaaaaff);
    }
    rect.setInteractive({ useHandCursor: true, draggable: true });
    rect.setData('cardId', card.id);
    rect.setData('cardName', card.name);
    const label = scene.add.text(80 + i * 100, 0, card.name, {
      fontSize: '11px', color: '#fff',
    }).setOrigin(0.5);
    rect.on('pointerdown', () => {
      if ('setFillStyle' in rect) (rect as Phaser.GameObjects.Rectangle).setFillStyle(0x4444aa);
    });
    rect.on('pointerup', () => {
      if ('setFillStyle' in rect) (rect as Phaser.GameObjects.Rectangle).setFillStyle(0x222244);
      scene.game.events.emit('card:played-physics', { cardId: card.id });
    });
    rect.on('pointerout', () => {
      if ('setFillStyle' in rect) (rect as Phaser.GameObjects.Rectangle).setFillStyle(0x222244);
    });
    c.add([rect, label]);
  });
  return c;
}
