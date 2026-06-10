import { useEffect, useRef } from 'react';

export interface GameViewerProps {
  id: string;
  status?: 'ok' | 'failed';
}

export function GameViewer({ id, status = 'ok' }: GameViewerProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  // Client-side smoke test: wait up to 3s for postMessage({type:'game-ready'}).
  useEffect(() => {
    if (status !== 'ok') return;
    const iframe = ref.current;
    if (!iframe) return;
    let timedOut = false;
    const t = setTimeout(() => { timedOut = true; }, 3000);
    function onMsg(ev: MessageEvent) {
      const d = ev.data;
      if (d && d.type === 'game-ready') clearTimeout(t);
    }
    window.addEventListener('message', onMsg);
    return () => { window.removeEventListener('message', onMsg); clearTimeout(t); void timedOut; };
  }, [id, status]);

  return (
    <div className="w-full h-full flex flex-col">
      <iframe
        ref={ref}
        title="game"
        src={`/g/${id}`}
        sandbox="allow-scripts"
        className="w-full flex-1 bg-black border-0"
      />
      {status === 'failed' && (
        <div className="bg-red-900/30 text-red-200 p-2 text-sm">
          This game did not start. <a className="underline" href="/">Try again</a>
        </div>
      )}
    </div>
  );
}
