const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

export interface GenerateRequest { text: string; genre?: 'platformer' | 'shooter' | 'puzzle' | 'auto'; locale?: 'en' | 'zh'; model?: 'workers-ai-llama' | 'deepseek-coder-v2' | 'gemini-2.0-flash' | 'claude-sonnet-4'; }
export interface GenerateResponse { id: string; status: 'ok' | 'failed'; attempts: number; url: string | null; error?: string; }
export interface GameListItem { id: string; prompt: string; genre: string; attempts: number; created_at: number; url: string; }

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function generate(body: GenerateRequest): Promise<GenerateResponse> {
  const model = body.model ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('whimsy:model') : null) ?? undefined;
  const apiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('whimsy:apikey') : null;
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (model) headers['x-model'] = model;
  if (apiKey) headers['x-api-key'] = apiKey;
  return jsonOrThrow<GenerateResponse>(await fetch(`${API_BASE}/api/generate`, {
    method: 'POST', headers, body: JSON.stringify(body),
  }));
}

export async function listGames(): Promise<{ games: GameListItem[] }> {
  return jsonOrThrow(await fetch(`${API_BASE}/api/games`));
}

export async function getGame(id: string): Promise<GameListItem> {
  return jsonOrThrow(await fetch(`${API_BASE}/api/games/${id}`));
}

export async function reportError(id: string, error: string): Promise<void> {
  await jsonOrThrow(await fetch(`${API_BASE}/api/report-error`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id, error }),
  }));
}
