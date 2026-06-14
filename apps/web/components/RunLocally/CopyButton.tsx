import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon } from './icons';

export interface CopyButtonProps {
  /** Text to copy to the clipboard. */
  value: string;
  /** Optional ARIA label override. */
  ariaLabel?: string;
  /** Optional test id override. */
  testId?: string;
}

/**
 * Clipboard copy button.
 *
 * - On click: tries `navigator.clipboard.writeText` first.
 * - On failure (older browsers, insecure context): falls back to a
 *   hidden textarea + `document.execCommand('copy')`.
 * - On success: shows a "Copied" checkmark for ~1.6s.
 *
 * No SSR-unsafe globals are read at module load. Both `navigator` and
 * `document` are only touched inside the click handler, which is
 * guaranteed to run client-side.
 */
export function CopyButton({ value, ariaLabel, testId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else if (typeof document !== 'undefined') {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          ok = document.execCommand('copy');
        } catch {
          ok = false;
        }
        document.body.removeChild(ta);
      }
    } catch {
      ok = false;
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? 'Copy command'}
      data-testid={testId ?? 'copy-button'}
      className="inline-flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2 py-1 rounded transition-colors"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export default CopyButton;
