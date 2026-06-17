import { useEffect, useRef } from 'react';

const PHASER_SRC = '/phaser.min.js';
let phaserLoadingPromise: Promise<void> | null = null;
function ensurePhaserLoaded(): Promise<void> {
  if ((window as any).Phaser) return Promise.resolve();
  if (phaserLoadingPromise) return phaserLoadingPromise;
  phaserLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-phaser]`) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).Phaser) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Phaser failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = PHASER_SRC;
    s.dataset.phaser = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Phaser failed to load'));
    document.head.appendChild(s);
  });
  return phaserLoadingPromise;
}

export default function GamePreview({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const mount = ref.current!;
    (async () => {
      try {
        // Per Phaser expert: serialize Phaser load → IIFE inject → game.destroy on cleanup.
        await ensurePhaserLoaded();
        if (cancelled) return;
        (window as any).__WHIMSY_G__ = mount;
        const script = document.createElement('script');
        script.textContent = html;
        mount.appendChild(script);
      } catch (e) {
        mount.innerHTML = `<div style="color:#f44;padding:20px;font:14px monospace">Phaser load failed: ${(e as Error).message}</div>`;
      }
    })();
    // Cleanup runs before next mount OR on unmount
    return () => {
      cancelled = true;
      // Per Phaser expert: must destroy game BEFORE clearing innerHTML.
      const cleanup = (window as any).__whimsy_cleanup;
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch {}
      }
      // Remove any script tags we appended
      mount.querySelectorAll('script').forEach((s) => s.remove());
      // Only then clear
      mount.innerHTML = '';
    };
  }, [html]);

  return <div ref={ref} id="g" className="w-full h-full bg-black" />;
}
