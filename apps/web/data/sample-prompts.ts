import { getTemplate } from '@whimsy/templates';
import { defaultTheme } from '../lib/theme';

export interface SamplePrompt {
  id: string;
  prompt: string;
  templateId: string;
  emoji: string;
  blurb: string;
}

export const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: 'mario-comet',
    prompt: '像马里奥那样,但主角是颗彗星,在太空里躲小行星。3 条命,撞到就死。',
    templateId: 'platformer-space-comet',
    emoji: '\u{1F680}',
    blurb: '平台跳跃',
  },
  {
    id: 'boat-battler',
    prompt: '海面上一艘小船,躲避 3 种鱼雷(普通/追踪/分裂),击沉每波后升级难度。',
    templateId: 'shooter-space-defender',
    emoji: '\u{1F6A4}',
    blurb: '纵版射击',
  },
  {
    id: 'color-match',
    prompt: '9×9 棋盘,同色 2+ 连线消除,30 秒内看能消多少对。',
    templateId: 'puzzle-color-match',
    emoji: '\u{1F3A8}',
    blurb: '同色连线',
  },
];

export interface SampleGame {
  id: string;
  prompt: string;
  templateId: string;
  html: string;
  name: string;
}

export function getSampleGame(promptId: string): SampleGame | null {
  const sample = SAMPLE_PROMPTS.find((s) => s.id === promptId);
  if (!sample) return null;
  const template = getTemplate(sample.templateId);
  if (!template) return null;
  const html = template.render(defaultTheme);
  return {
    id: sample.id,
    prompt: sample.prompt,
    templateId: sample.templateId,
    html,
    name: template.name,
  };
}