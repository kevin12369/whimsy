/**
 * Cross-session persistence using localStorage.
 * Stores echo archive progress, companion quest state, and unlocked abilities.
 */

const STORAGE_KEY = 'whimsy_echo_archive';

export interface EchoSaveData {
  collectedEchoIds: string[];
  unlockedAbilities: string[];
  totalFragmentsCollected: number;
  sessionsCompleted: number;
  // Quest / favor system
  completedQuests: string[];
  favor: Record<string, number>;  // NPC name → favor points
  recruitedCompanions: string[];  // companion IDs that have been recruited
  tutorialCompleted?: boolean;
  // Domain conflict system
  conflictFavor: Record<string, number>; // factionId → points
  conflictCompletedEvents: string[];
  conflictAllegiance?: string; // final faction choice
}

const DEFAULT_SAVE: EchoSaveData = {
  collectedEchoIds: [],
  unlockedAbilities: ['dash'],
  totalFragmentsCollected: 0,
  sessionsCompleted: 0,
  completedQuests: [],
  favor: {},
  recruitedCompanions: [],
  tutorialCompleted: false,
  conflictFavor: {},
  conflictCompletedEvents: [],
};

export function loadSave(): EchoSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, favor: {}, completedQuests: [], recruitedCompanions: [] };
    const parsed = JSON.parse(raw) as Partial<EchoSaveData>;
    return {
      collectedEchoIds: parsed.collectedEchoIds ?? [],
      unlockedAbilities: parsed.unlockedAbilities ?? ['dash'],
      totalFragmentsCollected: parsed.totalFragmentsCollected ?? 0,
      sessionsCompleted: parsed.sessionsCompleted ?? 0,
      completedQuests: parsed.completedQuests ?? [],
      favor: parsed.favor ?? {},
      recruitedCompanions: parsed.recruitedCompanions ?? [],
      tutorialCompleted: parsed.tutorialCompleted ?? false,
      conflictFavor: parsed.conflictFavor ?? {},
      conflictCompletedEvents: parsed.conflictCompletedEvents ?? [],
      conflictAllegiance: parsed.conflictAllegiance,
    };
  } catch {
    return { ...DEFAULT_SAVE, favor: {}, completedQuests: [], recruitedCompanions: [] };
  }
}

export function saveSave(data: EchoSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable — fail silently
  }
}

export function addEcho(echoId: string): EchoSaveData {
  const data = loadSave();
  if (!data.collectedEchoIds.includes(echoId)) {
    data.collectedEchoIds.push(echoId);
  }
  data.sessionsCompleted += 1;
  saveSave(data);
  return data;
}

export function addFragments(count: number): EchoSaveData {
  const data = loadSave();
  data.totalFragmentsCollected += count;
  saveSave(data);
  return data;
}

export function addFavor(npcName: string, amount: number): EchoSaveData {
  const data = loadSave();
  data.favor[npcName] = (data.favor[npcName] ?? 0) + amount;
  saveSave(data);
  return data;
}

export function getFavor(npcName: string): number {
  return loadSave().favor[npcName] ?? 0;
}

export function completeQuest(questId: string, npcName: string, favorReward: number): EchoSaveData {
  const data = loadSave();
  if (!data.completedQuests.includes(questId)) {
    data.completedQuests.push(questId);
  }
  data.favor[npcName] = (data.favor[npcName] ?? 0) + favorReward;
  saveSave(data);
  return data;
}

export function isQuestCompleted(questId: string): boolean {
  return loadSave().completedQuests.includes(questId);
}

export function recruitCompanion(companionId: string): EchoSaveData {
  const data = loadSave();
  if (!data.recruitedCompanions.includes(companionId)) {
    data.recruitedCompanions.push(companionId);
    data.unlockedAbilities.push(`companion_${companionId}`);
  }
  saveSave(data);
  return data;
}

export function isCompanionRecruited(companionId: string): boolean {
  return loadSave().recruitedCompanions.includes(companionId);
}

export function unlockAbility(abilityId: string): EchoSaveData {
  const data = loadSave();
  if (!data.unlockedAbilities.includes(abilityId)) {
    data.unlockedAbilities.push(abilityId);
  }
  saveSave(data);
  return data;
}

export function hasAbility(abilityId: string): boolean {
  return loadSave().unlockedAbilities.includes(abilityId);
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}
