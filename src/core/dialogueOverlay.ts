import type { WorldId } from '../procgen/themeWorlds';

const TABLE: Record<string, string[]> = {
  'druid vendor': [
    "Moss speaks, if you let it.",
    "These leaves? They remember your footsteps.",
    "Trade you a fern for a memory.",
  ],
  'cosmic pickle vendor': [
    "The brine runs thin near the eastern gate.",
    "Time pickles everything, friend.",
    "I left a ferment orb in '98. Or was it '99?",
  ],
  'torch vendor': [
    "Light is a kind of memory.",
    "Don't burn the parchment.",
    "Fire is just fast oxidation.",
  ],
  'parts vendor': [
    "Specs say one thing, dust says another.",
    "Spare capacitor? Possibly.",
    "Read the schematic, then ignore half of it.",
  ],
  'caravan trader': [
    "Salt stories are the best stories.",
    "The road is a slow conversation.",
    "I have three of those. Pick the dusty one.",
  ],
  'frost cartographer': [
    "The map remembers the snow.",
    "Cold preserves what warmth forgets.",
    "Every path here was walked by silence.",
  ],
  'jungle scout': [
    "The canopy watches. So do I.",
    "River says yes; the path says maybe.",
    "Stay low and the vines won't ask.",
  ],
  'gem cutter': [
    "Edges tell the truth about the stone.",
    "Color is just light on holiday.",
    "One clean cut, two clean thoughts.",
  ],
  'arcade vendor': [
    "Insert coin, get wisdom, repeat.",
    "High score is a state of mind.",
    "The cabinet knows your name.",
  ],
  'ghost vendor': [
    "I used to sell bread. Now I just float.",
    "Regret is heavy. Carry less.",
    "Doors remember who opened them.",
  ],
  'cloud cartographer': [
    "The map keeps rewriting itself.",
    "Edges are just slow middles.",
    "Wind is how the sky thinks out loud.",
  ],
};

const FALLBACK = ["The world is full of small wonders.", "Hmm.", "...", "Yes, well.", "Another day."];

// World-specific flavour lines
const WORLD_FLAVOUR: Partial<Record<WorldId, string[]>> = {
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

// Known fusion pairs for NPC hints
const FUSION_PAIRS: Array<[string, string]> = [
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

const HINT_TEMPLATES = [
  "I heard {a} and {b} make something special...",
  "Have you tried {a} with {b} at the altar?",
  "There's a rumour about {a} and {b}...",
  "{a} and {b} — the old texts mention them together.",
  "If you find {a} and {b}, don't just keep them separate.",
];

const HISTORY_CAP = 10;

export function pickDialogueLine(
  role: string,
  history: string[],
  options?: { worldId?: string; itemNames?: string[] },
): string {
  const pool = TABLE[role] ?? FALLBACK;
  const seen = new Set(history);
  const unseen = pool.filter(line => !seen.has(line));

  // 1: Prefer an unseen base line
  if (unseen.length > 0) {
    const idx = history.length % unseen.length;
    return unseen[idx]!;
  }

  // 2: Sometimes give a world-flavour line
  if (options?.worldId && Math.random() < 0.4) {
    const lines = WORLD_FLAVOUR[options.worldId as WorldId];
    if (lines && lines.length > 0) {
      return lines[Math.floor(Math.random() * lines.length)]!;
    }
  }

  // 3: Sometimes give a fusion hint
  if (options?.itemNames && options.itemNames.length > 0 && Math.random() < 0.5) {
    const itemSet = new Set(options.itemNames);
    const hintable = FUSION_PAIRS.filter(([a, b]) => itemSet.has(a) || itemSet.has(b));
    if (hintable.length > 0) {
      const [a, b] = hintable[Math.floor(Math.random() * hintable.length)]!;
      const template = HINT_TEMPLATES[Math.floor(Math.random() * HINT_TEMPLATES.length)]!;
      return template.replace('{a}', a).replace('{b}', b);
    }
  }

  // 4: Fallback to cycled pool
  const offset = history.length;
  return pool[offset % pool.length]!;
}

export function recordLine(history: string[], line: string): string[] {
  const next = [...history, line];
  if (next.length > HISTORY_CAP) {
    return next.slice(next.length - HISTORY_CAP);
  }
  return next;
}
