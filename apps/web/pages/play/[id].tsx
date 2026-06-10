import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GameViewer } from '../../components/GameViewer';
import { getGame, reportError, type GameListItem } from '../../lib/api-client';

export default function Play() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [meta, setMeta] = useState<GameListItem | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    getGame(id).then(setMeta).catch(() => setFailed(true));
  }, [id]);

  // Hook for reporting iframe runtime errors
  useEffect(() => {
    function onErr(ev: ErrorEvent) {
      if (id) reportError(id, ev.message).catch(() => {});
    }
    window.addEventListener('error', onErr);
    return () => window.removeEventListener('error', onErr);
  }, [id]);

  if (!id) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <a href="/" className="text-sm text-zinc-300 hover:text-white">← New</a>
        <h1 className="ml-4 text-sm text-zinc-400 truncate">{meta?.prompt ?? '...'}</h1>
        <button
          onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
          className="ml-auto text-sm text-zinc-300 hover:text-white"
        >Share link</button>
      </header>
      <main className="flex-1">
        <GameViewer id={id} status={failed ? 'failed' : 'ok'} />
      </main>
    </div>
  );
}
