import { useState } from 'react';
import type { Theme } from '../lib/theme';
import {
  extractPhaserCode,
  downloadHtml,
  copyToClipboard,
  wrapInHtml,
} from '../lib/export';

export interface GamePreviewToolbarProps {
  html: string;
  theme: Theme;
  templateName: string;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'success'; msg: string }
  | { kind: 'error'; msg: string };

export function GamePreviewToolbar({ html, theme, templateName }: GamePreviewToolbarProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [editing, setEditing] = useState(false);
  const [editedCode, setEditedCode] = useState<string | null>(null);

  function flash(kind: 'success' | 'error', msg: string) {
    setStatus({ kind, msg });
    setTimeout(() => setStatus({ kind: 'idle' }), 2200);
  }

  async function handleCopy() {
    const code = extractPhaserCode(html);
    if (!code) {
      flash('error', 'No Phaser code found');
      return;
    }
    const ok = await copyToClipboard(code);
    flash(ok ? 'success' : 'error', ok ? 'Copied Phaser code' : 'Copy failed');
  }

  function handleExport() {
    const filename = `${templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    downloadHtml(filename, html);
    flash('success', `Downloaded ${filename}`);
  }

  function startEdit() {
    const code = extractPhaserCode(html);
    if (!code) {
      flash('error', 'No Phaser code to edit');
      return;
    }
    setEditedCode(code);
    setEditing(true);
  }

  function commitEdit() {
    if (!editedCode) return;
    const wrapped = wrapInHtml(editedCode, theme);
    // Hand the wrapped HTML back to the parent through a custom event so the
    // parent iframe re-renders without a prop-drilling refactor.
    window.dispatchEvent(new CustomEvent('whimsy:preview-override', { detail: wrapped }));
    flash('success', 'Preview regenerated');
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
    setEditedCode(null);
  }

  return (
    <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/60 flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-1 border border-zinc-700"
        >
          Copy Phaser code
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-1 border border-zinc-700"
        >
          Export HTML
        </button>
        <button
          type="button"
          onClick={editing ? cancelEdit : startEdit}
          className="text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-3 py-1 border border-zinc-700"
        >
          {editing ? 'Cancel edit' : 'Edit & regenerate'}
        </button>
        {status.kind !== 'idle' && (
          <span
            className={`text-xs ${
              status.kind === 'success' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {status.msg}
          </span>
        )}
      </div>
      {editing && (
        <div className="flex flex-col gap-2">
          <textarea
            value={editedCode ?? ''}
            onChange={(e) => setEditedCode(e.target.value)}
            spellCheck={false}
            className="w-full h-48 rounded bg-zinc-950 border border-zinc-700 text-xs font-mono text-zinc-100 p-2"
            aria-label="Edit Phaser code"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={commitEdit}
              className="text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold px-3 py-1"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1"
            >
              Cancel
            </button>
            <span className="text-[10px] text-zinc-500">
              Edit any line, then click Regenerate to re-render the iframe.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}