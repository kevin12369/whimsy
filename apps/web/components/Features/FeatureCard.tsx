import React from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  tags: string[];
  icon: React.ReactNode;
  testId?: string;
}

/**
 * Single card in the 4-up Features grid.
 *
 * Vertical layout:
 *   [ icon in a 12x12 gradient tile ]
 *   title
 *   description (1-2 lines)
 *   [ tag chips row ]
 */
export function FeatureCard({ title, description, tags, icon, testId }: FeatureCardProps) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors"
      data-testid={testId ?? 'feature-card'}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600/20 to-blue-600/20 text-zinc-100">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-50" data-testid="feature-card-title">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed" data-testid="feature-card-description">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5 pt-1" data-testid="feature-card-tags">
        {tags.map((t) => (
          <span
            key={t}
            className="bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded text-xs"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default FeatureCard;
