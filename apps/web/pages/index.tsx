import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { InputForm, type InputFormPayload } from '../components/InputForm';
import { HistorySidebar } from '../components/HistorySidebar';
import { StatusBar, type Usage } from '../components/StatusBar';
import { Toast } from '../components/Toast';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { generate, listGames, type GameListItem } from '../lib/api-client';

export default function Home() {
  const router = useRouter();
  const [games, setGames] = useState<GameListItem[]>([]);
  const [usage, setUsage] = useState<Usage>({ workers_ai: 0, deepseek: 0, gemini: 0, byok: 0, generations: 0, retries: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    listGames().then(r => setGames(r.games)).catch(() => setToast('Could not load history.'));
  }, []);

  async function onSubmit(p: InputFormPayload) {
    setToast('Generating…');
    try {
      const r = await generate(p);
      if (r.status === 'ok' && r.url) router.push(`/play/${r.id}/`);
      else setToast(r.error ?? 'Could not generate — try rephrasing.');
    } catch (e) {
      setToast('Network error. Try again.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 flex items-center border-b border-zinc-800">
        <h1 className="text-lg font-semibold">Whimsy — 一念成游</h1>
        <button onClick={() => setShowSettings(true)} className="ml-auto text-sm text-zinc-300 hover:text-white">Settings</button>
      </header>
      <main className="flex-1 flex">
        <section className="flex-1 p-6 flex flex-col items-center justify-center">
          <InputForm onSubmit={onSubmit} />
        </section>
        <aside className="w-80 border-l border-zinc-800 overflow-y-auto">
          <h2 className="text-sm uppercase text-zinc-500 px-3 py-2">Recent games</h2>
          <HistorySidebar games={games} />
        </aside>
      </main>
      <StatusBar usage={usage} />
      <Toast message={toast} />
      <SettingsDrawer open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
