import Link from 'next/link';
import Head from 'next/head';
import { DemoVideo } from '../components/DemoVideo';

const NAME = '一念成游 · Whimsy';
const TAGLINE = '一句话开 game jam';
const SUBTITLE = '30 秒拿 5 个 Phaser 变体,挑一个导出源码接着改 — 独立游戏人的脚手架,不是教做游戏的 SaaS';
const DESCRIPTION =
  'Whimsy 让你用一句中文描述脑海里的游戏画面,30 秒内拿到 5 个 Phaser 3 小游戏变体,挑一个导出源码接着改。' +
  '不上 LLM 也能直接玩 3 套真模板。LLM 输出经纵深防御沙盒校验后丢进 iframe,' +
  '自迭代状态机让失败的代码 2 轮内自动修好。';
const GITHUB_URL = 'https://github.com/kevin12369/whimsy';
const DEMO_URL = 'https://kevin12369.github.io/whimsy/';
const IMAGE_SRC = '/whimsy/docs/img/main.png';
const OTHER_PROJECTS = [
  { name: '嘴笨助手 Sry', desc: '5 风格道歉信生成器', href: 'https://github.com/kevin12369/sry' },
  { name: '一念成游 Whimsy', desc: 'AI 2D 小游戏生成器', href: 'https://github.com/kevin12369/whimsy' },
  { name: '哼哼编曲 Hummingbird', desc: '哼唱→MIDI 编曲', href: 'https://github.com/kevin12369/hummingbird' },
];

export default function Portfolio() {
  return (
    <>
      <Head>
        <title>{NAME} — Portfolio</title>
        <meta name="description" content={TAGLINE} />
      </Head>
      <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 max-w-3xl mx-auto flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-semibold">{NAME}</h1>
          <h2 className="text-xl text-zinc-300 mt-2">{TAGLINE}</h2>
          <p className="text-zinc-400 mt-1">{SUBTITLE}</p>
        </header>
        <DemoVideo
          caption="30 秒录屏:开页 → 输入 prompt → 跑出游戏 → 复制链接 → 隐身窗打开"
        />
        <section className="rounded border border-zinc-800 overflow-hidden">
          <img
            src={IMAGE_SRC}
            alt={`${NAME} demo screenshot`}
            className="w-full"
            loading="lazy"
          />
        </section>
        <section className="prose prose-invert max-w-none">
          <p>{DESCRIPTION}</p>
          <h2>What you can do here</h2>
          <ul>
            <li>描述一个玩法 → 15 秒拿到可玩的 Phaser 3 游戏 HTML</li>
            <li>15 套预制模板无 LLM 调用 0 成本兜底(5 平台跳跃 + 5 射击 + 5 解谜,机制各异)</li>
            <li>主题色 / 玩家 / 敌人标签在生成前可调,prompt 跟着变;预设可保存复用</li>
            <li>本地 LLM( Ollama / LM Studio / vLLM / llama.cpp)一键切换,prompt 不离机</li>
            <li>纵深防御沙盒:11 个危险 API 黑名单 + 200KB 体积 + iframe sandbox</li>
            <li>3 按钮工具栏:复制 Phaser 代码 / 导出 HTML / 改一行重生成</li>
          </ul>
          <h2>How to run it for real</h2>
          <p>The live demo above is a portfolio preview. To run the real deal:</p>
          <ul>
            <li>
              See <a href={`${GITHUB_URL}/blob/main/docs/RUN-LOCALLY.md`} target="_blank" rel="noreferrer">docs/RUN-LOCALLY.md</a> for the 1-page clone-and-run guide.
            </li>
            <li>
              Or <a href={GITHUB_URL} target="_blank" rel="noreferrer">browse the source on GitHub</a>.
            </li>
          </ul>
          <h2>Links</h2>
          <ul>
            <li>
              <a href={DEMO_URL} target="_blank" rel="noreferrer">Live demo</a> (preview only — needs your local LLM to actually run generation)
            </li>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">github.com/kevin12369/whimsy</a>
            </li>
          </ul>
          <h2>Other projects in this portfolio</h2>
          <ul>
            {OTHER_PROJECTS.map((p) => (
              <li key={p.href}>
                <a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a> — {p.desc}
              </li>
            ))}
          </ul>
        </section>
        <footer>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← Back to demo</Link>
        </footer>
      </main>
    </>
  );
}