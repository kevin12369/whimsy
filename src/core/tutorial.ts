/**
 * Tutorial system — step definitions and state management.
 */

export interface TutorialStep {
  id: number;
  title: string;
  instruction: string;
  hint?: string; // shown in HUD
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 0,
    title: '移动',
    instruction: '按 WASD 或方向键移动角色，走到前方发光的标记点。',
    hint: 'WASD / 方向键 移动',
  },
  {
    id: 1,
    title: '拾取',
    instruction: '靠近发光的物品，按 E 键拾取。',
    hint: '靠近物品 → 按 E 拾取',
  },
  {
    id: 2,
    title: '使用物品',
    instruction: '前方有水挡住了路。按 I 打开背包，选择 brine comet，按 E 使用它来冻住水面。',
    hint: 'I 打开背包 → 选中物品 → E 使用',
  },
  {
    id: 3,
    title: '与 NPC 对话',
    instruction: '找到发光的 NPC，按 E 键对话。他们会给你线索。',
    hint: '靠近 NPC → 按 E 对话',
  },
  {
    id: 4,
    title: '融合',
    instruction: '地图上标记了融合祭坛的位置（紫色标记）。走到祭坛前按 E，选择两个物品融合。',
    hint: '找到祭坛 → 按 E 融合',
  },
];

export function getTutorialStep(id: number): TutorialStep | undefined {
  return TUTORIAL_STEPS[id];
}

export function isTutorialComplete(saveData: { tutorialCompleted?: boolean }): boolean {
  return saveData.tutorialCompleted === true;
}
