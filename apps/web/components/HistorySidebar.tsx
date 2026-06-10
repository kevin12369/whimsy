import type { GameListItem } from '../lib/api-client';

export interface HistorySidebarProps {
  games: GameListItem[];
}

export function HistorySidebar({ games }: HistorySidebarProps) {
  if (games.length === 0) {
    return <div className="p-4 text-zinc-500 text-sm">No games yet — generate one.</div>;
  }
  return (
    <ul className="divide-y divide-zinc-800">
      {games.map(g => (
        <li key={g.id} className="p-3">
          <a className="text-sm text-zinc-200 hover:text-white" href={`/play/${g.id}/`}>
            {g.prompt.slice(0, 80)}
          </a>
          <div className="text-xs text-zinc-500 mt-1">
            {g.genre} · attempts: {g.attempts} · {new Date(g.created_at).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}
