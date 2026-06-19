const OLLAMA_HOST = 'http://localhost:11434';

export interface ChatOptions {
  model: string;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chat(opts: ChatOptions): Promise<string> {
  const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: opts.model,
      prompt: `${opts.system}\n\n${opts.user}`,
      stream: false,
      options: {
        temperature: opts.temperature ?? 0.7,
        num_predict: opts.maxTokens ?? 1500,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as { response: string };
  return data.response;
}

export async function listLocalModels(): Promise<Array<{ name: string; size: number }>> {
  const response = await fetch(`${OLLAMA_HOST}/api/tags`);
  if (!response.ok) {
    throw new Error(`Ollama returned ${response.status}`);
  }
  const data = await response.json() as { models: Array<{ name: string; size: number }> };
  return data.models;
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}
