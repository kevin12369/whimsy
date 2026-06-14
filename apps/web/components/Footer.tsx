import React from 'react';
import { FooterColumn } from './Footer/FooterColumn';

const REPO = 'https://github.com/kevin12369/whimsy';

const PROJECT_LINKS = [
  { label: 'GitHub 仓库', href: REPO, external: true, testId: 'footer-link-repo' },
  { label: 'Issues', href: `${REPO}/issues`, external: true, testId: 'footer-link-issues' },
  { label: 'Discussions', href: `${REPO}/discussions`, external: true, testId: 'footer-link-discussions' },
  { label: 'Changelog', href: `${REPO}/releases`, external: true, testId: 'footer-link-changelog' },
];

const DOC_LINKS = [
  { label: 'RUN-LOCALLY.md (本地跑)', href: `${REPO}/blob/main/RUN-LOCALLY.md`, external: true, testId: 'footer-link-run-locally' },
  { label: 'SPEC (spec 文档)', href: `${REPO}/blob/main/docs/superpowers/specs/2026-06-14-whimsy-v2-design.md`, external: true, testId: 'footer-link-spec' },
  { label: '路线图 (本页)', href: '#roadmap', testId: 'footer-link-roadmap' },
  { label: 'FAQ (本页)', href: '#faq', testId: 'footer-link-faq' },
];

const AUTHOR_LINKS = [
  { label: '邮件 491750329@qq.com', href: 'mailto:491750329@qq.com', testId: 'footer-link-email' },
  { label: '个人 portfolio', href: '/portfolio', testId: 'footer-link-portfolio' },
  { label: 'GitHub @kevin12369', href: 'https://github.com/kevin12369', external: true, testId: 'footer-link-author-gh' },
];

/**
 * Site-wide footer trust area.
 *
 * 4 columns on md+ (Brand / Project / Documentation / Author), 2x2 on
 * mobile. Bottom row carries copyright + 隐私 / License links.
 */
export function Footer() {
  return (
    <footer
      className="bg-zinc-900 border-t border-zinc-800"
      data-testid="footer"
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10"
          data-testid="footer-grid"
        >
          {/* Brand column */}
          <FooterColumn
            title="一念成游 · Whimsy"
            links={[]}
            testId="footer-brand"
          >
            <p className="text-xs text-zinc-500">AI Game Jam Starter · MIT</p>
            <p className="text-sm text-zinc-300 leading-relaxed mt-1">
              一句话开 game jam,30 秒拿到 5 个 Phaser 变体
            </p>
          </FooterColumn>

          <FooterColumn
            title="项目"
            links={PROJECT_LINKS}
            testId="footer-project"
          />

          <FooterColumn
            title="文档"
            links={DOC_LINKS}
            testId="footer-docs"
          />

          <FooterColumn
            title="作者"
            links={AUTHOR_LINKS}
            testId="footer-author"
          >
            <a
              href={`${REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-star-button"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium px-4 py-2 transition-colors"
            >
              Star on GitHub
            </a>
          </FooterColumn>
        </div>

        <div
          className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-zinc-500"
          data-testid="footer-bottom"
        >
          <p>
            (c) 2026 一念成游 Whimsy · MIT · kevin12369@qq.com · 隐私:零数据收集
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-zinc-300 transition-colors"
              data-testid="footer-link-privacy"
            >
              隐私
            </a>
            <a
              href={`${REPO}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
              data-testid="footer-link-license"
            >
              License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
