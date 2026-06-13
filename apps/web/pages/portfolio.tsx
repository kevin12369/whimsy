import Link from 'next/link';
import Head from 'next/head';

const NAME = '一念成游 · Whimsy';
const TAGLINE = '一句话生成可玩的 2D 小游戏';
const DESCRIPTION =
  'Whimsy 让你用一句中文描述脑海里的游戏画面,在 15 秒内拿到一个真的能玩的 Phaser 3 小游戏 HTML。' +
  '15 套预制模板(5 平台跳跃 + 5 射击 + 5 解谜) 0 成本兜底,LLM 输出经纵深防御沙盒校验后丢进 iframe,' +
  '自迭代状态机让失败的代码 2 轮内自动修好。';
const GITHUB_URL = 'https://github.com/kevin12369/whimsy';
const DEMO_URL = 'https://kevin12369.github.io/whimsy/';

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
          <p className="text-zinc-400 mt-1">{TAGLINE}</p>
        </header>
        <section className="rounded border border-zinc-800 overflow-hidden">
          <img
            src="/docs/img/main.png"
            alt={`${NAME} demo screenshot`}
            className="w-full"
          />
        </section>
        <section className="prose prose-invert max-w-none">
          <p>{DESCRIPTION}</p>
          <h2>What you can do here</h2>
          <ul>
            <li>描述一个玩法 → 15 秒拿到可玩的 Phaser 3 游戏 HTML</li>
            <li>15 套预制模板无 LLM 调用 0 成本兜底</li>
            <li>主题色 / 玩家 / 敌人标签在生成前可调,prompt 跟着变</li>
            <li>本地 LLM( Ollama / LM Studio / vLLM / llama.cpp)一键切换,prompt 不离机</li>
            <li>纵深防御沙盒:11 个危险 API 黑名单 + 200KB 体积 + iframe sandbox</li>
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
            <li><a href="https://kevin12369.github.io/sry/" target="_blank" rel="noreferrer">嘴笨助手 Sry</a> — 5 风格道歉信生成器</li>
            <li><a href="https://kevin12369.github.io/whimsy/portfolio" target="_blank" rel="noreferrer">一念成游 Whimsy</a> — AI 2D 小游戏生成器</li>
            <li><a href="https://kevin12369.github.io/hummingbird/" target="_blank" rel="noreferrer">哼哼编曲 Hummingbird</a> — 哼唱→MIDI 编曲</li>
          </ul>
        </section>
        <footer>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← Back to demo</Link>
        </footer>
      </main>
    </>
  );
}