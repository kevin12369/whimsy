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
};

const FALLBACK = ["The world is full of small wonders.", "Hmm.", "..."];

export function getDialogue(role: string, lineIndex: number = 0): string {
  const pool = TABLE[role] ?? FALLBACK;
  return pool[lineIndex % pool.length]!;
}