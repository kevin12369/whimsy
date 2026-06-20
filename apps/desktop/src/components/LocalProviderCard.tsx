import { useEffect, useState } from 'react';
import { Check, AlertTriangle } from './icons';

export interface Status { ollama: boolean; lm_studio: boolean; }

function ProviderStatus({ running, name }: { running: boolean | undefined; name: string }) {
  const slug = name === 'LM Studio' ? 'lmstudio' : name.toLowerCase();
  if (running === true) {
    return (
      <span className="flex items-center gap-1 text-success" data-testid={`status-${slug}-ok`}>
        <Check /> running
      </span>
    );
  }
  if (running === false) {
    return (
      <span className="flex items-center gap-1 text-danger" data-testid={`status-${slug}-down`}>
        <AlertTriangle /> not detected
      </span>
    );
  }
  // Status undefined means we haven't received a successful response yet.
  // After 10s with no response, escalate from neutral to warn so the user notices.
  return <NoResponseOrChecking slug={slug} />;
}

function NoResponseOrChecking({ slug }: { slug: string }) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setStale(true), 10_000);
    return () => clearTimeout(id);
  }, []);
  if (stale) {
    return (
      <span className="flex items-center gap-1 text-warn" data-testid={`status-${slug}-stale`}>
        <AlertTriangle /> no response (is Rust backend running?)
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-zinc-500" data-testid={`status-${slug}-pending`}>
      <span className="w-3 h-3 rounded-full border border-zinc-600 border-t-zinc-300 animate-spin" aria-hidden />
      checking
    </span>
  );
}

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
    <div className="px-4 py-2.5 text-xs flex items-center gap-4 border-t border-surface-border">
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500">Ollama</span>
        <ProviderStatus running={status?.ollama} name="Ollama" />
      </span>
      <span className="flex items-center gap-1.5">
        <span className="text-zinc-500">LM Studio</span>
        <ProviderStatus running={status?.lm_studio} name="LM Studio" />
      </span>
    </div>
  );
}
