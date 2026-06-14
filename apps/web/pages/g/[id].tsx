import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CopyShareLinkButton } from '../../components/CopyShareLinkButton';
import { decodeShareUrl, loadShare, saveShare, shareUrlBytes } from '../../lib/share';
import { extractHtml, sizeCheck, staticAnalysis } from '@whimsy/sandbox';

type Status = 'loading' | 'ready' | 'missing' | 'oversize' | 'error';

const HTML_WRAPPER = (body: string): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: https:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none';" />
<title>Whimsy Game</title>
<style>body { margin: 0; }</style>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.70.0/dist/phaser.min.js"></script>
</head>
<body>
${body}
</body>
</html>`;

function stripDoctype(html: string): string {
  return html.replace(/^\s*<!DOCTYPE[^>]*>/i, '');
}

function runSandbox(candidate: string): { ok: true; html: string } | { ok: false; reason: string } {
  const extracted = extractHtml(candidate) || candidate;
  const sizeResult = sizeCheck(extracted);
  if (!sizeResult.ok) return { ok: false, reason: sizeResult.reason ?? 'Size limit exceeded' };
  const validation = staticAnalysis(extracted);
  if (!validation.ok) return { ok: false, reason: validation.reason ?? 'Failed security check' };
  return { ok: true, html: HTML_WRAPPER(stripDoctype(extracted)) };
}

export default function ShareGamePage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [html, setHtml] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof router.query.id === 'undefined') return;
    let cancelled = false;
    (async () => {
      try {
        // 1. Hash in URL wins (small payloads, no round-trip).
        const fromHash = decodeShareUrl();
        if (fromHash) {
          if (cancelled) return;
          const result = runSandbox(fromHash);
          if (!result.ok) {
            setError(result.reason);
            setStatus('error');
            return;
          }
          setHtml(result.html);
          setShareUrl(window.location.href);
          setStatus('ready');
          return;
        }

        // 2. Fallback: lookup IndexedDB by ?id=...
        if (!id) {
          setStatus('missing');
          return;
        }
        const fromDb = await loadShare(id);
        if (cancelled) return;
        if (fromDb) {
          const result = runSandbox(fromDb);
          if (!result.ok) {
            setError(result.reason);
            setStatus('error');
            return;
          }
          setHtml(result.html);
          // Re-derive a hash URL for sharing.
          const url = await saveShare(id, fromDb);
          setShareUrl(url);
          setStatus('ready');
          return;
        }
        setStatus('missing');
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [router.query.id, id]);

  const bytes = shareUrl ? shareUrlBytes(shareUrl) : 0;
  const sandbox = 'allow-scripts';

  return (
    <>
      <Head>
        <title>Whimsy shared game</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        <header className="px-4 py-3 flex items-center border-b border-zinc-800">
          <h1 className="text-lg font-semibold">Whimsy shared game</h1>
          <span className="ml-3 text-xs text-zinc-500">sandbox: {sandbox}</span>
          <div className="ml-auto">
            {shareUrl && <CopyShareLinkButton url={shareUrl} />}
          </div>
        </header>

        <section className="flex-1 bg-black">
          {status === 'loading' && (
            <p className="p-6 text-zinc-400">Loading...</p>
          )}
          {status === 'missing' && (
            <p className="p-6 text-zinc-400">
              No game payload found. The link may have expired or the share was created in another browser.
            </p>
          )}
          {status === 'error' && (
            <p className="p-6 text-red-300">Failed to load: {error}</p>
          )}
          {status === 'ready' && html !== null && (
            <iframe
              title="shared game"
              srcDoc={html}
              sandbox={sandbox}
              className="w-full h-full bg-black border-0"
            />
          )}
        </section>

        <footer className="px-4 py-2 text-xs text-zinc-500 border-t border-zinc-800 flex items-center gap-3">
          <span>shared: {id || 'inline-hash'}</span>
          {bytes > 0 && <span>URL size: {bytes} bytes</span>}
          <a href="/" className="ml-auto underline">Open generator</a>
        </footer>
      </main>
    </>
  );
}
