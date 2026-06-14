import React from 'react';
import { DemoVideo } from './DemoVideo';

/**
 * Hero section for the Whimsy landing page.
 *
 * Left column: brand tag, headline, sub-headline, two CTAs.
 * Right column: DemoVideo (30s autoplay muted loop).
 *
 * The headline h1 here is the SINGLE h1 on the page; the header
 * uses a <span> (no h1) to keep the document a11y tree clean.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="bg-gradient-to-b from-zinc-950 to-zinc-900 border-b border-zinc-800"
      data-testid="hero"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <div className="text-sm text-violet-400 font-medium tracking-wide">
            AI Game Jam Starter
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-zinc-50 leading-tight tracking-tight"
            data-testid="hero-headline"
          >
            一句话开 game jam
          </h1>
          <p className="text-xl text-zinc-300">
            30 秒拿 5 个 Phaser 变体,挑一个导出源码接着改。
          </p>
          <p className="text-base text-zinc-400">
            不上 LLM 也能直接玩 3 套真模板。
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#demo"
              className="inline-flex items-center bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium"
              data-testid="hero-cta-try-sample"
            >
              Try sample(无门槛)
            </a>
            <a
              href="https://github.com/kevin12369/whimsy/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center border border-zinc-700 hover:border-zinc-500 text-zinc-200 px-6 py-3 rounded-lg font-medium"
              data-testid="hero-cta-readme"
            >
              看 README
            </a>
          </div>
        </div>
        <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
          <DemoVideo />
        </div>
      </div>
    </section>
  );
}

export default Hero;
