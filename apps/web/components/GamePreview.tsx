import { useMemo } from 'react';
import type { Template } from '@whimsy/templates';
import { defaultConfig } from '@whimsy/templates';
import type { Theme } from '../lib/theme';

export interface GamePreviewProps {
  template: Template;
  theme: Theme;
}

export function GamePreview({ template, theme }: GamePreviewProps) {
  const html = useMemo(() => template.render(theme, defaultConfig()), [template, theme]);
  return (
    <iframe
      title={template.name}
      srcDoc={html}
      sandbox="allow-scripts"
      className="w-full h-full bg-black border-0"
    />
  );
}
