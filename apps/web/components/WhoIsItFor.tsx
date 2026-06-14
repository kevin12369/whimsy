import React from 'react';

interface AudienceConfig {
  id: string;
  emoji: string;
  title: string;
  quote: string;
  scenarios: string;
  value: string;
}

const AUDIENCE: AudienceConfig[] = [
  {
    id: 'indie',
    emoji: '🎮',
    title: 'itch.io 独立游戏人',
    quote:
      '我想先 30 秒搭一个能玩的小样发到 itch,再加自己的美术和机制,不想从空白工程起手',
    scenarios: 'prototype / 美术迭代 / 玩家试玩',
    value: '15 套真差异化模板 + 主题色/玩家/敌人标签可调,导出源码直接接自己工程',
  },
  {
    id: 'hackathon',
    emoji: '⏱️',
    title: '48h hackathon 参赛者',
    quote:
      '48 小时里我没有时间从 boilerplate 起手,我需要 5 个变体里挑一个快速进入 80% 完工状态',
    scenarios: '开赛 0-2h 选骨架 / 中期 2-12h 调机制 / 收尾 12-48h 接 UI',
    value: '5 变体 30 秒出 + 3 按钮导出 + /g/[id] 分享给队友看',
  },
  {
    id: 'teaching',
    emoji: '🧑‍🏫',
    title: 'Game design 入门教学',
    quote:
      '我教学生 game design 的第一周:什么样的机制带来什么样的体验,Phaser 工程太重了讲不清楚',
    scenarios: '第一周机制讲解 / 中期原型验证 / 期末项目脚手架',
    value: '15 套机制各异的真模板,学生改一个变量就看出机制变化,0 部署门槛',
  },
];

/**
 * "这是给谁用的?" — three audience personas.
 *
 * Single column on mobile, 3-column grid on md+. Each card shows an
 * emoji, title, a quoted voice, where they would use it, and the
 * core value prop.
 */
export function WhoIsItFor() {
  return (
    <section
      className="bg-zinc-950 border-b border-zinc-800"
      aria-labelledby="who-is-it-for-title"
      data-testid="who-is-it-for"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="who-is-it-for-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="who-is-it-for-title"
          >
            这是给谁用的?
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          data-testid="who-is-it-for-grid"
        >
          {AUDIENCE.map((a) => (
            <article
              key={a.id}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
              data-testid={`who-card-${a.id}`}
            >
              <div className="text-3xl" aria-hidden data-testid="who-card-emoji">
                {a.emoji}
              </div>
              <h3
                className="text-lg font-semibold text-zinc-50"
                data-testid="who-card-title"
              >
                {a.title}
              </h3>
              <p
                className="text-sm text-zinc-300 leading-relaxed italic"
                data-testid="who-card-quote"
              >
                &ldquo;{a.quote}&rdquo;
              </p>
              <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/60">
                <p className="text-xs text-zinc-500" data-testid="who-card-scenarios">
                  场景:<span className="text-zinc-300">{a.scenarios}</span>
                </p>
                <p className="text-xs text-zinc-500" data-testid="who-card-value">
                  价值:<span className="text-zinc-300">{a.value}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhoIsItFor;
