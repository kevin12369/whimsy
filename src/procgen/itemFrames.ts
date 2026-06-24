/**
 * Item name → Kenney Roguelike spritesheet frame mapping.
 * Each item name maps to a specific 16x16 tile frame in the tilesheet.
 * Frames selected from the item/prop region (rows 6-12, ~frames 336-671).
 * If a tile doesn't look right, adjust the frame index.
 */

export const ITEM_FRAMES: Record<string, number> = {
  // Fire items → reddish/orange frames (row 6, col 38-42)
  'ember shard': 380,
  'ash flake': 376,

  // Ice items → blue/cyan frames (row 6, col 43-47)
  'brine comet': 383,
  'frost splinter': 381,
  'tide coin': 366,

  // Light items → yellow/white frames (row 7, col 2-6)
  'lantern wisp': 394,
  'sun coin': 396,
  'pickled star': 398,

  // Cutting items → blade/weapon frames (row 8, col 0-6)
  'cyan blade': 448,
  'vine whip': 453,
  'glass fang': 454,

  // Healing items → pink/red frames (row 8, col 15-17)
  'rose potion': 463,
  'dill drone': 465,

  // Detection items → purple/blue frames (row 8, col 22-28)
  'amber bead': 470,
  'rune fragment': 474,
  'echo shard': 476,

  // Disruption items → dark/purple frames (row 8, col 53-55)
  'ferment orb': 501,
  'sour drop': 502,
  'gloam thread': 503,

  // Material items → item/prop frames (row 9, various)
  'moss pebble': 506,
  'brine pearl': 507,
  'saltspun coin': 508,
  'fern chip': 532,
  'prism chip': 533,
  'wax bell': 520,
  'marrow bead': 523,
  'glass mote': 464,
  'spore sac': 457,
  'charcoal twig': 452,
  'lantern wisp_frame': 395,
};

/**
 * Get the spritesheet frame for an item by name.
 * Returns undefined if no mapping exists.
 */
export function getItemFrame(itemName: string): number | undefined {
  return ITEM_FRAMES[itemName.toLowerCase()];
}
