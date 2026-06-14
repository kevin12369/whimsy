import React from 'react';
import { FeatureCard } from './Features/FeatureCard';
import { TemplatesIcon, ShareIcon, ShieldIcon, RecordIcon } from './Features/icons';

interface FeatureConfig {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
}

const FEATURES: FeatureConfig[] = [
  {
    id: 'templates',
    title: '15 套真差异化模板',
    description:
      '5 平台跳跃 + 5 射击 + 5 解谜,机制各异(钩爪 / 二段跳 / 反弹 / 计时 / 多 stage 进度),不是 spread 克隆的换皮',
    tags: ['5 platformer', '5 shooter', '5 puzzle', 'mechanics-distinct'],
    icon: <TemplatesIcon />,
  },
  {
    id: 'share',
    title: '/g/[id] URL hash 分享',
    description:
      '沙盒验证门:12 denylist + 200KB 体积 + iframe sandbox 三道闸门后,把游戏编码进 URL hash,接收方离线也能开',
    tags: ['URL hash', 'sandbox verified', 'IndexedDB backup'],
    icon: <ShareIcon />,
  },
  {
    id: 'denylist',
    title: '12 API 黑名单',
    description:
      'eval / Function / document.write / fetch / importScripts / XMLHttpRequest / WebSocket / Worker / postMessage / parent / top / window.parent 全部拦截,防 Unicode / hex / 字符串拼接绕过',
    tags: ['12 denylist', 'bypass-resistant', 'iframe sandbox'],
    icon: <ShieldIcon />,
  },
  {
    id: 'recording',
    title: '录屏 / Embed snippet',
    description:
      '30 秒录屏(.webm)本地下载,Embed snippet 自动生成 <iframe srcDoc=...> 复制即用,接 GItHub Pages / Notion 都不掉样式',
    tags: ['.webm', '<iframe>', 'copy-paste-ready'],
    icon: <RecordIcon />,
  },
];

/**
 * "Whimsy v2 真差异化" features section.
 *
 * 2x2 grid on md+ / single column on mobile. Each card highlights a
 * concrete artifact / guarantee the user gets: 15 templates, /g/
 * share, 12 denylist, recording/embed.
 */
export function Features() {
  return (
    <section
      className="bg-zinc-950 border-b border-zinc-800"
      aria-labelledby="features-title"
      data-testid="features"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col gap-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2
            id="features-title"
            className="text-3xl md:text-4xl font-bold text-zinc-50"
            data-testid="features-title"
          >
            Whimsy v2 真差异化
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            4 件不能跳的事 — 不是把 spread 克隆换 5 套皮肤就交差
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          data-testid="features-grid"
        >
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.id}
              title={f.title}
              description={f.description}
              tags={f.tags}
              icon={f.icon}
              testId={`feature-card-${f.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
