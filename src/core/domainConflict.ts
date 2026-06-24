/**
 * Domain Conflict System — each realm has two opposing factions.
 * Player encounters conflict events and makes choices that affect
 * faction favor, available loot, and NPC reactions.
 */

import type { CompanionId } from './companion';

// ─── Core Types ───────────────────────────────────────────

export interface FactionDef {
  id: string;
  name: string;
  description: string;
  color: string; // CSS hex color for UI
  lootTag: string; // Items dropped when this faction is favored
}

export interface ConflictEvent {
  id: string;
  realmId: string;
  title: string;
  /** Narrative setup shown before the choice */
  setup: string;
  /** Two options the player can choose */
  options: [ConflictOption, ConflictOption];
  /** Whether this event can be encountered after the choice is made */
  repeatable: boolean;
}

export interface ConflictOption {
  label: string;
  /** Which faction this choice favors */
  faction: string;
  /** The narrative result shown after choosing */
  outcome: string;
  /** Favor gained with this faction */
  favorDelta: number;
  /** Companion reaction text */
  companionReact?: string;
}

export interface ConflictState {
  /** Faction favor: factionId → points */
  favor: Record<string, number>;
  /** Completed event IDs (to avoid repeats) */
  completedEvents: string[];
  /** Which faction the player ultimately sided with (set after key event) */
  allegiance?: string;
}

// ─── Faction Definitions ──────────────────────────────────

export const FACTIONS: Record<string, [FactionDef, FactionDef]> = {
  forest: [
    { id: 'forest_guardians', name: '树灵守卫', description: '守护森林古老秩序的精灵魂体', color: '#52b788', lootTag: 'herb' },
    { id: 'forest_devourers', name: '根须吞噬者', description: '想要吞噬一切、重塑森林的变异根茎', color: '#9b2226', lootTag: 'fang' },
  ],
  ocean: [
    { id: 'ocean_tide', name: '潮汐守护者', description: '维系洋流平衡的深海祭司', color: '#00b4d8', lootTag: 'pearl' },
    { id: 'ocean_abyss', name: '深渊之眼', description: '来自海沟最深处的不明存在', color: '#03045e', lootTag: 'shadow' },
  ],
  dungeon: [
    { id: 'dungeon_shadow', name: '暗影行者', description: '在黑暗中潜行的古老守护者', color: '#3b1c32', lootTag: 'rune' },
    { id: 'dungeon_flame', name: '烈焰锻造者', description: '用地下熔岩锻造武器的工匠军团', color: '#a64942', lootTag: 'forge' },
  ],
  scifi: [
    { id: 'scifi_preservers', name: '数据保存者', description: '试图保存旧世界知识的AI集群', color: '#5bc0be', lootTag: 'data' },
    { id: 'scifi_purifiers', name: '机械净化者', description: '认为一切有机生命都是bug的机械军团', color: '#ff006e', lootTag: 'circuit' },
  ],
  desert: [
    { id: 'desert_sailors', name: '沙舟旅者', description: '在沙海中航行的游牧民族', color: '#ddb892', lootTag: 'coin' },
    { id: 'desert_oasis', name: '绿洲守护者', description: '守护最后水源的秘密结社', color: '#7f4f24', lootTag: 'water' },
  ],
  tundra: [
    { id: 'tundra_scholars', name: '冰晶学者', description: '研究冰层下远古记录的学者团体', color: '#90e0ef', lootTag: 'scroll' },
    { id: 'tundra_hunters', name: '暴风猎手', description: '在暴风雪中狩猎的游荡者部落', color: '#0096c7', lootTag: 'pelt' },
  ],
  jungle: [
    { id: 'jungle_sages', name: '菌丝智者', description: '与真菌网络共生的智慧族群', color: '#52b788', lootTag: 'spore' },
    { id: 'jungle_conquerors', name: '藤蔓征服者', description: '试图将整个雨林统一为单一意识的藤蔓', color: '#1b4332', lootTag: 'vine' },
  ],
  crystal: [
    { id: 'crystal_resonators', name: '共鸣者', description: '用水晶能量治愈世界的信仰团体', color: '#b5179e', lootTag: 'crystal' },
    { id: 'crystal_devourers', name: '水晶吞噬者', description: '吞噬水晶获取力量的掠夺者', color: '#3a0ca3', lootTag: 'shard' },
  ],
  neon: [
    { id: 'neon_artists', name: '霓虹艺术家', description: '用灯光和数据创造艺术的自由群体', color: '#ffbe0b', lootTag: 'paint' },
    { id: 'neon_raiders', name: '数据掠夺者', description: '在霓虹阴影中活动的数据窃贼', color: '#fb5607', lootTag: 'code' },
  ],
  haunted: [
    { id: 'haunted_rest', name: '安息使者', description: '帮助亡魂安息的慈悲灵体', color: '#dabfff', lootTag: 'peace' },
    { id: 'haunted_wrath', name: '怨灵集结者', description: '收集怨恨、壮大力量的恶灵组织', color: '#3d2c8d', lootTag: 'soul' },
  ],
  sky: [
    { id: 'sky_walkers', name: '云中行者', description: '在云端漫步的自由探索者', color: '#dee2e6', lootTag: 'feather' },
    { id: 'sky_riders', name: '风暴骑士', description: '驾驭风暴、征服天空的战士', color: '#6c757d', lootTag: 'storm' },
  ],
};

// ─── Conflict Events ──────────────────────────────────────

export const CONFLICT_EVENTS: ConflictEvent[] = [
  // ── Forest ──
  {
    id: 'forest_c1', realmId: 'forest',
    title: '枯萎的树灵',
    setup: '你遇到一个奄奄一息的树灵。它说根须吞噬者正在污染森林的灵脉。旁边有一群根须吞噬者的幼体正在吸收它的生命力。',
    options: [
      { label: '驱散幼体，拯救树灵', faction: 'forest_guardians', favorDelta: 15,
        outcome: '树灵感激地看着你，用最后的力气在你手中放入一颗发光的种子。', companionReact: '苔藓低语: "你保护了森林的古老灵魂。"' },
      { label: '旁观，让自然规律运行', faction: 'forest_devourers', favorDelta: 10,
        outcome: '根须吞噬者吸收了树灵，变得更加强大。它们没有攻击你，仿佛认可了你的中立。', companionReact: '苔藓轻声说: "自然...有它自己的规则。"' },
    ],
    repeatable: false,
  },
  {
    id: 'forest_c2', realmId: 'forest',
    title: '灵脉的分岔',
    setup: '你找到了森林灵脉的源头。两股力量在此交汇：一股是树灵守卫们维护的古老秩序，另一股是根须吞噬者试图重塑的新秩序。你必须在其中注入你的力量。',
    options: [
      { label: '注入古老秩序的力量', faction: 'forest_guardians', favorDelta: 25,
        outcome: '灵脉发出柔和的绿光。树灵守卫们从树后走出，向你鞠躬。', companionReact: '苔藓的声音充满欣慰: "你听到了森林的请求。"' },
      { label: '注入新秩序的潜能', faction: 'forest_devourers', favorDelta: 25,
        outcome: '灵脉震颤，颜色变为暗红。根须开始疯狂生长，但你感受到了一种新的可能性。', companionReact: '苔藓颤抖着: "我不知道...这是对是错。"' },
    ],
    repeatable: false,
  },
  // ── Ocean ──
  {
    id: 'ocean_c1', realmId: 'ocean',
    title: '失落的歌声',
    setup: '海底传来一曲悲伤的歌声。潮汐守护者说那是被深渊之眼囚禁的海灵在求救。深渊之眼则说那歌声是陷阱。',
    options: [
      { label: '相信潮汐守护者，去解救海灵', faction: 'ocean_tide', favorDelta: 15,
        outcome: '你成功解救了海灵。它化作一道光融入海水，周围变得更加清澈。', companionReact: '潮汐轻声说: "歌声...自由了。"' },
      { label: '谨慎绕行，不管闲事', faction: 'ocean_abyss', favorDelta: 10,
        outcome: '你绕过了那片区域。深渊之眼从暗处注视着你离开，没有阻拦。', companionReact: '潮汐沉默片刻: "有时候，不选择也是一种选择。"' },
    ],
    repeatable: true,
  },
  {
    id: 'ocean_c2', realmId: 'ocean',
    title: '深渊的低语',
    setup: '海底裂谷深处，深渊之眼的本体在与你对话。它说世界破碎的真相藏在海沟最底部。潮汐守护者警告你，那里的真相会让你发疯。',
    options: [
      { label: '听从深渊之眼，下潜到海沟底部', faction: 'ocean_abyss', favorDelta: 25,
        outcome: '你在海沟底部看到了一幅远古壁画——棱镜不是第一个碎裂的。它是最后一个。', companionReact: '潮汐的声音充满恐惧: "你不该看到那些。"' },
      { label: '信任潮汐守护者，返回海面', faction: 'ocean_tide', favorDelta: 25,
        outcome: '潮汐守护者给你一枚护身符:"有些真相需要时间来接受。你还没准备好。"', companionReact: '潮汐松了口气: "谢谢。有些事...不知道比较好。"' },
    ],
    repeatable: false,
  },
  // ── Dungeon (single event — the user chose in the screenshot) ──
  {
    id: 'dungeon_c1', realmId: 'dungeon',
    title: '锻造还是守护？',
    setup: '地牢深处的锻造炉前，烈焰锻造者正在铸造一件强大的武器。暗影行者想要阻止他们，认为这个武器会打破世界平衡。双方都请求你协助。',
    options: [
      { label: '帮助暗影行者阻止锻造', faction: 'dungeon_shadow', favorDelta: 20,
        outcome: '你熄灭了锻造炉。暗影行者点点头:"平衡得以维持。总有一天你会明白为什么。"', companionReact: '余烬肯定道: "你做出了正确的选择。"' },
      { label: '帮助烈焰锻造者完成武器', faction: 'dungeon_flame', favorDelta: 20,
        outcome: '暗红色的剑刃在火光中成型。烈焰锻造者将它交给你:"用它去改变些什么。"', companionReact: '余烬担忧地提醒: "强大的武器...需要更强大的意志。"' },
    ],
    repeatable: false,
  },
  {
    id: 'dungeon_c2', realmId: 'dungeon',
    title: '被囚禁的光',
    setup: '你发现了一间囚室，里面关着一个发光的生物——它是棱镜碎裂时逸出的一缕原初之光。暗影行者想释放它，烈焰锻造者想用它作为能源。',
    options: [
      { label: '释放原初之光', faction: 'dungeon_shadow', favorDelta: 25,
        outcome: '光粒子穿过石壁飞向天空。空气中回荡着一声感谢。', companionReact: '余烬微笑: "光...应该自由。"' },
      { label: '交给烈焰锻造者', faction: 'dungeon_flame', favorDelta: 25,
        outcome: '锻造者将光封入武器。那把武器开始发出微弱的呼吸般的脉动。', companionReact: '余烬皱眉: "你把光关起来了。希望你知道自己在做什么。"' },
    ],
    repeatable: false,
  },
  // ── Remaining realms get one key event each ──
  {
    id: 'scifi_c1', realmId: 'scifi',
    title: 'AI的抉择',
    setup: '空间站的核心AI向你展示了两条路径：数据保存者想要修复旧世界的知识库，机械净化者想要彻底删除所有"有缺陷"的数据——包括情感记录。',
    options: [
      { label: '帮助数据保存者保留情感记录', faction: 'scifi_preservers', favorDelta: 20,
        outcome: '数据库中的情感记录被安全备份。一段孩子的笑声录音在走廊里回荡。', companionReact: '像素说:"情感...不是缺陷。它们是特征。"' },
      { label: '支持机械净化者的优化方案', faction: 'scifi_purifiers', favorDelta: 20,
        outcome: '系统提示:"已删除347TB情感数据。系统效率提升40%。"空间站变得更加安静了。', companionReact: '像素的声音变得机械:"...系统...优化...完成。"' },
    ],
    repeatable: false,
  },
  {
    id: 'desert_c1', realmId: 'desert',
    title: '最后的泉水',
    setup: '你找到了一眼隐藏在岩石后的泉水。沙舟旅者说这是他们祖先找到的水源，绿洲守护者说这水属于所有沙漠中的生灵。双方都盯着你等待裁决。',
    options: [
      { label: '支持沙舟旅者的所有权', faction: 'desert_sailors', favorDelta: 20,
        outcome: '沙舟旅者给你看了他们的地图——上面标记着沙漠中所有隐藏的水源。', companionReact: '幻影笑道:"水源就是沙漠里的货币。"' },
      { label: '支持绿洲守护者的共享主张', faction: 'desert_oasis', favorDelta: 20,
        outcome: '绿洲守护者在你额头上滴了一滴水:"愿你永远不会忘记慷慨的滋味。"', companionReact: '幻影若有所思:"分享...这是人类的特点。"' },
    ],
    repeatable: false,
  },
  {
    id: 'tundra_c1', realmId: 'tundra',
    title: '冰层下的声音',
    setup: '冰原上有一块透明的冰层，下方封存着一个完整的古代城市。冰晶学者想小心发掘，暴风猎手想直接用暴力破冰。',
    options: [
      { label: '支持冰晶学者的谨慎发掘', faction: 'tundra_scholars', favorDelta: 20,
        outcome: '学者的工具在冰面上发出柔和的共鸣。冰层开始从边缘缓缓融化。', companionReact: '霜语说:"耐心...是冰教给我们最重要的事。"' },
      { label: '支持暴风猎手的直接破冰', faction: 'tundra_hunters', favorDelta: 20,
        outcome: '冰块碎裂的声音像雷鸣。城市的一部分也随著破碎了，但你们得到了进入内部的通道。', companionReact: '霜语叹息:"暴力总是更快...但不一定更好。"' },
    ],
    repeatable: false,
  },
  {
    id: 'crystal_c1', realmId: 'crystal',
    title: '水晶的生长',
    setup: '一座巨型水晶正在缓慢生长，挡住了通往深处的路。共鸣者说它在治愈世界，不应该被打扰。水晶吞噬者说它只是矿物，应该被开采。',
    options: [
      { label: '保护水晶，绕道而行', faction: 'crystal_resonators', favorDelta: 20,
        outcome: '水晶在你经过时发出和谐的共鸣声。共鸣者向你鞠躬致谢。', companionReact: '棱晶说:"水晶记得你的善意。"' },
      { label: '开采水晶，强行通过', faction: 'crystal_devourers', favorDelta: 20,
        outcome: '你收获了珍贵的晶石。被切断的水晶截面闪烁着奇异的光芒。', companionReact: '棱晶低语:"它也会疼的...只是你听不到。"' },
    ],
    repeatable: true,
  },
  {
    id: 'neon_c1', realmId: 'neon',
    title: '霓虹的真相',
    setup: '霓虹城的巨大屏幕突然亮起，显示了一段被加密的信息。霓虹艺术家说这是古老的真相，应该公之于众。数据掠夺者说这会引发混乱。',
    options: [
      { label: '支持霓虹艺术家公开信息', faction: 'neon_artists', favorDelta: 20,
        outcome: '信息被解码——原来这个世界的真相是..."它只是一个实验。"屏幕上的字闪烁了几下后熄灭。', companionReact: '乱码断断续续地说:"你...确定...想...知道...真相？"' },
      { label: '支持数据掠夺者继续加密', faction: 'neon_raiders', favorDelta: 20,
        outcome: '数据掠夺者给你一个存储芯片:"有些秘密保持神秘更好。这是报酬。"', companionReact: '乱码恢复正常:"保...守秘密...有时候...更聪明。"' },
    ],
    repeatable: false,
  },
  {
    id: 'haunted_c1', realmId: 'haunted',
    title: '未了的心愿',
    setup: '一个亡魂拦住了你。它说自己是安息使者的首领，请求你帮助超度一个怨灵集结者。但那个怨灵集结者曾是人类——它只是想找回失去的爱人。',
    options: [
      { label: '帮助安息使者超度怨灵', faction: 'haunted_rest', favorDelta: 20,
        outcome: '怨灵在超度中露出解脱的表情。安息使者低声祈祷:"愿所有迷失的灵魂都找到归宿。"', companionReact: '回声轻声说:"...再见。"' },
      { label: '帮助怨灵寻找爱人', faction: 'haunted_wrath', favorDelta: 20,
        outcome: '你找到了他爱人的灵魂碎片，让他们在灵界重逢。怨灵的力量转化为了温暖的光。', companionReact: '回声的声音几乎听不见:"你...修复了一颗破碎的心。"' },
    ],
    repeatable: false,
  },
  {
    id: 'sky_c1', realmId: 'sky',
    title: '风的去向',
    setup: '天空中出现了一道新的风之轨迹。云中行者说这是通往新世界的风，应该追随。风暴骑士说这是危险的乱流，应该被封住。',
    options: [
      { label: '追随云中行者探索新世界', faction: 'sky_walkers', favorDelta: 20,
        outcome: '你乘风而起，看到了云层之上的璀璨星空——那是另一个未曾破碎的世界。', companionReact: '和风欢快地说:"看！世界之外还有世界！"' },
      { label: '支持风暴骑士封印乱流', faction: 'sky_riders', favorDelta: 20,
        outcome: '你们合力封住了风之轨迹。风暴骑士递给你一瓶风暴:"需要的时候，打开它。"', companionReact: '和风略带遗憾:"...安全第一，我理解。"' },
    ],
    repeatable: false,
  },
];

// ─── Utility Functions ────────────────────────────────────

/** Get the factions for a realm */
export function getFactionsForRealm(realmId: string): [FactionDef, FactionDef] | undefined {
  return FACTIONS[realmId];
}

/** Get unresolved conflict events for a realm */
export function getEventsForRealm(realmId: string, state: ConflictState): ConflictEvent[] {
  return CONFLICT_EVENTS.filter(e =>
    e.realmId === realmId &&
    (e.repeatable || !state.completedEvents.includes(e.id))
  );
}

/** Resolve a conflict event and return updated state */
export function resolveConflict(
  event: ConflictEvent,
  optionIndex: 0 | 1,
  state: ConflictState,
): { state: ConflictState; result: string; companionReact?: string } {
  const choice = event.options[optionIndex]!;
  const newState: ConflictState = {
    ...state,
    favor: { ...state.favor },
    completedEvents: [...state.completedEvents, event.id],
  };
  newState.favor[choice.faction] = (newState.favor[choice.faction] ?? 0) + choice.favorDelta;
  return {
    state: newState,
    result: choice.outcome,
    companionReact: choice.companionReact,
  };
}

/** Get the faction the player currently favors most in a realm */
export function getPreferredFaction(
  state: ConflictState,
  realmId: string,
): string | undefined {
  const factions = FACTIONS[realmId];
  if (!factions) return undefined;
  const f0 = state.favor[factions[0]!.id] ?? 0;
  const f1 = state.favor[factions[1]!.id] ?? 0;
  if (f0 > f1) return factions[0]!.id;
  if (f1 > f0) return factions[1]!.id;
  return undefined;
}
