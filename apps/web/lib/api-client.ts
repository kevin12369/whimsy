const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

export interface GenerateRequest { text: string; genre?: 'platformer' | 'shooter' | 'puzzle' | 'auto'; locale?: 'en' | 'zh'; model?: 'workers-ai-llama' | 'deepseek-coder-v2' | 'gemini-2.0-flash' | 'claude-sonnet-4' | 'ollama' | 'openai-compatible'; localBaseUrl?: string; localModel?: string; localApiKey?: string; localTimeoutMs?: number; }
export interface GenerateResponse { id: string; status: 'ok' | 'failed'; attempts: number; url: string | null; error?: string; }
export interface GameListItem { id: string; prompt: string; genre: string; attempts: number; created_at: number; url: string; }

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function generate(body: GenerateRequest): Promise<GenerateResponse> {
  const ls = typeof localStorage !== 'undefined' ? localStorage : null;
  const model = body.model ?? ls?.getItem('whimsy:model') ?? undefined;
  const apiKey = ls?.getItem('whimsy:apikey');
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (model) headers['x-model'] = model;
  if (apiKey) headers['x-api-key'] = apiKey;
  const payload: GenerateRequest = { ...body };
  if (model === 'ollama' || model === 'openai-compatible') {
    payload.localBaseUrl = body.localBaseUrl ?? ls?.getItem('whimsy:local:baseUrl') ?? undefined;
    payload.localModel = body.localModel ?? ls?.getItem('whimsy:local:model') ?? undefined;
    payload.localApiKey = body.localApiKey ?? ls?.getItem('whimsy:local:apiKey') ?? undefined;
    const t = body.localTimeoutMs ?? Number(ls?.getItem('whimsy:local:timeoutMs') ?? 30000);
    payload.localTimeoutMs = t;
  }
  return jsonOrThrow<GenerateResponse>(await fetch(`${API_BASE}/api/generate`, {
    method: 'POST', headers, body: JSON.stringify(payload),
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
