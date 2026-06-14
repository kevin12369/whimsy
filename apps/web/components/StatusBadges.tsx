import React from 'react';

interface Badge {
  src: string;
  alt: string;
  href?: string;
  testId: string;
}

const BASE_BADGES: Badge[] = [
  {
    src: 'https://img.shields.io/github/actions/workflow/status/kevin12369/whimsy/ci.yml?style=flat-square&label=CI',
    alt: 'CI passing',
    href: 'https://github.com/kevin12369/whimsy/actions',
    testId: 'badge-ci',
  },
  {
    src: 'https://img.shields.io/badge/tests-222%20passing-brightgreen?style=flat-square',
    alt: 'Tests 222 passing',
    testId: 'badge-tests',
  },
  {
    src: 'https://img.shields.io/badge/CodeQL-clean-brightgreen?style=flat-square&logo=github-actions&logoColor=white',
    alt: 'CodeQL clean',
    href: 'https://github.com/kevin12369/whimsy/security/code-scanning',
    testId: 'badge-codeql',
  },
  {
    src: 'https://img.shields.io/badge/CSP-enforced-blue?style=flat-square&logo=shield&logoColor=white',
    alt: 'CSP enforced',
    testId: 'badge-csp',
  },
  {
    src: 'https://img.shields.io/badge/templates-15-ff44aa?style=flat-square',
    alt: '15 templates',
    testId: 'badge-templates',
  },
  {
    src: 'https://img.shields.io/badge/Try%20sample-zero%20friction-brightgreen?style=flat-square',
    alt: 'Try sample zero friction',
    testId: 'badge-try-sample',
  },
  {
    src: 'https://img.shields.io/badge//g/%20share-URL%20hash-3aa6ff?style=flat-square',
    alt: '/g/ share URL hash',
    testId: 'badge-share',
  },
  {
    src: 'https://img.shields.io/github/license/kevin12369/whimsy?style=flat-square',
    alt: 'License MIT',
    testId: 'badge-mit',
  },
];

/**
 * Row of shields.io badges for the landing page.
 *
 * 8 badges total (CI / Tests / CodeQL / CSP / 15 templates /
 * Try sample / /g/ share / MIT). Wraps automatically on narrow
 * screens. All external image sources are public shields.io
 * endpoints; img-src 'self' data: in CSP must be relaxed if you
 * need a hot badge proxy, but here we only render the img tags
 * (loading is deferred by browser, not server-rendered).
 */
export function StatusBadges() {
  return (
    <section
      className="bg-zinc-900 border-b border-zinc-800"
      data-testid="status-badges"
    >
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 justify-center items-center">
          {BASE_BADGES.map((badge) => {
            const img = (
              <img
                src={badge.src}
                alt={badge.alt}
                loading="lazy"
                className="h-5"
                data-testid={badge.testId}
              />
            );
            if (badge.href) {
              return (
                <a
                  key={badge.testId}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  {img}
                </a>
              );
            }
            return <span key={badge.testId}>{img}</span>;
          })}
        </div>
      </div>
    </section>
  );
}

export default StatusBadges;
