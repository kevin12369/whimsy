/**
 * Moral Choice Nodes — standalone ethical dilemmas encountered during expedition.
 * Unlike domain conflicts (faction politics), these are personal moral tests.
 * Choices affect bond XP, fragments, HP, or the narrative ending.
 */

export interface MoralChoice {
  id: string;
  trigger: 'layer_0' | 'layer_2' | 'layer_4' | 'any_mid';
  title: string;
  /** The moral dilemma narrative */
  setup: string;
  options: [MoralOption, MoralOption];
  /** If true, this choice is flagged for the ending calculation */
  affectsEnding: boolean;
  /** Minimum bonds level required (0 = any) */
  minBondLevel: number;
}

export interface MoralOption {
  label: string;
  /** The moral category this choice represents */
  virtue: 'compassion' | 'sacrifice' | 'truth' | 'power' | 'freedom' | 'duty';
  outcomeText: string;
  effects: {
    bondXp?: number;     // Companion bond experience
    fragments?: number;  // Echo fragments gain/loss
    hpChange?: number;   // HP change
    favorTag?: string;   // Faction-like tag for ending calculation
    favorDelta?: number;
  };
}

export const MORAL_CHOICES: MoralChoice[] = [
  {
    id: 'moral_beggar',
    trigger: 'layer_0',
    title: '乞求者',
    setup: '路边坐着一个看不清面容的人影。它向你伸出一只透明的手，掌心有一块棱镜碎片的影像。\n"你收集了很多碎片...能给我一块吗？只要一块。它对我意义非凡。"\n你意识到，给它碎片意味着这个域的回声将永远缺少一块。',
    options: [
      {
        label: '给它一块碎片',
        virtue: 'compassion',
        outcomeText: '人影接过碎片，化作一道温暖的光消散了。你感到一阵平静，但你的碎片收集进度倒退了。',
        effects: { fragments: -3, bondXp: 20, favorTag: 'compassion', favorDelta: 10 },
      },
      {
        label: '拒绝，继续前进',
        virtue: 'duty',
        outcomeText: '你握紧了碎片。人影没有坚持，只是慢慢暗淡了下去。你继续前行，但总觉得背后有双眼睛在看着你。',
        effects: { fragments: 0, bondXp: 5, favorTag: 'duty', favorDelta: 5 },
      },
    ],
    affectsEnding: true,
    minBondLevel: 0,
  },
  {
    id: 'moral_trapped_soul',
    trigger: 'layer_2',
    title: '被困的灵魂',
    setup: '你发现一个发光的球体，里面封存着一个灵魂。它看起来已经在这里困了很久了。灵魂向你传递了一个微弱的信号：\n"帮帮我...我的枷锁在你脚下的法阵上。站上去，用你的生命力激活它。"\n但你感觉，如果站上去，你会失去一部分自己。',
    options: [
      {
        label: '站上法阵，释放灵魂',
        virtue: 'sacrifice',
        outcomeText: '你站上了法阵。一股力量抽走了你的部分生命力，但灵魂挣脱了束缚。它在消散前向你点了点头："你会得到回报的。"你感觉身体轻了一些，但心里很暖。',
        effects: { hpChange: -1, bondXp: 30, favorTag: 'sacrifice', favorDelta: 15 },
      },
      {
        label: '离开，不冒这个险',
        virtue: 'duty',
        outcomeText: '你转身离开。身后传来灵魂的叹息，但你告诉自己——你还有更重要的使命。',
        effects: { bondXp: 5, favorTag: 'duty', favorDelta: 5 },
      },
    ],
    affectsEnding: true,
    minBondLevel: 1,
  },
  {
    id: 'moral_knowledge',
    trigger: 'layer_4',
    title: '知识的代价',
    setup: '你遇到了一座古老的石碑。上面刻着关于棱镜真相的文字——但文字被某种力量加密了。一个声音在你脑海中响起：\n"我可以告诉你一切。你所追寻的答案。棱镜为什么碎裂。世界的本质是什么。\n但代价是...你必须忘记今天之前的一切。所有记忆。"',
    options: [
      {
        label: '接受交易，得知真相',
        virtue: 'truth',
        outcomeText: '信息涌入你的脑海。你看到了棱镜碎裂的真相——它是被创造出来的。但随之而来的是遗忘。你不记得自己的名字、来历、为什么要收集碎片。你只知道一件事：你必须继续。',
        effects: { fragments: 5, bondXp: 15, favorTag: 'truth', favorDelta: 10 },
      },
      {
        label: '拒绝，珍惜你所拥有的',
        virtue: 'compassion',
        outcomeText: '"你选择了记忆。"那个声音消失了。石碑上的文字闪了闪，变成了你能看懂的语言——上面只有一句话："最勇敢的选择，是在不知道真相的情况下依然相信。"',
        effects: { bondXp: 25, favorTag: 'compassion', favorDelta: 15 },
      },
    ],
    affectsEnding: true,
    minBondLevel: 2,
  },
  {
    id: 'moral_prisoner',
    trigger: 'any_mid',
    title: '伙伴的束缚',
    setup: '你的同伴停下了脚步，看着你，眼神里有一种你从未见过的认真。\n"你知道吗...我跟着你，不完全是因为我选择了你。\n我被某种东西束缚着——棱镜的力量让我必须跟随一个收集碎片的人。\n如果你愿意...你可以切断这个束缚。我会自由。但你可能再也见不到我了。"',
    options: [
      {
        label: '切断束缚，让它自由',
        virtue: 'freedom',
        outcomeText: '你切断了你和同伴之间的无形纽带。它看着你，眼中闪烁着泪光——然后化作风/光/水流散去。临走前，它在你心中留下了一句话："谢谢你。我永远不会忘记你。"',
        effects: { bondXp: -999, fragments: 3, favorTag: 'freedom', favorDelta: 20 },
      },
      {
        label: '请求它留下',
        virtue: 'duty',
        outcomeText: '你伸手握住了它的手。"我需要你。"它低下了头。束缚没有被切断——但这一次，它是自己选择留下的。',
        effects: { bondXp: 30, favorTag: 'duty', favorDelta: 10 },
      },
    ],
    affectsEnding: true,
    minBondLevel: 3,
  },
  {
    id: 'moral_altar',
    trigger: 'any_mid',
    title: '祭坛的试探',
    setup: '你看到一座陌生的祭坛。它看起来和融合祭坛很像，但散发着不祥的气息。祭坛上刻着字：\n"献上你的一切。放弃所有的碎片、物品、记忆——我将给你一个全新的开始。\n你将在另一个世界醒来。一个棱镜从未存在过的世界。一个幸福的世界。"',
    options: [
      {
        label: '献上一切，获得新生',
        virtue: 'power',
        outcomeText: '你感到自己被抽空——碎片、物品、记忆，一切都被祭坛吸收了。世界扭曲、旋转。你闭上眼...\n...然后你醒了。\n在另一个世界。阳光明媚。没有棱镜。没有碎片。你在自己的床上。窗外有人在叫你吃早餐。一切都很完美。\n但你总觉得心里空落落的。',
        effects: { fragments: -99, bondXp: -50, favorTag: 'power', favorDelta: 20 },
      },
      {
        label: '拒绝，接受这个世界的真相',
        virtue: 'truth',
        outcomeText: '"明智的选择。"祭坛的声音逐渐远去。"幸福不应该是逃避的借口。"你感到坚定了一些。这个世界的破碎——你愿意面对它。',
        effects: { fragments: 3, hpChange: 1, bondXp: 20, favorTag: 'truth', favorDelta: 15 },
      },
    ],
    affectsEnding: true,
    minBondLevel: 1,
  },
];

/** Get a moral choice eligible for the current layer, avoiding repeats */
export function getMoralChoice(
  layer: number,
  bondLevel: number,
  completedIds: string[],
): MoralChoice | undefined {
  const candidates = MORAL_CHOICES.filter(c =>
    !completedIds.includes(c.id) &&
    c.minBondLevel <= bondLevel &&
    (c.trigger === 'any_mid' || c.trigger === `layer_${layer}`)
  );
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
