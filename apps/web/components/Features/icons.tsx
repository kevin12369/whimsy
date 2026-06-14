import React from 'react';

/**
 * 4 inline SVG icons used by the Features grid.
 *
 * Why inline SVG instead of emoji:
 * - Emoji fonts render inconsistently across macOS / Windows / Linux / mobile.
 * - Inline SVG uses currentColor so the parent text color drives the stroke.
 *
 * All icons are 24x24, stroke-based, and use strokeWidth=1.75.
 */

interface IconProps {
  className?: string;
}

function baseProps(className?: string) {
  return {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
}

// 3x3 grid with 4 highlighted tiles: signals "15 套真差异化模板".
export function TemplatesIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <rect x="9" y="3" width="6" height="6" fill="currentColor" stroke="none" opacity="0.3" />
    </svg>
  );
}

// Link / chain: signals /g/[id] share.
export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
    </svg>
  );
}

// Shield with check: signals 12 denylist.
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

// Video camera: signals recording / embed.
export function RecordIcon({ className }: IconProps) {
  return (
    <svg {...baseProps(className)}>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <polygon points="22 8 16 12 22 16 22 8" />
    </svg>
  );
}
