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

const HISTORY_CAP = 10;

export function pickDialogueLine(role: string, history: string[]): string {
  const pool = TABLE[role] ?? FALLBACK;
  const seen = new Set(history);
  const unseen = pool.filter(line => !seen.has(line));
  const candidates = unseen.length > 0 ? unseen : pool;
  const offset = history.length;
  return candidates[offset % candidates.length]!;
}

export function recordLine(history: string[], line: string): string[] {
  const next = [...history, line];
  if (next.length > HISTORY_CAP) {
    return next.slice(next.length - HISTORY_CAP);
  }
  return next;
}
