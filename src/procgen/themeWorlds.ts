export type WorldId = 'forest' | 'ocean' | 'dungeon' | 'scifi' | 'desert'
  | 'tundra' | 'jungle' | 'crystal' | 'neon' | 'haunted' | 'sky';

export type Tile = 0 | 1 | 2 | 3 | 4;

export interface ThemeWorld {
  id: WorldId;
  name: string;
  palette: [string, string, string, string, string];
  ruleQuirk: string;
  npcRoles: Array<{ role: string; personality: string }>;
}

export const THEME_WORLDS: ThemeWorld[] = [
  { id: 'forest', name: 'Forest', palette: ['#1b4332', '#2d6a4f', '#52b788', '#95d5b2', '#d8f3dc'],
    ruleQuirk: 'trees lean toward the player',
    npcRoles: [
      { role: 'druid vendor', personality: 'rambles about moss, friendly' },
      { role: 'wandering ranger', personality: 'speaks in questions' },
      { role: 'moss keeper', personality: 'terse, protective of greenery' },
    ] },
  { id: 'ocean', name: 'Ocean', palette: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
    ruleQuirk: 'liquids flow upward',
    npcRoles: [
      { role: 'cosmic pickle vendor', personality: 'rambles about brine, friendly' },
      { role: 'brine sage', personality: 'speaks in questions, philosophical' },
      { role: 'tide watcher', personality: 'cautious, weather-aware' },
    ] },
  { id: 'dungeon', name: 'Dungeon', palette: ['#1a1a1d', '#3b1c32', '#a64942', '#ff9b54', '#fff7e1'],
    ruleQuirk: 'torches flicker with intent',
    npcRoles: [
      { role: 'torch vendor', personality: 'cheerful, fire-phobic' },
      { role: 'rune sage', personality: 'cryptic, slow' },
      { role: 'gate keeper', personality: 'terse, riddling' },
    ] },
  { id: 'scifi', name: 'Sci-Fi', palette: ['#0b132b', '#1c2541', '#3a506b', '#5bc0be', '#6fffe9'],
    ruleQuirk: 'gravity is a suggestion',
    npcRoles: [
      { role: 'parts vendor', personality: 'mechanical, helpful' },
      { role: 'station AI', personality: 'literal, polite' },
      { role: 'drone tech', personality: 'terse, diagnostic' },
    ] },
  { id: 'desert', name: 'Desert', palette: ['#7f4f24', '#b08968', '#ddb892', '#ede0d4', '#fefae0'],
    ruleQuirk: 'sand remembers footsteps',
    npcRoles: [
      { role: 'caravan trader', personality: 'hospitable, story-rich' },
      { role: 'sand sage', personality: 'cryptic, calm' },
      { role: 'well keeper', personality: 'terse, generous' },
    ] },
  { id: 'tundra', name: 'Tundra', palette: ['#caf0f8', '#ade8f4', '#90e0ef', '#48cae4', '#0096c7'],
    ruleQuirk: 'breath becomes visible',
    npcRoles: [
      { role: 'frost cartographer', personality: 'meticulous, hushed' },
      { role: 'wind keeper', personality: 'cryptic, cold' },
      { role: 'snow sage', personality: 'quiet, patient' },
    ] },
  { id: 'jungle', name: 'Jungle', palette: ['#1b4332', '#2d6a4f', '#40916c', '#52b788', '#95d5b2'],
    ruleQuirk: 'vines pull you toward walls',
    npcRoles: [
      { role: 'jungle scout', personality: 'restless, friendly' },
      { role: 'river trader', personality: 'loud, generous' },
      { role: 'canopy sage', personality: 'slow, cryptic' },
    ] },
  { id: 'crystal', name: 'Crystal', palette: ['#3a0ca3', '#7209b7', '#b5179e', '#f72585', '#4cc9f0'],
    ruleQuirk: 'light refracts',
    npcRoles: [
      { role: 'gem cutter', personality: 'precise, kind' },
      { role: 'prism sage', personality: 'cryptic, colorful' },
      { role: 'crystal keeper', personality: 'terse, glowing' },
    ] },
  { id: 'neon', name: 'Neon', palette: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
    ruleQuirk: 'colors shift',
    npcRoles: [
      { role: 'arcade vendor', personality: 'loud, hyped' },
      { role: 'neon sage', personality: 'cryptic, electric' },
      { role: 'pixel keeper', personality: 'terse, retro' },
    ] },
  { id: 'haunted', name: 'Haunted', palette: ['#0d0c1d', '#1d1b3a', '#3d2c8d', '#916bbf', '#dabfff'],
    ruleQuirk: 'shadows drift',
    npcRoles: [
      { role: 'ghost vendor', personality: 'soft, regretful' },
      { role: 'crypt sage', personality: 'cryptic, mournful' },
      { role: 'tomb keeper', personality: 'terse, cold' },
    ] },
  { id: 'sky', name: 'Sky', palette: ['#f8f9fa', '#e9ecef', '#dee2e6', '#adb5bd', '#6c757d'],
    ruleQuirk: 'falling upward',
    npcRoles: [
      { role: 'cloud cartographer', personality: 'drifty, calm' },
      { role: 'wind singer', personality: 'cryptic, lyrical' },
      { role: 'sun warden', personality: 'terse, warm' },
    ] },
];

export function biomeWeightsFor(worldId: string): Record<Tile, number> {
  switch (worldId) {
    case 'forest':  return { 0: 5, 1: 2, 2: 0, 3: 3, 4: 1 };
    case 'ocean':   return { 0: 3, 1: 1, 2: 5, 3: 0, 4: 1 };
    case 'dungeon': return { 0: 4, 1: 4, 2: 0, 3: 1, 4: 1 };
    case 'scifi':   return { 0: 6, 1: 2, 2: 0, 3: 1, 4: 1 };
    case 'desert':  return { 0: 5, 1: 1, 2: 0, 3: 2, 4: 2 };
    case 'tundra':  return { 0: 5, 1: 2, 2: 1, 3: 1, 4: 0 };
    case 'jungle':  return { 0: 3, 1: 4, 2: 0, 3: 3, 4: 1 };
    case 'crystal': return { 0: 4, 1: 1, 2: 0, 3: 1, 4: 3 };
    case 'neon':    return { 0: 6, 1: 2, 2: 0, 3: 1, 4: 1 };
    case 'haunted': return { 0: 3, 1: 5, 2: 0, 3: 1, 4: 1 };
    case 'sky':     return { 0: 5, 1: 1, 2: 1, 3: 2, 4: 1 };
    default:        return { 0: 5, 1: 2, 2: 1, 3: 1, 4: 1 };
  }
}

export function npcRolesFor(worldId: string): Array<{ role: string; personality: string }> {
  const world = THEME_WORLDS.find(w => w.id === worldId);
  return world ? world.npcRoles : THEME_WORLDS[0]!.npcRoles;
}
