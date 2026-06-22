import type { Card, ThemePayload, PhysicsPayload } from '../core/cardSystem';
import { THEME_WORLDS } from '../procgen/themeWorlds';
import { uuid } from '../utils/uuid';

export function buildThemeCard(biomeIndex: number): Card {
  const w = THEME_WORLDS[biomeIndex % THEME_WORLDS.length]!;
  const payload: ThemePayload = {
    palette: [...w.palette],
    ruleQuirk: `${w.name} world: ${w.ruleQuirk}`,
  };
  return { id: uuid(), type: 'theme', name: w.name, themePayload: payload, generatedBy: 'fallback', generatedAt: Date.now() };
}

export function buildPhysicsCards(seed: number): Card[] {
  const presets: PhysicsPayload[] = [
    { gravity: 200, restitution: 0.95, friction: 0.1, note: 'moon bounce' },
    { gravity: 1400, restitution: 0.1, friction: 0.8, note: 'heavy brine' },
    { gravity: 800, restitution: 0.2, friction: 0.05, note: 'icy ground' },
    { gravity: 800, restitution: 0.0, friction: 1.5, note: 'sticky vine' },
    { gravity: 400, restitution: 0.7, friction: 0.3, note: 'gentle drift' },
    { gravity: 1200, restitution: 0.4, friction: 0.6, note: 'earth pull' },
    { gravity: 600, restitution: 0.85, friction: 0.2, note: 'feather fall' },
    { gravity: 1000, restitution: 0.3, friction: 1.0, note: 'mud walk' },
  ];
  void seed;
  return presets.map((p, i) => ({
    id: uuid(),
    type: 'physics',
    name: p.note,
    physicsPayload: { ...p },
    generatedBy: 'fallback' as const,
    generatedAt: Date.now() + i,
  }));
}

export function buildNpcCards(biomeIndex: number): Card[] {
  const w = THEME_WORLDS[biomeIndex % THEME_WORLDS.length]!;
  return w.npcRoles.map((n, i) => ({
    id: uuid(),
    type: 'npc',
    name: n.role,
    npcPayload: { role: n.role, personality: n.personality },
    generatedBy: 'fallback' as const,
    generatedAt: Date.now() + i,
  }));
}

export function buildHiddenCards(itemNames: string[]): Card[] {
  if (itemNames.length < 2) return [];
  return [
    { id: uuid(), type: 'hidden', name: 'Memory Gate', hiddenPayload: { unlockRecipe: [itemNames[0]!, itemNames[1]!] }, generatedBy: 'fallback' as const, generatedAt: Date.now() },
    { id: uuid(), type: 'hidden', name: 'Echo Vault', hiddenPayload: { unlockRecipe: [itemNames[itemNames.length - 2]!, itemNames[itemNames.length - 1]!] }, generatedBy: 'fallback' as const, generatedAt: Date.now() + 1 },
  ];
}
