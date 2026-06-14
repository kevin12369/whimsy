import type { Theme } from './theme';

// Wrap raw Phaser code (or a template's render() output) in a complete HTML document.
export function wrapInHtml(phaserCode: string, theme: Theme): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Whimsy Game</title>
  <style>html,body{margin:0;background:#000;color:#fff;font-family:sans-serif;overflow:hidden}canvas{display:block}</style>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
</head>
<body>
<script>
/* theme: primary=${theme.primary} secondary=${theme.secondary} player=${theme.playerLabel} enemy=${theme.enemyLabel} */
${phaserCode}
</script>
</body>
</html>`;
}

// Extract the body of the <script> block that contains `new Phaser.Game` from a rendered template.
export function extractPhaserCode(fullHtml: string): string {
  const scriptRe = /<script>([\s\S]*?new Phaser\.Game[\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  let chosen = '';
  let longest = 0;
  while ((match = scriptRe.exec(fullHtml)) !== null) {
    const body = match[1] ?? '';
    if (body.length > longest) {
      chosen = body;
      longest = body.length;
    }
  }
  return chosen;
}

// Render the current template+theme to a complete HTML file ready for download.
export function exportAsHtml(renderedHtml: string, theme: Theme): string {
  // If already wrapped (starts with <!DOCTYPE html>), pass through. Otherwise wrap.
  if (renderedHtml.trimStart().startsWith('<!DOCTYPE')) {
    return renderedHtml;
  }
  return wrapInHtml(renderedHtml, theme);
}

// Trigger a browser download of the given HTML.
export function downloadHtml(filename: string, html: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Copy text to clipboard (best-effort, returns success).
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}