import type { Card, ThemePayload, PhysicsPayload, NpcPayload } from '../core/cardSystem';
import { BIOMES } from '../procgen/biomes';
import { uuid } from '../utils/uuid';

export function buildThemeCard(biomeIndex: number): Card {
  const b = BIOMES[biomeIndex % BIOMES.length]!;
  const payload: ThemePayload = {
    palette: [...b.palette],
    ruleQuirk: `${b.name} world: ${quirkFor(b.id)}`,
  };
  return { id: uuid(), type:'theme', name: b.name, themePayload: payload, generatedBy:'fallback', generatedAt: Date.now() };
}

export function buildPhysicsCards(seed: number): Card[] {
  const presets: PhysicsPayload[] = [
    { gravity: 200,  restitution: 0.95, friction: 0.1,  note: 'moon bounce' },
    { gravity: 1400, restitution: 0.1,  friction: 0.8,  note: 'heavy brine' },
    { gravity: 800,  restitution: 0.2,  friction: 0.05, note: 'icy ground' },
    { gravity: 800,  restitution: 0.0,  friction: 1.5,  note: 'sticky vine' },
    { gravity: 400,  restitution: 0.7,  friction: 0.3,  note: 'gentle drift' },
    { gravity: 1200, restitution: 0.4,  friction: 0.6,  note: 'earth pull' },
    { gravity: 600,  restitution: 0.85, friction: 0.2,  note: 'feather fall' },
    { gravity: 1000, restitution: 0.3,  friction: 1.0,  note: 'mud walk' },
  ];
  void seed; // seed reserved for future LCG variant; current plan uses static preset set
  return presets.map((p, i) => ({
    id: uuid(),
    type: 'physics',
    name: p.note,
    physicsPayload: { ...p },
    generatedBy: 'fallback',
    generatedAt: Date.now() + i,
  }));
}

export function buildNpcCards(biomeIndex: number): Card[] {
  const b = BIOMES[biomeIndex % BIOMES.length]!;
  const roles: Record<string, NpcPayload[]> = {
    forest:  [{ role:'druid vendor', personality:'rambles about moss, friendly' },
              { role:'wandering ranger', personality:'speaks in questions' },
              { role:'moss keeper', personality:'terse, protective of greenery' }],
    ocean:   [{ role:'cosmic pickle vendor', personality:'rambles about brine, friendly' },
              { role:'brine sage', personality:'speaks in questions, philosophical' },
              { role:'tide watcher', personality:'cautious, weather-aware' }],
    dungeon: [{ role:'torch vendor', personality:'cheerful, fire-phobic' },
              { role:'rune sage', personality:'cryptic, slow' },
              { role:'gate keeper', personality:'terse, riddling' }],
    scifi:   [{ role:'parts vendor', personality:'mechanical, helpful' },
              { role:'station AI', personality:'literal, polite' },
              { role:'drone tech', personality:'terse, diagnostic' }],
    desert:  [{ role:'caravan trader', personality:'hospitable, story-rich' },
              { role:'sand sage', personality:'cryptic, calm' },
              { role:'well keeper', personality:'terse, generous' }],
  };
  return (roles[b.id] ?? roles.forest!).map((n, i) => ({
    id: uuid(),
    type: 'npc',
    name: n.role,
    npcPayload: n,
    generatedBy: 'fallback',
    generatedAt: Date.now() + i,
  }));
}

export function buildHiddenCards(itemNames: string[]): Card[] {
  if (itemNames.length < 2) return [];
  return [
    { id: uuid(), type:'hidden', name:'Memory Gate', hiddenPayload:{ unlockRecipe: [itemNames[0]!, itemNames[1]!] }, generatedBy:'fallback', generatedAt: Date.now() },
    { id: uuid(), type:'hidden', name:'Echo Vault',  hiddenPayload:{ unlockRecipe: [itemNames[itemNames.length-2]!, itemNames[itemNames.length-1]!] }, generatedBy:'fallback', generatedAt: Date.now()+1 },
  ];
}

function quirkFor(biomeId: string): string {
  return ({
    forest:  'trees lean toward the player',
    ocean:   'liquids flow upward',
    dungeon: 'torches flicker with intent',
    scifi:   'gravity is a suggestion',
    desert:  'sand remembers footsteps',
  } as Record<string,string>)[biomeId] ?? 'the world is whimsical';
}
