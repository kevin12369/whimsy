import Phaser from 'phaser';
import { loadSave } from '../../core/persistence';
import { THEME_WORLDS } from '../../procgen/themeWorlds';
import { COMPANIONS, STORY_FRAGMENTS, getBondLevel, getBondProgress } from '../../core/companion';

const ABILITY_LABELS: Record<string, string> = {
  dash: '冲刺 (空格)',
  echo_scan: '回声扫描 (Q)',
  realm_resonance: '域力共鸣 (F)',
  echo_shield: '回声护盾',
  domain_nav: '域隙导航',
};

const ABILITY_DESCS: Record<string, string> = {
  dash: '短距冲刺，冷却2秒',
  echo_scan: '探测周围隐藏物品和陷阱',
  realm_resonance: '激活当前碎镜域的特殊能力',
  echo_shield: '每层第一次受伤减半',
  domain_nav: '选择时显示碎片收集状态',
};

export class EchoArchiveScene extends Phaser.Scene {
  constructor() { super('EchoArchiveScene'); }

  create() {
    const save = loadSave();
    const totalRealms = THEME_WORLDS.length;

    this.cameras.main.setBackgroundColor('#0a0a1a');
    const cx = 640;

    // Title
    this.add.text(cx, 28, '回声档案', { fontSize: '28px', color: '#c4b5fd' }).setOrigin(0.5);
    this.add.text(cx, 55, 'Echo Archive', { fontSize: '13px', color: '#6b7280' }).setOrigin(0.5);

    // ─── Echo Progress ─────────────────────────────────────
    this.add.text(80, 80, '棱镜回声', { fontSize: '14px', color: '#c4b5fd' });
    const collected = save.collectedEchoIds.filter(id => !id.startsWith('companion_') && !id.startsWith('story_')).length;
    const pct = collected / totalRealms;
    this.add.text(80, 100, `${collected} / ${totalRealms}`, { fontSize: '12px', color: '#aaa' });
    const barBg = this.add.rectangle(80, 125, 300, 16, 0x1e1e3a).setOrigin(0, 0.5);
    if (pct > 0) {
      this.add.rectangle(80, 125, 300 * pct, 16, 0x7c3aed).setOrigin(0, 0.5);
    }

    // ─── Stats ────────────────────────────────────────────
    this.add.text(80, 155, `碎片: ${save.totalFragmentsCollected}  探险: ${save.sessionsCompleted}`, { fontSize: '12px', color: '#6b7280' });

    // ─── Story Progress ────────────────────────────────────
    this.add.text(80, 185, '记忆碎片', { fontSize: '14px', color: '#fbbf24' });
    const storyCollected = save.collectedEchoIds.filter(id => id.startsWith('story_')).length;
    const storyTotal = STORY_FRAGMENTS.length;
    this.add.text(80, 205, `已发现: ${storyCollected} / ${storyTotal}`, { fontSize: '12px', color: storyCollected > 0 ? '#fbbf24' : '#4b5563' });
    if (storyCollected > 0) {
      const latestStory = STORY_FRAGMENTS
        .filter(f => save.collectedEchoIds.includes(`story_${f.id}`))
        .pop();
      if (latestStory) {
        this.add.text(80, 225, `最新: ${latestStory.title}`, { fontSize: '11px', color: '#d4d4d8' });
      }
    }

    // ─── Companions ─────────────────────────────────────────
    this.add.text(460, 80, '伙伴羁绊', { fontSize: '14px', color: '#52b788' });
    let cy = 105;
    for (const comp of COMPANIONS) {
      const recruited = save.unlockedAbilities.includes(`companion_${comp.id}`) ||
        save.collectedEchoIds.includes(`companion_${comp.id}`);
      const color = recruited ? '#52b788' : '#4b5563';

      // Name + status
      const status = recruited ? `Lv.${getBondLevel(0, comp.bondXpThreshold)}` : '??';
      this.add.text(460, cy, recruited ? comp.name : '???', { fontSize: '13px', color });
      this.add.text(580, cy, recruited ? comp.title : '未发现', { fontSize: '11px', color: '#6b7280' });
      this.add.text(710, cy, status, { fontSize: '12px', color });

      if (recruited) {
        this.add.text(460, cy + 16, comp.passiveDesc, { fontSize: '10px', color: '#9ca3af' });
      }
      cy += 40;
    }

    // ─── Abilities ──────────────────────────────────────────
    this.add.text(460, 260, '已解锁能力', { fontSize: '14px', color: '#c4b5fd' });
    const allAbilities = ['dash', 'echo_scan', 'realm_resonance', 'echo_shield', 'domain_nav'];
    let ay = 285;
    for (const ab of allAbilities) {
      const unlocked = save.unlockedAbilities.includes(ab) || COMPANIONS.some(c => save.unlockedAbilities.includes(`companion_${c.id}`));
      const color = unlocked ? '#4ade80' : '#4b5563';
      const label = ABILITY_LABELS[ab] ?? ab;
      const desc = ABILITY_DESCS[ab] ?? '';
      this.add.text(460, ay, `${unlocked ? '✓' : '○'} ${label}`, { fontSize: '13px', color });
      this.add.text(560, ay, desc, { fontSize: '11px', color: unlocked ? '#9ca3af' : '#4b5563' });
      ay += 24;
    }

    // ─── Start Expedition ─────────────────────────────────
    const btnY = 440;
    const btnBg = this.add.rectangle(cx, btnY, 300, 50, 0x7c3aed).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, btnY, '开始探险', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    btnBg.on('pointerdown', () => {
      this.scene.start('DomainSelectScene');
    });

    // ─── Final Ending (all echoes collected) ──────────────
    const allCollected = collected >= totalRealms;
    if (allCollected) {
      const endY = 500;
      const endGlow = this.add.rectangle(cx, endY, 340, 54, 0xc084fc, 0.3).setOrigin(0.5);
      this.tweens.add({ targets: endGlow, alpha: 0.1, duration: 800, yoyo: true, repeat: -1 });

      const endBg = this.add.rectangle(cx, endY, 340, 54, 0x7c3aed).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      this.add.text(cx, endY, '✦ 最终抉择 ✦', { fontSize: '20px', color: '#fbbf24' }).setOrigin(0.5);
      this.add.text(cx, endY + 20, '所有回声已收集，面对最终的真相', { fontSize: '10px', color: '#d4d4d8' }).setOrigin(0.5);

      endBg.on('pointerdown', () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.time.delayedCall(1000, () => this.scene.start('EndingScene'));
      });

      // Hide start expedition when all collected
      btnBg.setVisible(false);
    }

    // ─── Back ─────────────────────────────────────────────
    const backY = allCollected ? 570 : 510;
    const backBg = this.add.rectangle(cx, backY, 200, 36, 0x1e1e3a).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, backY, '返回主菜单', { fontSize: '14px', color: '#6b7280' }).setOrigin(0.5);
    backBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
