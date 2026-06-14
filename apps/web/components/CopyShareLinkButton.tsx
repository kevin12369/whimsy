import { useEffect, useRef, useState } from 'react';

export interface CopyShareLinkButtonProps {
  url: string;
  label?: string;
}

export function CopyShareLinkButton({ url, label = 'Copy share link' }: CopyShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function handleCopy() {
    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      } else if (typeof document !== 'undefined') {
        // Fallback: hidden textarea + execCommand('copy')
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch {
      ok = false;
    }
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 text-sm"
    >
      <span aria-hidden>{'\u{1F4CB}'}</span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}