/**
 * Ending Scene — triggered when all 11 echoes are collected.
 * Three endings based on player's domain conflict choices:
 *   1. 修复 (Restore)  — favored preservation factions
 *   2. 重塑 (Remake)  — favored transformation factions
 *   3. 释放 (Release) — mixed choices, chose to free the Prism
 */

import Phaser from 'phaser';
import { loadSave, saveSave } from '../../core/persistence';
import { FACTIONS, type ConflictState } from '../../core/domainConflict';

type EndingType = 'restore' | 'remake' | 'release';

interface EndingDef {
  id: EndingType;
  title: string;
  subtitle: string;
  narrative: string[];
  bgColor: string;
  accentColor: string;
}

const ENDINGS: Record<EndingType, EndingDef> = {
  restore: {
    id: 'restore',
    title: '修复',
    subtitle: '让世界回到它原来的样子',
    narrative: [
      '你收集了所有棱镜的碎片。',
      '站在世界破碎的起点，你做出了最后的选择——修复。',
      '碎片在你手中缓缓升起，发出柔和的光芒。',
      '它们开始重组，像拼图一样一块块地拼回原来的形状。',
      '世界在震动。裂缝开始愈合。天空中的裂痕慢慢闭合。',
      '你感到一阵温暖的风吹过——那是这个世界第一次真正的呼吸。',
      '苔藓从你脚边探出头来。潮汐恢复了它的旋律。',
      '余烬熄灭了，但它的温暖留在了你的手心里。',
      '一切回到了棱镜碎裂前的样子。',
      '但你记得。',
      '你记得所有的一切。',
      '也许，这就是棱镜想要你做的——不是修复世界，',
      '而是让这个世界有一个记得它曾经破碎过的见证者。',
    ],
    bgColor: '#0a0a1a',
    accentColor: '#c084fc',
  },
  remake: {
    id: 'remake',
    title: '重塑',
    subtitle: '在旧世界的废墟上建造新世界',
    narrative: [
      '你收集了所有棱镜的碎片。',
      '但你没有将它们拼回原样。',
      '你握紧了碎片，让它们的力量流入你的身体。',
      '世界在崩塌——但这正是你想要的。',
      '旧的秩序已经破碎太久了。它不值得被修复。',
      '你举起手，碎片的光从你的指尖射出。',
      '不是缝合裂痕，而是在裂缝中注入新的东西。',
      '天空裂开的地方，出现了新的颜色。',
      '海洋倒灌的地方，升起了新的陆地。',
      '你不是在修复世界。你是在重新创造它。',
      '有你记忆中的一切美好，但没有那些破碎。',
      '也许，这才是棱镜碎裂的真正目的——',
      '不是让世界记住过去，而是给世界一个重新开始的机会。',
    ],
    bgColor: '#0a0a1a',
    accentColor: '#ff9b54',
  },
  release: {
    id: 'release',
    title: '释放',
    subtitle: '放下一切，让世界自由',
    narrative: [
      '你收集了所有棱镜的碎片。',
      '但你没有使用它们。',
      '你感受到了碎片的重量——不是物理的重量，',
      '是千百年来，这个世界压在它身上的期望的重量。',
      '你松开了手。',
      '碎片没有落地。它们悬浮在空中，',
      '然后，一颗接一颗，化作了光点。',
      '它们没有重组。它们消散了。',
      '世界没有修复，也没有重塑。',
      '它只是...继续存在着。',
      '裂缝还在，天空还在流血，海洋还在倒灌。',
      '但不知为何，一切看起来不再那么绝望了。',
      '也许，棱镜从来就不需要被修复。',
      '它只是想让这个世界知道：',
      '即使破碎了，也值得被爱。',
    ],
    bgColor: '#0a0a1a',
    accentColor: '#52b788',
  },
};

export class EndingScene extends Phaser.Scene {
  constructor() { super('EndingScene'); }

  create() {
    const save = loadSave();
    const endingType = this.determineEnding(save);
    const ending = ENDINGS[endingType]!;

    this.cameras.main.setBackgroundColor(ending.bgColor);
    const cx = 640;

    // Slow text reveal
    this.add.text(cx, 30, ending.title, {
      fontSize: '36px', color: ending.accentColor, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 70, ending.subtitle, {
      fontSize: '16px', color: '#9ca3af',
    }).setOrigin(0.5);

    // Divider
    const divider = this.add.rectangle(cx, 95, 200, 1, parseInt(ending.accentColor.replace('#', ''), 16), 0.5);

    // Narrative text — displayed as segments that auto-scroll
    let lineY = 125;
    const lineH = 22;
    const maxLines = Math.min(ending.narrative.length, Math.floor((720 - 160) / lineH));

    // Create all text objects but set visible progressively
    const textObjs: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < maxLines; i++) {
      const t = this.add.text(cx, lineY + i * lineH, ending.narrative[i] ?? '', {
        fontSize: '14px',
        color: '#d4d4d8',
        wordWrap: { width: 800 },
        lineSpacing: 4,
      }).setOrigin(0.5, 0).setAlpha(0);
      textObjs.push(t);
    }

    // Reveal lines one by one
    textObjs.forEach((t, i) => {
      this.time.delayedCall(1200 + i * 1800, () => {
        this.tweens.add({ targets: t, alpha: 1, duration: 500 });
      });
    });

    // After all text is shown, show ending choice
    const totalDelay = 1200 + maxLines * 1800;

    this.time.delayedCall(totalDelay + 500, () => {
      // Credits-like scroll prompt
      const prompt = this.add.text(cx, 700, '— 终 —', {
        fontSize: '20px', color: ending.accentColor,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: prompt, y: 500, duration: 4000,
        onComplete: () => {
          this.showFinalActions(cx, ending.accentColor);
        },
      });
    });

    // Music/ambient note
    this.cameras.main.fadeIn(2000);
  }

  private determineEnding(save: any): EndingType {
    const conflictFavor: Record<string, number> = save.conflictFavor ?? {};
    const completedEvents: string[] = save.conflictCompletedEvents ?? [];

    // Count favor for preservation vs transformation factions
    const preservationFactions = [
      'forest_guardians', 'ocean_tide', 'dungeon_shadow',
      'scifi_preservers', 'desert_oasis', 'tundra_scholars',
      'crystal_resonators', 'neon_artists', 'haunted_rest', 'sky_walkers',
    ];
    const transformationFactions = [
      'forest_devourers', 'ocean_abyss', 'dungeon_flame',
      'scifi_purifiers', 'desert_sailors', 'tundra_hunters',
      'crystal_devourers', 'neon_raiders', 'haunted_wrath', 'sky_riders',
    ];

    let preserveScore = 0;
    let transformScore = 0;
    for (const [faction, favor] of Object.entries(conflictFavor)) {
      if (preservationFactions.includes(faction)) preserveScore += favor;
      if (transformationFactions.includes(faction)) transformScore += favor;
    }

    // If mostly preservation → restore ending
    // If mostly transformation → remake ending
    // If mixed or no choices → release ending
    const total = preserveScore + transformScore;
    if (total === 0) return 'release';
    const ratio = preserveScore / total;
    if (ratio > 0.6) return 'restore';
    if (ratio < 0.4) return 'remake';
    return 'release';
  }

  private showFinalActions(cx: number, accentColor: string) {
    const btnY = 540;
    const btnBg = this.add.rectangle(cx, btnY, 260, 44, 0x7c3aed).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, btnY, '回到主菜单', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => this.scene.start('MenuScene'));
    });

    // Add a "new game+" style note
    this.add.text(cx, 600, '旅程结束了。但回声还在。', {
      fontSize: '12px', color: '#6b7280', fontStyle: 'italic',
    }).setOrigin(0.5);
  }
}
