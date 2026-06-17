import { useEffect, useState } from 'react';

export interface Status { ollama: boolean; lm_studio: boolean; }

export default function LocalProviderCard({ onStatus }: { onStatus: (s: Status | null) => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetch('http://localhost:1421/api/status');
        if (!cancelled && r.ok) {
          const s: Status = await r.json();
          setStatus(s);
          onStatus(s);
        }
      } catch {}
    }
    tick();
    const id = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [onStatus]);
  return (
    <div className="px-4 py-2 text-xs flex gap-3 border-t border-zinc-800">
      <span>Ollama: {status?.ollama === true ? '✓ running' : status ? '○ not detected' : '… checking'}</span>
      <span>LM Studio: {status?.lm_studio === true ? '✓ running' : status ? '○ not detected' : '… checking'}</span>
    </div>
  );
}
