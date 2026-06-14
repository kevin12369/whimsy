import React from 'react';

interface FooterColumnLink {
  label: string;
  href: string;
  external?: boolean;
  testId?: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterColumnLink[];
  testId: string;
  children?: React.ReactNode;
}

/**
 * Single column of the site footer. Renders a title + a list of links.
 * If `children` are provided they render BELOW the link list (used by
 * the brand column for a tagline / sub-text).
 */
export function FooterColumn({ title, links, testId, children }: FooterColumnProps) {
  return (
    <div
      className="flex flex-col gap-3"
      data-testid={testId}
    >
      <h3
        className="text-sm font-semibold text-zinc-200 uppercase tracking-wide"
        data-testid={`${testId}-title`}
      >
        {title}
      </h3>
      {links.length > 0 && (
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                data-testid={link.testId ?? `${testId}-link-${link.label}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

export default FooterColumn;
