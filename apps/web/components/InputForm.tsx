import { useState } from 'react';

export interface InputFormPayload {
  text: string;
  genre: 'platformer' | 'shooter' | 'puzzle' | 'auto';
}

export interface InputFormProps {
  onSubmit: (p: InputFormPayload) => Promise<void>;
  disabled?: boolean;
}

export function InputForm({ onSubmit, disabled }: InputFormProps) {
  const [text, setText] = useState('');
  const [genre, setGenre] = useState<InputFormPayload['genre']>('auto');
  const [busy, setBusy] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy || disabled) return;
    setBusy(true);
    try { await onSubmit({ text: text.trim(), genre }); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={handle} className="flex flex-col gap-3 w-full max-w-xl">
      <label className="text-sm text-zinc-300">Describe a 2D game in one sentence</label>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Describe a game (e.g. "Mario but in space, I am a comet")'
        maxLength={500}
        className="rounded-md bg-zinc-900 border border-zinc-700 px-3 py-2 text-zinc-100"
      />
      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-400">Genre</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value as InputFormPayload['genre'])}
          className="rounded bg-zinc-900 border border-zinc-700 px-2 py-1 text-zinc-100"
        >
          <option value="auto">Auto-detect</option>
          <option value="platformer">Platformer</option>
          <option value="shooter">Shooter</option>
          <option value="puzzle">Puzzle</option>
        </select>
        <button
          type="submit"
          disabled={busy || !text.trim() || disabled}
          className="ml-auto rounded-md bg-primary text-black px-4 py-2 font-medium disabled:opacity-50"
        >
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </form>
  );
}
