/**
 * Echo Contamination System — realms can be corrupted by adjacent realms.
 * 40% chance per realm, affecting palette and gameplay rules.
 */

import { THEME_WORLDS } from './themeWorlds';
import type { WorldId } from './themeWorlds';

/** Adjacent realm relationships — which realms can corrupt which */
const ADJACENT_MAP: Record<string, string[]> = {
  forest: ['jungle', 'dungeon', 'tundra'],
  ocean: ['desert', 'tundra', 'sky'],
  dungeon: ['forest', 'haunted', 'crystal'],
  scifi: ['neon', 'crystal', 'haunted'],
  desert: ['ocean', 'tundra', 'jungle'],
  tundra: ['forest', 'ocean', 'desert'],
  jungle: ['forest', 'desert', 'crystal'],
  crystal: ['dungeon', 'scifi', 'jungle'],
  neon: ['scifi', 'haunted', 'sky'],
  haunted: ['dungeon', 'scifi', 'neon'],
  sky: ['ocean', 'neon', 'tundra'],
};

/** Contamination display names */
const CONTAMINATION_NAMES: Record<string, string> = {
  forest: '腐藤', ocean: '咸潮', dungeon: '深渊', scifi: '干扰',
  desert: '沙暴', tundra: '冰霜', jungle: '瘴气', crystal: '晶化',
  neon: '霓虹', haunted: '亡语', sky: '星蚀',
};

export interface ContaminationState {
  /** The realm id that is being corrupted */
  realmId: string;
  /** The realm id of the contaminator */
  contaminatorId: string;
  /** Display name of the contamination effect */
  label: string;
  /** Whether the contamination is active */
  isCorrupted: boolean;
}

/**
 * Determine if a realm is contaminated by an adjacent realm.
 * Returns the contamination state, or null if not corrupted.
 */
export function rollContamination(realmId: string): ContaminationState | null {
  const adjacent = ADJACENT_MAP[realmId];
  if (!adjacent || adjacent.length === 0) return null;
  // 40% chance of contamination
  if (Math.random() >= 0.4) return null;
  // Pick a random adjacent realm as contaminator
  const contaminatorId = adjacent[Math.floor(Math.random() * adjacent.length)]!;
  const label = CONTAMINATION_NAMES[contaminatorId] ?? '未知';
  return {
    realmId,
    contaminatorId,
    label,
    isCorrupted: true,
  };
}

/**
 * Get a corrupted palette by blending two realm palettes.
 * Swaps one tile color (index 1-4) from corrupting realm into the base palette.
 */
export function getCorruptedPalette(
  basePalette: [string, string, string, string, string],
  contaminatorId: string,
): [string, string, string, string, string] {
  const contWorld = THEME_WORLDS.find(w => w.id === contaminatorId);
  if (!contWorld) return basePalette;
  const contPal = contWorld.palette;
  // Swap a random tile layer (1-4) with the contaminator's version
  const swapIdx = Math.floor(Math.random() * 4) + 1; // 1-4
  const newPalette = [...basePalette] as [string, string, string, string, string];
  newPalette[swapIdx] = contPal[swapIdx]!;
  return newPalette;
}

/**
 * Get a corrupted rule quirk description.
 */
export function getCorruptedQuirk(
  originalQuirk: string,
  contaminatorId: string,
): string {
  const contWorld = THEME_WORLDS.find(w => w.id === contaminatorId);
  if (!contWorld) return originalQuirk;
  const contName = CONTAMINATION_NAMES[contaminatorId] ?? contaminatorId;
  return `${originalQuirk} + ${contName}污染`;
}
