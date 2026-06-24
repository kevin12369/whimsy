import type { WorldId } from '../procgen/themeWorlds';

const TABLE: Record<string, string[]> = {
  'druid vendor': [
    'Moss speaks, if you let it.',
    'These leaves? They remember your footsteps.',
    'Trade you a fern for a memory.',
  ],
  'cosmic pickle vendor': [
    'The brine runs thin near the eastern gate.',
    'Time pickles everything, friend.',
    'I left a ferment orb in \'98. Or was it \'99?',
  ],
  'torch vendor': [
    'Light is a kind of memory.',
    "Don't burn the parchment.",
    'Fire is just fast oxidation.',
  ],
  'parts vendor': [
    'Specs say one thing, dust says another.',
    'Spare capacitor? Possibly.',
    'Read the schematic, then ignore half of it.',
  ],
  'caravan trader': [
    'Salt stories are the best stories.',
    'The road is a slow conversation.',
    'I have three of those. Pick the dusty one.',
  ],
};

const FALLBACK = ['The world is full of small wonders.', 'Hmm.', '...'];

// World-specific flavour lines
const WORLD_LINES: Partial<Record<WorldId, string[]>> = {
  forest: ['The trees are watching you.', 'A wild fern quivers as you pass.'],
  ocean: ['The tide whispers your name.', 'Brine crusts on everything here.'],
  dungeon: ['The walls breathe. Softly.', 'A torch sputters in the distance.'],
  scifi: ['A quiet hum fills the air.', 'Sensors flicker. You are detected.'],
  desert: ['Sand shifts beneath your feet.', 'Heat shimmers on the horizon.'],
  tundra: ['Your breath freezes mid-air.', 'The snow crunches like glass.'],
  jungle: ['Vines pulse with slow life.', 'Something rustles above you.'],
  crystal: ['Light bends in strange ways.', 'You hear a faint harmonic hum.'],
  neon: ['Neon reflections pool on wet pavement.', 'The city hums at 60hz.'],
  haunted: ['Shadows move when you are not looking.', 'A cold breath on your neck.'],
  sky: ['Clouds drift through the floor.', 'The wind carries distant voices.'],
};

export function getDialogue(role: string, lineIndex: number = 0, worldId?: string): string {
  const pool = TABLE[role] ?? FALLBACK;
  const base = pool[lineIndex % pool.length]!;
  return base;
}

/** Returns a world-flavour line that can be mixed into dialogue. */
export function getWorldFlavour(worldId?: string): string {
  if (!worldId) return '';
  const lines = WORLD_LINES[worldId as WorldId];
  if (!lines || lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)]!;
}

/**
 * Generates a fusion-hint dialogue line based on items in the current deck.
 * Returns a hint like: 'I heard brine and vine make something special.'
 */
export function getFusionHint(itemNames: string[]): string {
  // Known fusion pairs: brute-force check item names against the fusion table
  const pairs: Array<[string, string]> = [
    ['brine comet', 'vine whip'],
    ['cyan blade', 'violet blade'],
    ['pickled star', 'ferment orb'],
    ['dill drone', 'rose potion'],
    ['ember shard', 'tide coin'],
    ['moss pebble', 'glass fang'],
    ['rune fragment', 'lantern wisp'],
    ['brine pearl', 'saltspun coin'],
    ['charcoal twig', 'amber bead'],
    ['fern chip', 'prism chip'],
    ['echo shard', 'wax bell'],
    ['sour drop', 'glass mote'],
    ['ash flake', 'sun coin'],
    ['spore sac', 'frost splinter'],
    ['gloam thread', 'marrow bead'],
    ['vine whip', 'rose potion'],
  ];

  // Find pairs where at least one item is in the player's inventory or current deck
  const itemSet = new Set(itemNames);
  const hintable = pairs.filter(([a, b]) => itemSet.has(a) || itemSet.has(b));

  if (hintable.length === 0) return '';

  const [a, b] = hintable[Math.floor(Math.random() * hintable.length)]!;
  const templates = [
    `I heard ${a} and ${b} make something special...`,
    `Have you tried ${a} with ${b} at the altar?`,
    `There's a rumour about ${a} and ${b}...`,
    `${a} and ${b} — the old texts mention them together.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)]!;
}
