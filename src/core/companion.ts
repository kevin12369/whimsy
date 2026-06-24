/**
 * Companion system — types, bond mechanics, companion definitions.
 */

export type CompanionId = 'moss' | 'tide' | 'ember' | 'pixel' | 'mirage'
  | 'frost' | 'spore' | 'prism' | 'glitch' | 'echo' | 'zephyr';

export type BondLevel = 1 | 2 | 3 | 4;

export interface CompanionDef {
  id: CompanionId;
  name: string;
  title: string;
  realmId: string;
  color: number;       // Visual color
  personality: string; // Short description
  passiveDesc: string; // What it does for the player
  bondXpThreshold: [number, number, number, number]; // [L1, L2, L3, L4]
}

export interface CompanionState {
  companionId: CompanionId;
  bondXp: number;
  bondLevel: BondLevel;
  recruitedAt: number;
  dialoguesUnlocked: number[];
}

export const COMPANIONS: CompanionDef[] = [
  {
    id: 'moss',
    name: '苔藓',
    title: '森林的守望者',
    realmId: 'forest',
    color: 0x52b788,
    personality: '害羞而好奇，总是躲在树后观察你',
    passiveDesc: '探测周围4格内的物品和碎片',
    bondXpThreshold: [0, 100, 300, 600],
  },
  {
    id: 'tide',
    name: '潮汐',
    title: '深海的歌者',
    realmId: 'ocean',
    color: 0x00b4d8,
    personality: '忧郁而睿智，记得世界破碎前的声音',
    passiveDesc: '水域移动减速降低至25%',
    bondXpThreshold: [0, 120, 350, 700],
  },
  {
    id: 'ember',
    name: '余烬',
    title: '地牢的守护者',
    realmId: 'dungeon',
    color: 0xff9b54,
    personality: '勇敢而沉默，背负着过去的失败',
    passiveDesc: '光照范围扩大2格',
    bondXpThreshold: [0, 110, 320, 650],
  },
  // ─── New companions for remaining 8 realms ──────────────
  {
    id: 'pixel',
    name: '像素',
    title: '星环的守望AI',
    realmId: 'scifi',
    color: 0x5bc0be,
    personality: '逻辑严密但情感程序出了点故障',
    passiveDesc: '每6帧揭示周围1格内的隐藏墙壁',
    bondXpThreshold: [0, 130, 360, 720],
  },
  {
    id: 'mirage',
    name: '幻影',
    title: '热沙中的旅者',
    realmId: 'desert',
    color: 0xff9b54,
    personality: '言语捉摸不定，像是沙漠里的海市蜃楼',
    passiveDesc: '4格范围内的陷阱瓦片发出微光',
    bondXpThreshold: [0, 100, 310, 620],
  },
  {
    id: 'frost',
    name: '霜语',
    title: '永冻之地的守护灵',
    realmId: 'tundra',
    color: 0x90e0ef,
    personality: '沉默寡言，说话时有冰晶碎裂的声音',
    passiveDesc: '附近2格内的水面自动冻结',
    bondXpThreshold: [0, 110, 330, 680],
  },
  {
    id: 'spore',
    name: '孢子',
    title: '雨林的低语者',
    realmId: 'jungle',
    color: 0x52b788,
    personality: '活泼好动，身上总是带着泥土和花香',
    passiveDesc: '物品探测范围翻倍（8格）',
    bondXpThreshold: [0, 90, 280, 580],
  },
  {
    id: 'prism',
    name: '棱晶',
    title: '水晶洞穴的共鸣者',
    realmId: 'crystal',
    color: 0xb5179e,
    personality: '说话自带混响，像光穿过水晶时的折射',
    passiveDesc: '回声碎片探测半径+3格',
    bondXpThreshold: [0, 120, 340, 690],
  },
  {
    id: 'glitch',
    name: '乱码',
    title: '霓虹之城的故障体',
    realmId: 'neon',
    color: 0xffbe0b,
    personality: '断断续续...像...信号...不好...',
    passiveDesc: '冲刺冷却缩短30%',
    bondXpThreshold: [0, 140, 370, 750],
  },
  {
    id: 'echo',
    name: '回声',
    title: '亡灵之地的徘徊者',
    realmId: 'haunted',
    color: 0x916bbf,
    personality: '声音空洞而遥远，仿佛从另一个维度传来',
    passiveDesc: '5格范围内自动揭示隐藏陷阱',
    bondXpThreshold: [0, 100, 300, 640],
  },
  {
    id: 'zephyr',
    name: '和风',
    title: '天际的流浪者',
    realmId: 'sky',
    color: 0xadb5bd,
    personality: '轻快而自由，说话像风一样掠过耳畔',
    passiveDesc: '无视所有地形减速',
    bondXpThreshold: [0, 90, 270, 560],
  },
];

// ─── QUEST GIVER SYSTEM ──────────────────────────────────

export interface QuestDef {
  id: string;
  description: string;
  type: 'reach_layer' | 'collect_fragments' | 'deliver_item' | 'use_fusion';
  target: number | string; // layer count, fragment count, item name
  rewardFavor: number;
  rewardDialogue: string;
}

export interface QuestGiverDef {
  npcName: string;
  realmId: string;
  companionId: CompanionId;
  greeting: string;
  quests: QuestDef[];
  favorThresholds: [number, number, number]; // favor needed for L1/L2/L3 dialogue
  recruitDialogue: string; // What they say when joining
}

export const QUEST_GIVERS: QuestGiverDef[] = [
  {
    npcName: '树灵长者',
    realmId: 'forest',
    companionId: 'moss',
    greeting: '远方的旅人...你身上有棱镜的气息。',
    quests: [
      { id: 'forest_q1', type: 'reach_layer', target: 2, rewardFavor: 40,
        description: '到达森林的第3层', rewardDialogue: '你走得不慢...证明你的决心。' },
      { id: 'forest_q2', type: 'collect_fragments', target: 3, rewardFavor: 40,
        description: '收集3个回声碎片', rewardDialogue: '你开始理解这个世界了吗？' },
      { id: 'forest_q3', type: 'use_fusion', target: 1, rewardFavor: 40,
        description: '进行一次融合', rewardDialogue: '创造与毁灭...一体两面。' },
    ],
    favorThresholds: [40, 80, 120],
    recruitDialogue: '苔藓这孩子，一直很孤独。你带它去看看外面的世界吧。',
  },
  {
    npcName: '潮汐祭司',
    realmId: 'ocean',
    companionId: 'tide',
    greeting: '潮汐带来远方的消息...包括你的。',
    quests: [
      { id: 'ocean_q1', type: 'reach_layer', target: 3, rewardFavor: 40,
        description: '到达海洋的第4层', rewardDialogue: '深海没有吓退你。' },
      { id: 'ocean_q2', type: 'collect_fragments', target: 5, rewardFavor: 40,
        description: '收集5个回声碎片', rewardDialogue: '你收集的每一片光，都是海洋的记忆。' },
    ],
    favorThresholds: [40, 80, 120],
    recruitDialogue: '潮汐想跟你走。它在你的眼里看到了同一种忧郁。',
  },
  {
    npcName: '地下铁匠',
    realmId: 'dungeon',
    companionId: 'ember',
    greeting: '脚步声明亮...你不属于黑暗。',
    quests: [
      { id: 'dungeon_q1', type: 'reach_layer', target: 3, rewardFavor: 40,
        description: '到达地牢的第4层', rewardDialogue: '穿过黑暗，你还在走。' },
      { id: 'dungeon_q2', type: 'deliver_item', target: 'rose potion', rewardFavor: 50,
        description: '带来一个 rose potion', rewardDialogue: '这瓶药水...足够治疗过去的伤口。' },
    ],
    favorThresholds: [40, 90, 120],
    recruitDialogue: '余烬一直想找个人类同伴。你合格了。',
  },
  // ─── New quest givers ───────────────────────────────────
  {
    npcName: '星环工程师',
    realmId: 'scifi',
    companionId: 'pixel',
    greeting: '你的生物特征...不符合本设施的安全协议。但我不在乎。',
    quests: [
      { id: 'scifi_q1', type: 'reach_layer', target: 2, rewardFavor: 40,
        description: '到达星环的第3层', rewardDialogue: '系统记录确认。你通过了。' },
      { id: 'scifi_q2', type: 'collect_fragments', target: 3, rewardFavor: 40,
        description: '收集3个回声碎片', rewardDialogue: '这些数据碎片...我可以读取它们的核心信息。' },
    ],
    favorThresholds: [40, 80, 120],
    recruitDialogue: '像素—我的AI伙伴。它需要感受一些...人类的东西。你带它去吧。',
  },
  {
    npcName: '沙舟车长',
    realmId: 'desert',
    companionId: 'mirage',
    greeting: '沙漠里不常有访客。坐，喝杯沙茶。',
    quests: [
      { id: 'desert_q1', type: 'reach_layer', target: 3, rewardFavor: 40,
        description: '到达沙漠的第4层', rewardDialogue: '穿越沙漠需要的不只是水，是信念。' },
      { id: 'desert_q2', type: 'deliver_item', target: 'sun coin', rewardFavor: 50,
        description: '带来一个 sun coin', rewardDialogue: '这枚金币...上面的光芒还不是黄昏的颜色。' },
    ],
    favorThresholds: [40, 85, 120],
    recruitDialogue: '幻影一直在沙漠里游荡，寻找能看透它的人。你合格了。',
  },
  {
    npcName: '冰原学者',
    realmId: 'tundra',
    companionId: 'frost',
    greeting: '你呼出的白气...在讲述一个温暖世界的故事。',
    quests: [
      { id: 'tundra_q1', type: 'reach_layer', target: 2, rewardFavor: 40,
        description: '到达冰原的第3层', rewardDialogue: '寒冷没有阻挡你。和它一样固执。' },
      { id: 'tundra_q2', type: 'collect_fragments', target: 4, rewardFavor: 45,
        description: '收集4个回声碎片', rewardDialogue: '这些光在冰层下闪烁的样子，像远古的星星。' },
    ],
    favorThresholds: [40, 85, 120],
    recruitDialogue: '霜语从世界破碎后就没再说过话。它选择了你。',
  },
  {
    npcName: '雨林药师',
    realmId: 'jungle',
    companionId: 'spore',
    greeting: '哦！新鲜的空气！等等，那是人类的空气吗？',
    quests: [
      { id: 'jungle_q1', type: 'reach_layer', target: 2, rewardFavor: 40,
        description: '到达雨林的第3层', rewardDialogue: '你的步伐比我见过的任何人类都稳健。' },
      { id: 'jungle_q2', type: 'deliver_item', target: 'rose potion', rewardFavor: 45,
        description: '带来一个 rose potion', rewardDialogue: '这瓶药水的成分里...有棱镜的味道？' },
    ],
    favorThresholds: [40, 80, 120],
    recruitDialogue: '孢子一直想找个伴一起冒险。它说你的灵魂闻起来像春天。',
  },
  {
    npcName: '水晶祭司',
    realmId: 'crystal',
    companionId: 'prism',
    greeting: '你的到来，让水晶们唱起了歌。你听到了吗？',
    quests: [
      { id: 'crystal_q1', type: 'reach_layer', target: 3, rewardFavor: 40,
        description: '到达水晶域的第4层', rewardDialogue: '水晶的光芒因你的到来而更亮。' },
      { id: 'crystal_q2', type: 'use_fusion', target: 1, rewardFavor: 45,
        description: '进行一次融合', rewardDialogue: '融合...这正是水晶们一直在等待的。' },
    ],
    favorThresholds: [40, 90, 120],
    recruitDialogue: '棱晶说你的光谱很纯粹。这是它最高的称赞了。',
  },
  {
    npcName: '霓虹DJ',
    realmId: 'neon',
    companionId: 'glitch',
    greeting: '哒——哒——测试——呃，这玩意儿还开着吗？',
    quests: [
      { id: 'neon_q1', type: 'reach_layer', target: 2, rewardFavor: 40,
        description: '到达霓虹的第3层', rewardDialogue: '节奏感不错！你有没有考虑过当DJ？' },
      { id: 'neon_q2', type: 'collect_fragments', target: 3, rewardFavor: 40,
        description: '收集3个回声碎片', rewardDialogue: '这些光点...我能把它们编成一段Beats！' },
    ],
    favorThresholds: [40, 80, 120],
    recruitDialogue: '乱码说他/她/它想跟你混。说实话我也搞不清它到底是什么。',
  },
  {
    npcName: '墓园守夜人',
    realmId: 'haunted',
    companionId: 'echo',
    greeting: '活人...不，你是活的。真是稀客。',
    quests: [
      { id: 'haunted_q1', type: 'reach_layer', target: 3, rewardFavor: 40,
        description: '到达亡灵的第4层', rewardDialogue: '你穿过了那么多亡魂，却还带着温度。' },
      { id: 'haunted_q2', type: 'collect_fragments', target: 5, rewardFavor: 50,
        description: '收集5个回声碎片', rewardDialogue: '这些光芒...是那些未能安息的记忆。' },
    ],
    favorThresholds: [40, 90, 120],
    recruitDialogue: '回声已经很久没有和活人说过话了。它想跟你走。',
  },
  {
    npcName: '云霄行者',
    realmId: 'sky',
    companionId: 'zephyr',
    greeting: '能在这么高的地方看到你，真不容易。风告诉我有客人来了。',
    quests: [
      { id: 'sky_q1', type: 'reach_layer', target: 2, rewardFavor: 40,
        description: '到达天际的第3层', rewardDialogue: '你追上了风。不简单。' },
      { id: 'sky_q2', type: 'collect_fragments', target: 3, rewardFavor: 40,
        description: '收集3个回声碎片', rewardDialogue: '这些光芒...像风中的种子，飘向了远方。' },
    ],
    favorThresholds: [40, 80, 120],
    recruitDialogue: '和风说你的脚步很轻，像一个天生的天空行者。跟它去吧。',
  },
];

export function getQuestGiverForRealm(realmId: string): QuestGiverDef | undefined {
  return QUEST_GIVERS.find(qg => qg.realmId === realmId);
}

export function getQuestProgress(questId: string, saveData: { completedQuests: string[]; favor: Record<string, number> }): { completed: boolean; favor: number } {
  const completed = saveData.completedQuests.includes(questId);
  const qg = QUEST_GIVERS.find(q => q.quests.some(qq => qq.id === questId));
  const favor = qg ? (saveData.favor[qg.npcName] ?? 0) : 0;
  return { completed, favor };
}

// ─── Bond System ─────────────────────────────────────────

export function getBondLevel(xp: number, thresholds: number[]): BondLevel {
  if (xp >= thresholds[3]!) return 4;
  if (xp >= thresholds[2]!) return 3;
  if (xp >= thresholds[1]!) return 2;
  return 1;
}

export function getBondProgress(xp: number, thresholds: number[]): { current: number; next: number } {
  const currentLevel = getBondLevel(xp, thresholds);
  if (currentLevel === 4) return { current: thresholds[3]!, next: thresholds[3]! };
  const currentThreshold = thresholds[currentLevel - 1]!;
  const nextThreshold = thresholds[currentLevel]!;
  return { current: xp - currentThreshold, next: nextThreshold - currentThreshold };
}

// ─── Companion Dialogues ─────────────────────────────────

export interface CompanionLine {
  trigger: 'enter_layer' | 'find_fragment' | 'fusion' | 'talk_npc' | 'near_exit' | 'low_hp' | 'idle';
  text: string;
  bondRequired: BondLevel;
}

export const COMPANION_DIALOGUES: Partial<Record<CompanionId, CompanionLine[]>> = {
  moss: [
    { trigger: 'enter_layer', text: '这片森林...比以前安静多了。', bondRequired: 1 },
    { trigger: 'enter_layer', text: '小心那些藤蔓，它们活着。', bondRequired: 2 },
    { trigger: 'find_fragment', text: '那是...棱镜的光芒。它还亮着。', bondRequired: 1 },
    { trigger: 'find_fragment', text: '我能感受到它传递的情感...悲伤。', bondRequired: 3 },
    { trigger: 'fusion', text: '你把两个东西合在一起了...就像棱镜曾经做的那样。', bondRequired: 2 },
    { trigger: 'near_exit', text: '准备好了吗？下一层会更难。', bondRequired: 1 },
    { trigger: 'low_hp', text: '你受伤了...等我一下，我找找附近有没有药草。', bondRequired: 2 },
    { trigger: 'idle', text: '...你听到什么了吗？', bondRequired: 1 },
    { trigger: 'idle', text: '世界破碎之前，这里到处是歌声。', bondRequired: 3 },
    { trigger: 'talk_npc', text: '他/她说的那些话...让我想起了一些事。', bondRequired: 2 },
  ],
  tide: [
    { trigger: 'enter_layer', text: '水的流动告诉我，前方有危险。', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这光芒...像极了那个黎明的海面。', bondRequired: 2 },
    { trigger: 'fusion', text: '融合...这是创造的行为。小心使用。', bondRequired: 1 },
    { trigger: 'low_hp', text: '让我用潮汐之力护住你的伤口。', bondRequired: 3 },
    { trigger: 'idle', text: '最深的海沟里，藏着最初的秘密。', bondRequired: 2 },
    { trigger: 'near_exit', text: '继续前进吧。我在你身后。', bondRequired: 1 },
  ],
  ember: [
    { trigger: 'enter_layer', text: '这里的光线不足以照亮真相。', bondRequired: 1 },
    { trigger: 'find_fragment', text: '棱镜的光芒...我曾经守护过它。', bondRequired: 2 },
    { trigger: 'fusion', text: '我曾经也尝试过融合...结果并不美好。', bondRequired: 3 },
    { trigger: 'low_hp', text: '站到我身后来。这次我不会再失败了。', bondRequired: 1 },
    { trigger: 'idle', text: '火焰在燃烧时最美丽，也最危险。', bondRequired: 2 },
    { trigger: 'near_exit', text: '走吧。无论前面有什么，我们一起面对。', bondRequired: 1 },
  ],
  // ─── New companion dialogues ────────────────────────────
  pixel: [
    { trigger: 'enter_layer', text: '环境扫描完毕。威胁等级: 中等。建议谨慎。', bondRequired: 1 },
    { trigger: 'enter_layer', text: '这个世界的物理规则...和我的数据库不一致。', bondRequired: 2 },
    { trigger: 'find_fragment', text: '检测到棱镜能量波形。异常。记录中。', bondRequired: 1 },
    { trigger: 'fusion', text: '融合操作完成了。结果: 出乎意料的有效。', bondRequired: 2 },
    { trigger: 'low_hp', text: '你的生命体征在下降。建议: 立即停止冒险。', bondRequired: 1 },
    { trigger: 'near_exit', text: '出口确认。合理的选择是继续前进。', bondRequired: 1 },
    { trigger: 'idle', text: '...我的情感模块好像出了个bug。我是不是...担心你？', bondRequired: 3 },
  ],
  mirage: [
    { trigger: 'enter_layer', text: '沙漠的每一粒沙都在讲述一个故事。你想听哪一颗？', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这光芒...像极了沙漠黄昏时的最后一缕阳光。', bondRequired: 2 },
    { trigger: 'fusion', text: '你把两个幻象合成了一个...新的幻象？还是真实？', bondRequired: 2 },
    { trigger: 'low_hp', text: '你看...那边有一个绿洲。是我的幻术，但休息一下也好。', bondRequired: 2 },
    { trigger: 'near_exit', text: '出口不远了。或者这只是我制造的幻觉？你猜。', bondRequired: 1 },
    { trigger: 'idle', text: '你觉得...我是真实的吗？', bondRequired: 3 },
  ],
  frost: [
    { trigger: 'enter_layer', text: '这里的温度...刚好。我喜欢。', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这块碎片里的温暖...让我感到陌生。', bondRequired: 2 },
    { trigger: 'fusion', text: '你把冰和火放在了一起...真美。', bondRequired: 3 },
    { trigger: 'low_hp', text: '我用冰封住了你的伤口。别动，会疼。', bondRequired: 2 },
    { trigger: 'near_exit', text: '走吧，前面有更冷的路等着我们。', bondRequired: 1 },
    { trigger: 'idle', text: '...雪崩的时候，没有一片雪花觉得自己有责任。', bondRequired: 3 },
  ],
  spore: [
    { trigger: 'enter_layer', text: '哇！这里的真菌种类比我老家多三倍！', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这光...它在和我的菌丝共鸣！', bondRequired: 1 },
    { trigger: 'fusion', text: '你把两个东西合成一个了！就像...就像蘑菇生长！', bondRequired: 2 },
    { trigger: 'low_hp', text: '我这里有药草！呃…虽然可能有点真菌在上面。', bondRequired: 2 },
    { trigger: 'near_exit', text: '出口到了！等等，我闻到了外面空气的味道...', bondRequired: 1 },
    { trigger: 'idle', text: '你知不知道森林里的每一棵树都通过真菌网络聊天？', bondRequired: 2 },
  ],
  prism: [
    { trigger: 'enter_layer', text: '水晶们说...你身上有光。很多光。', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这块碎片里的颜色...比我见过所有水晶加起来都多。', bondRequired: 2 },
    { trigger: 'fusion', text: '光的融合...产生了新的波长。', bondRequired: 3 },
    { trigger: 'low_hp', text: '我用水晶的能量包裹了你的伤口。会有点痒。', bondRequired: 2 },
    { trigger: 'near_exit', text: '前方...水晶在唱歌。它们在欢送我们。', bondRequired: 1 },
    { trigger: 'idle', text: '你发现了吗？光是有重量的。只是我们都习惯了它的轻盈。', bondRequired: 3 },
  ],
  glitch: [
    { trigger: 'enter_layer', text: '哦——新——地——图！刷——新——成——功！', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这——段——数——据——里——有——哭——声。', bondRequired: 2 },
    { trigger: 'fusion', text: '0和1...融...合成...新的...数字...生命？', bondRequired: 2 },
    { trigger: 'low_hp', text: '紧——急——协——议——启——动——！别——死——啊——！', bondRequired: 1 },
    { trigger: 'near_exit', text: '下——一——层——的——服——务——器——已——经——等——不——及——了。', bondRequired: 1 },
    { trigger: 'idle', text: '我...是不是...说太多...话了？系统...建议...闭嘴。', bondRequired: 2 },
  ],
  echo: [
    { trigger: 'enter_layer', text: '这个地方...我死过一次。或者说，我从未活过。', bondRequired: 1 },
    { trigger: 'find_fragment', text: '记忆中...的光...好刺眼...但又好温暖。', bondRequired: 2 },
    { trigger: 'fusion', text: '把破碎的拼在一起...你相信它们能复原吗？', bondRequired: 3 },
    { trigger: 'low_hp', text: '我看过很多次死亡。这一次，我不想看。', bondRequired: 2 },
    { trigger: 'near_exit', text: '出口...生者和死者的界限。', bondRequired: 1 },
    { trigger: 'idle', text: '你相信来世吗？我每天都在经历它。', bondRequired: 3 },
  ],
  zephyr: [
    { trigger: 'enter_layer', text: '这里的上升气流刚刚好！你也感觉到了吗？', bondRequired: 1 },
    { trigger: 'find_fragment', text: '这块碎片里...锁着一阵很古老的风。', bondRequired: 2 },
    { trigger: 'fusion', text: '你把两种气流搅在一起了！哇，新的风种！', bondRequired: 2 },
    { trigger: 'low_hp', text: '让我用风托住你。别挣扎，感觉就像躺在云上。', bondRequired: 1 },
    { trigger: 'near_exit', text: '下一层的风在呼唤我们。走吧！', bondRequired: 1 },
    { trigger: 'idle', text: '你知道风为什么永远不会累吗？因为每一种疲惫，它都吹走了。', bondRequired: 3 },
  ],
};

// ─── Story Fragments ─────────────────────────────────────

export interface StoryFragment {
  id: string;
  realmId: string;
  title: string;
  text: string;
  companionHint?: CompanionId; // Which companion can comment on this
}

export const STORY_FRAGMENTS: StoryFragment[] = [
  {
    id: 'forest_01',
    realmId: 'forest',
    title: '黎明的第一个裂痕',
    text: '世界破碎的那天，森林最先感受到了。不是地震，不是风暴——而是一声从中心扩散的碎裂声，像是玻璃，又像是心跳。树木同时弯下了腰，仿佛在告别什么。',
    companionHint: 'moss',
  },
  {
    id: 'forest_02',
    realmId: 'forest',
    title: '棱镜的低语',
    text: '在森林最古老的那棵树下，埋着棱镜的第一块碎片。它的光芒微弱但执着，像是不甘心被遗忘。据说，触碰它的人会看到世界原本的样子。',
    companionHint: 'moss',
  },
  {
    id: 'ocean_01',
    realmId: 'ocean',
    title: '海洋的哀歌',
    text: '海洋记得一切。棱镜碎裂时，海水倒灌入天空，持续了七天七夜。海底的遗迹被冲刷到了海岸上，那些建筑的风格不属于任何已知的文明。',
    companionHint: 'tide',
  },
  {
    id: 'dungeon_01',
    realmId: 'dungeon',
    title: '最后的守护者',
    text: '地下城堡的最深处，有一扇从未被打开过的门。门上刻着：\n"当棱镜碎时，门自会开。\n当门开时，切勿回头。"',
    companionHint: 'ember',
  },
  // ─── New story fragments for remaining realms ───────────
  {
    id: 'scifi_01',
    realmId: 'scifi',
    title: '棱镜数据库',
    text: '星环空间站的核心数据库里，保存着棱镜碎裂前最后一秒的完整记录。数据显示，那不是一次意外——是棱镜自己选择了碎裂。',
    companionHint: 'pixel',
  },
  {
    id: 'desert_01',
    realmId: 'desert',
    title: '沙下之城',
    text: '沙漠深处，有一座被黄沙掩埋的城市。它的建筑风格不属于任何已知的文明。市民的雕像全都面向同一个方向——那是棱镜曾经存在的地方。',
    companionHint: 'mirage',
  },
  {
    id: 'tundra_01',
    realmId: 'tundra',
    title: '冻结的瞬间',
    text: '在冰原最厚的那块冰层下，冻结着一个完整的瞬间：棱镜碎裂时光芒扩散的波纹，被寒冷永久地定格在了那里。',
    companionHint: 'frost',
  },
  {
    id: 'jungle_01',
    realmId: 'jungle',
    title: '菌丝网络',
    text: '雨林的地底有着绵延数百公里的真菌网络。它们是这个世界上最早的幸存者。菌丝记得棱镜碎裂时，大地如何因为悲伤而颤抖。',
    companionHint: 'spore',
  },
  {
    id: 'crystal_01',
    realmId: 'crystal',
    title: '水晶的记忆',
    text: '每一块水晶都储存着一段记忆。最深处的那些水晶储存的不是图像，不是声音——而是一种感觉：棱镜碎裂前那一刻的平静。',
    companionHint: 'prism',
  },
  {
    id: 'neon_01',
    realmId: 'neon',
    title: '霓虹的梦境',
    text: '霓虹城的每一个霓虹灯管的闪烁频率，都对应着一个早已消失的文明的电波信号。那些信号里，重复最多的词是"回家"。',
    companionHint: 'glitch',
  },
  {
    id: 'haunted_01',
    realmId: 'haunted',
    title: '亡魂的合唱',
    text: '亡者之地的上空，每夜都能听到成千上万的亡魂在合唱。那不是哀歌——而是一首摇篮曲，哄着这个世界入睡。',
    companionHint: 'echo',
  },
  {
    id: 'sky_01',
    realmId: 'sky',
    title: '天空的裂痕',
    text: '最高的云层之上，有一道肉眼看不见的裂痕。那是棱镜碎裂时，天空被撕开的第一道伤口。风从那里灌进来，带来了另一个世界的气味。',
    companionHint: 'zephyr',
  },
  // ─── Second set (02) — each realm's deeper story ────────
  {
    id: 'forest_02b',
    realmId: 'forest',
    title: '树根的密语',
    text: '森林中最古老的树根下，埋藏着棱镜的第一任守护者的遗骨。他是第一个听到棱镜哭的人。他的日记最后一页写着：\n"它不只是碎了——它想让什么出去。"',
    companionHint: 'moss',
  },
  {
    id: 'ocean_02',
    realmId: 'ocean',
    title: '沉没的钟楼',
    text: '海底最深处的峡谷里，有一座倒悬的钟楼。它的钟仍然在摆动，敲出的声音不是钟鸣——而是棱镜碎裂瞬间的录音。每一响都让海水颤抖一次。',
    companionHint: 'tide',
  },
  {
    id: 'dungeon_02',
    realmId: 'dungeon',
    title: '囚徒的刻痕',
    text: '地牢最深处的囚室墙上，刻满了同一种符号。翻译过来的意思是：\n"门会在棱镜碎后打开。不要出去。"\n下面还有一行字，笔迹不同：\n"太晚了。"',
    companionHint: 'ember',
  },
  {
    id: 'scifi_02',
    realmId: 'scifi',
    title: '最后的日志',
    text: '空间站AI在棱镜碎裂前7秒留下的最后一段日志：\n"检测到棱镜内部出现意识信号。它不是物体。它是活的。它在害怕什么。"\n日志到此中断。',
    companionHint: 'pixel',
  },
  {
    id: 'desert_02',
    realmId: 'desert',
    title: '风蚀的壁画',
    text: '沙漠废墟的一面墙上，有一幅被风沙侵蚀了大半的壁画。残存的部分显示：一群人在向一个发光的菱形物体跪拜。画的最上方，有一个黑色的圆。',
    companionHint: 'mirage',
  },
  {
    id: 'tundra_02',
    realmId: 'tundra',
    title: '冰封的花园',
    text: '在冰原的中心，有一片被完美冻结的花园。花朵仍然是绽放的姿态，颜色鲜艳如初。它们不知道自己已经死了多少年。',
    companionHint: 'frost',
  },
  {
    id: 'jungle_02',
    realmId: 'jungle',
    title: '藤蔓中的雕像',
    text: '雨林深处有一座被藤蔓完全缠绕的人形雕像。清理掉藤蔓后，发现雕像的脸上带着微笑——那是一种如释重负的表情。',
    companionHint: 'spore',
  },
  {
    id: 'crystal_02',
    realmId: 'crystal',
    title: '共鸣的洞穴',
    text: '水晶洞穴里有一个奇特的自然现象：当你站在某个特定位置时，所有水晶会同时发出同一频率的共鸣。那个频率，和人类心跳的频率一模一样。',
    companionHint: 'prism',
  },
  {
    id: 'neon_02',
    realmId: 'neon',
    title: '废弃的服务器',
    text: '霓虹城的底层有一间被遗忘的服务器机房。其中一台服务器还在运行，屏幕上不断重复着同一句话：\n"棱镜计划——代号：方舟。阶段：失败。"',
    companionHint: 'glitch',
  },
  {
    id: 'haunted_02',
    realmId: 'haunted',
    title: '镜中的倒影',
    text: '亡者之地的城堡里有一面巨大的镜子。据说站在它面前，看到的不是自己——而是棱镜碎裂时，站在它面前的那个人。他们都在哭。',
    companionHint: 'echo',
  },
  {
    id: 'sky_02',
    realmId: 'sky',
    title: '漂浮的岛屿',
    text: '天空中有一座倒悬的岛屿，上面的建筑不属于任何已知文明。建筑的大门上刻着一行字：\n"当棱镜碎时，回家的路就开了。"',
    companionHint: 'zephyr',
  },
  // ─── Third set (03) — the final revelations ────────────
  {
    id: 'forest_03',
    realmId: 'forest',
    title: '落叶的归处',
    text: '森林深处有一片空地，那里的树叶从不落下。它们悬在半空中，像是时间被按下了暂停键。有人说，这是棱镜碎裂前最后看到的一幕。',
    companionHint: 'moss',
  },
  {
    id: 'ocean_03',
    realmId: 'ocean',
    title: '深渊的光',
    text: '海洋最深处的海沟底部，有一束从地心射出的光。它穿透了海水、穿透了岩层、穿透了历史。接触到它的人都说，那光里有棱镜的声音。',
    companionHint: 'tide',
  },
  {
    id: 'dungeon_03',
    realmId: 'dungeon',
    title: '门后的世界',
    text: '地牢那扇从未被打开的门后，据说什么都没有——不是空的"没有"，而是概念上的"没有"：没有空间、没有时间、没有声音。只有棱镜的回声在回荡。',
    companionHint: 'ember',
  },
  {
    id: 'scifi_03',
    realmId: 'scifi',
    title: '星环的坟墓',
    text: '星环空间站的外壳上，嵌满了棱镜的碎片。它们像星星一样排列，形成了一幅星图。那星图指向的方向，不在任何已知的星系中。',
    companionHint: 'pixel',
  },
  {
    id: 'desert_03',
    realmId: 'desert',
    title: '流沙下的宫殿',
    text: '沙漠最深处，流沙之下埋着一座完整的宫殿。它的建筑风格与地面上任何文明都不同。大厅中央有一个空着的王座，王座上放着一块棱镜的碎片。',
    companionHint: 'mirage',
  },
  {
    id: 'tundra_03',
    realmId: 'tundra',
    title: '永恒的冬天',
    text: '冰原上的暴风雪已经持续了不知多少年。有人说，风雪是从棱镜碎裂的那一刻开始的。这场暴风雪不是天气——是世界在发抖。',
    companionHint: 'frost',
  },
  {
    id: 'jungle_03',
    realmId: 'jungle',
    title: '腐化的心',
    text: '雨林的中心有一棵巨大的枯树。它的内部是空的，像一个被挖走心脏的胸腔。树洞底部，有一个由藤蔓编织成的茧。茧的形状，和棱镜一模一样。',
    companionHint: 'spore',
  },
  {
    id: 'crystal_03',
    realmId: 'crystal',
    title: '棱镜的碎片',
    text: '水晶洞最深处的祭坛上，供奉着一块拳头大小的棱镜碎片。它是所有碎片中最大的一块。靠近它时，能听到微弱的声音——像是一个人在道歉。',
    companionHint: 'prism',
  },
  {
    id: 'neon_03',
    realmId: 'neon',
    title: '最后的广播',
    text: '霓虹城的最高塔顶端，有一个从未停止广播的信号塔。它发送的不是无线电波——而是一个重复的、简单的信息：\n"我们在这里。来找我们。"',
    companionHint: 'glitch',
  },
  {
    id: 'haunted_03',
    realmId: 'haunted',
    title: '未完成的告别',
    text: '亡者之地最古老的那座坟墓里，没有尸体。墓志铭上写着：\n"这里埋着一个人还没来得及说出口的再见。"\n据说棱镜碎裂时，所有的告别都失去了方向。',
    companionHint: 'echo',
  },
  {
    id: 'sky_03',
    realmId: 'sky',
    title: '风的声音',
    text: '天空的最高处，风会发出一种特殊的呼啸声。那不是风穿过峡谷的声音——是棱镜碎裂时发出的尖叫，被风带到了世界的每一个角落。',
    companionHint: 'zephyr',
  },
];
