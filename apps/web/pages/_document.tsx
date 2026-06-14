import { Html, Head, Main, NextScript } from 'next/document';
import type { ReactElement } from 'react';

const SITE_URL = 'https://kevin12369.github.io/whimsy/';
const TITLE = '一念成游 Whimsy — 一句话开 game jam,30 秒拿 5 个 Phaser 变体';
const DESCRIPTION =
  'Whimsy 让你用一句中文描述脑海里的游戏画面,30 秒内拿到 5 个 Phaser 3 小游戏变体,挑一个导出源码接着改。' +
  '不上 LLM 也能直接玩 3 套真模板。LLM 输出经纵深防御沙盒(12 denylist + 200KB + iframe sandbox)校验后丢进 iframe。';
const KEYWORDS =
  'Whimsy, 一念成游, AI game jam, Phaser 3, 小游戏生成器, 开源, MIT, 浏览器直连 LLM, 12 denylist, 沙盒验证, /g/ 分享';

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '一念成游 Whimsy',
  alternateName: 'Whimsy',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  description: DESCRIPTION,
  url: SITE_URL,
  author: { '@type': 'Person', name: 'kevin12369', email: '491750329@qq.com' },
  license: 'https://opensource.org/licenses/MIT',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    '15 套真差异化 Phaser 3 模板',
    '/g/[id] URL hash 分享 + 沙盒验证',
    '12 API 黑名单纵深防御',
    '录屏 / Embed snippet 一键导出',
    '浏览器直连 LLM,零后端',
  ],
};

/** Test-only exports of SEO meta values. Used by tests/seo-meta.test.ts. */
export const seoConstants = {
  SITE_URL,
  TITLE,
  DESCRIPTION,
  KEYWORDS,
  JSON_LD,
} as const;

/**
 * Testable inner element. Renders the same meta tags that <Document> would
 * mount under <Head>, but as a plain <div> wrapper so vitest can
 * `renderToStaticMarkup` it without pulling in Next's <Html> context
 * (which is forbidden outside pages/_document).
 *
 * In production, <Document> mounts the same children under <Head>.
 */
export function DocumentMeta(): ReactElement {
  return (
    <div>
      <meta name="author" content="kevin12369" />
      <link rel="canonical" href={SITE_URL} />
      <meta name="description" content={DESCRIPTION} />
      <meta name="keywords" content={KEYWORDS} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:site_name" content="一念成游 Whimsy" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <meta
        httpEquiv="Content-Security-Policy"
        content={[
          "default-src 'none'",
          // Script src restricted to self + pinned Phaser CDN; no unsafe-inline / unsafe-eval.
          "script-src 'self' https://cdn.jsdelivr.net/npm/phaser@3.70.0/",
          // Style src allows self + unsafe-inline (Tailwind injects styles via inline <style> at dev/build time).
          "style-src 'self' 'unsafe-inline'",
          // img-src opens up to shields.io for the StatusBadges row. data: covers blob-into-img fallbacks.
          "img-src 'self' data: https://img.shields.io",
          "connect-src 'self' http://localhost:* http://127.0.0.1:*",
          "frame-src 'self'",
          "base-uri 'none'",
          "form-action 'none'",
          "object-src 'none'",
          "worker-src 'none'",
          "manifest-src 'none'",
        ].join('; ')}
      />
    </div>
  );
}

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <DocumentMeta />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
