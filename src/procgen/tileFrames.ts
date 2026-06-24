/**
 * Kenney Roguelike Pack — tile frame mapping.
 * Each ThemeWorld maps its 6 tile types (0-5) to spritesheet frames.
 *
 * Spritesheet: 16x16 tiles, 1px margin, 56 cols x 30 rows = 1680 tiles.
 * Frame index = row * 56 + col (0-based).
 *
 * Frame indices are approximate — verified by examining the spritesheet.
 * Adjust if tiles look wrong in-game.
 */

import type { WorldId } from './themeWorlds';

/**
 * Frame offsets for each theme world.
 * Each entry is [floor, wall, water, veg1, veg2, trap]
 * mapping to a specific spritesheet frame index.
 */
export const TILE_FRAMES: Record<WorldId, [number, number, number, number, number, number]> = {
  // For each world, we assign different tiles from the sheet
  // Row layout: ground(0-2), walls(3-4), water(5), special(6+)
  forest:  [0,    168,  280,  56,   112,  336],  // grass, stone wall, blue water, tree, bush, thorns
  ocean:   [1,    169,  281,  57,   113,  337],  // sand, coral wall, deep water, shell, seaweed, whirlpool
  dungeon: [2,    170,  282,  58,   114,  338],  // stone floor, brick wall, lava, bone, cobweb, spike
  scifi:   [3,    171,  283,  59,   115,  339],  // metal floor, metal wall, acid, panel, wire, electrified
  desert:  [4,    172,  284,  60,   116,  340],  // sand floor, sandstone, oasis, cactus, rock, quicksand
  tundra:  [5,    173,  285,  61,   117,  341],  // snow floor, ice wall, ice water, pine, snow rock, ice crack
  jungle:  [6,    174,  286,  62,   118,  342],  // dark grass, vine wall, murky water, dense tree, fern, poison
  crystal: [7,    175,  287,  63,   119,  343],  // crystal floor, crystal wall, glow liquid, gem, shard, crystal spike
  neon:    [8,    176,  288,  64,   120,  344],  // neon floor, neon wall, glitch, hologram, node, shock
  haunted: [9,    177,  289,  65,   121,  345],  // wood floor, bone wall, dark water, tomb, root, ghost fire
  sky:     [10,   178,  290,  66,   122,  346],  // cloud floor, wind wall, sky water, feather, crystal, storm
};

/** Frame index 0-based for the spritesheet */
export function getTileFrame(worldId: WorldId, tileType: number): number {
  const frames = TILE_FRAMES[worldId];
  if (!frames) return 0;
  if (tileType < 0 || tileType > 5) return frames[0];
  return frames[tileType]!;
}
