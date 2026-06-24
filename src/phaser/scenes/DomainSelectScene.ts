import Phaser from 'phaser';
import { THEME_WORLDS } from '../../procgen/themeWorlds';
import type { ThemeWorld } from '../../procgen/themeWorlds';
import { rollContamination, getCorruptedPalette, getCorruptedQuirk } from '../../procgen/contamination';

const REALM_THREAT: Record<string, string> = {
  forest: '荆棘',
  ocean: '暗流',
  dungeon: '暗影',
  scifi: '能量场',
  desert: '流沙',
  tundra: '冰裂',
  jungle: '毒雾',
  crystal: '水晶刺',
  neon: '电网',
  haunted: '亡灵',
  sky: '虚空',
};

const REALM_DIFFICULTY: Record<string, number> = {
  forest: 1,
  ocean: 2,
  dungeon: 2,
  scifi: 3,
  desert: 2,
  tundra: 2,
  jungle: 3,
  crystal: 3,
  neon: 2,
  haunted: 3,
  sky: 2,
};

export class DomainSelectScene extends Phaser.Scene {
  constructor() { super('DomainSelectScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0a0a1a');
    const cx = 640;

    this.add.text(cx, 40, '选择碎镜域', { fontSize: '28px', color: '#c4b5fd' }).setOrigin(0.5);
    this.add.text(cx, 70, '每次探险进入一个域，收集回声碎片', { fontSize: '13px', color: '#6b7280' }).setOrigin(0.5);

    // Pick 3 random realms
    const shuffled = [...THEME_WORLDS].sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3);

    const cardW = 340;
    const cardH = 140;
    const startY = 150;
    const gap = 160;

    options.forEach((world, i) => {
      const y = startY + i * gap;
      const x = cx;

      // Roll for contamination
      const contamination = rollContamination(world.id);
      const isCorrupted = contamination?.isCorrupted ?? false;
      const pal = isCorrupted && contamination
        ? getCorruptedPalette(world.palette, contamination.contaminatorId)
        : world.palette;

      // Card background
      const bgColor = parseInt(pal[0].replace('#', ''), 16);
      const card = this.add.rectangle(x, y, cardW, cardH, bgColor, 0.8).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      // Border — purple for normal, red/pulsing for corrupted
      const border = this.add.rectangle(x, y, cardW + 2, cardH + 2).setOrigin(0.5)
        .setStrokeStyle(1, isCorrupted ? 0xff4444 : 0x7c3aed);
      if (isCorrupted) {
        this.tweens.add({ targets: border, alpha: 0.5, duration: 600, yoyo: true, repeat: -1 });
      }

      // Realm name
      this.add.text(x, y - 48, world.name, { fontSize: '22px', color: '#fff' }).setOrigin(0.5);

      // Difficulty
      const diff = REALM_DIFFICULTY[world.id] ?? 2;
      const stars = '★'.repeat(diff) + '☆'.repeat(3 - diff);
      this.add.text(x, y - 20, `难度: ${stars}`, { fontSize: '12px', color: '#fbbf24' }).setOrigin(0.5);

      // Threat
      const threat = REALM_THREAT[world.id] ?? '未知';
      this.add.text(x, y + 6, `威胁: ${threat}`, { fontSize: '12px', color: '#f87171' }).setOrigin(0.5);

      // Contamination warning
      if (isCorrupted && contamination) {
        const contLabel = contamination.label;
        this.add.text(x, y + 28, `⚠ 已被 ${contLabel} 污染`, { fontSize: '11px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5);
      }

      // Click to select
      card.on('pointerdown', () => this.selectRealm(world, isCorrupted ? contamination!.contaminatorId : undefined));
      card.on('pointerover', () => card.setAlpha(0.9));
      card.on('pointerout', () => card.setAlpha(0.8));
    });

    // Back
    const backBg = this.add.rectangle(cx, 580, 200, 36, 0x1e1e3a).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, 580, '返回回声档案', { fontSize: '14px', color: '#aaa' }).setOrigin(0.5);
    backBg.on('pointerdown', () => {
      this.scene.start('EchoArchiveScene');
    });
  }

  private selectRealm(world: ThemeWorld, contaminatorId?: string) {
    const isCorrupted = !!contaminatorId;
    this.scene.start('GameScene', {
      realmId: world.id,
      realmPalette: isCorrupted ? getCorruptedPalette(world.palette, contaminatorId!) : world.palette,
      layer: 0,
      isExpedition: true,
      contaminatorId: contaminatorId,
    });
  }
}
