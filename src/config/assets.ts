// Centralized asset registry for Phase 1.6+. Phaser loads sprites by
// the keys defined in SPRITE_KEYS, each backed by a file in
// public/sprites/. The mapping here is the single source of truth;
// GameScene and CardHandView read SPRITE_KEYS.player etc. directly.

export const SPRITE_KEYS = {
  // Entities
  player: 'player',
  npc: 'npc',
  item: 'item',
  altar: 'altar',
  exit: 'exit',

  // Hand cards (one per physics preset)
  hand_moon_bounce:   'hand_moon_bounce',
  hand_heavy_brine:   'hand_heavy_brine',
  hand_icy_ground:    'hand_icy_ground',
  hand_sticky_vine:   'hand_sticky_vine',
  hand_gentle_drift:  'hand_gentle_drift',
  hand_earth_pull:    'hand_earth_pull',
  hand_feather_fall:  'hand_feather_fall',
  hand_mud_walk:      'hand_mud_walk',
} as const;

export type SpriteKey = typeof SPRITE_KEYS[keyof typeof SPRITE_KEYS];

// Manifest of source packs. sha256 is filled in by
// scripts/download-assets.mjs after first run; starts as PENDING.
export interface AssetEntry {
  id: string;
  url: string;
  license: string;
  attribution?: string;
  sha256: string;
  path: string;
  bytes: number;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  { id: 'kenney-toonchars', url: 'https://kenney.nl/media/pages/assets/toon-characters-1/Toon_Characters_1.zip',
    license: 'CC0', attribution: 'Kenney Vleugels (kenney.nl)',
    sha256: 'PENDING', path: 'sprites/toon-characters-1/', bytes: 0 },
  { id: 'kenney-tinytown', url: 'https://kenney.nl/media/pages/assets/tiny-town/Tiny_Town.zip',
    license: 'CC0', attribution: 'Kenney Vleugels (kenney.nl)',
    sha256: 'PENDING', path: 'sprites/tiny-town/', bytes: 0 },
  { id: 'kenney-ui', url: 'https://kenney.nl/media/pages/assets/ui-pack/UI_Pack.zip',
    license: 'CC0', attribution: 'Kenney Vleugels (kenney.nl)',
    sha256: 'PENDING', path: 'sprites/ui-pack/', bytes: 0 },
  { id: 'phaser-examples', url: 'https://github.com/phaserjs/examples/tree/master/public/assets',
    license: 'MIT', sha256: 'PENDING', path: 'sprites/phaser-examples/', bytes: 0 },
];
