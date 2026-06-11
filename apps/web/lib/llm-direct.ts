export interface GenerateInput {
  text: string;
  model?: 'ollama' | 'openai-compatible';
  localBaseUrl?: string;
  localModel?: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

export interface GenerateResult {
  ok: boolean;
  html?: string;
  bytes?: number;
  error?: string;
}

export async function generateWithLocalLLM(_p: GenerateInput): Promise<GenerateResult> {
  throw new Error('not implemented yet — see Task 7');
}
