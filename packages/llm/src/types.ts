export type Model =
  | 'workers-ai-llama'
  | 'deepseek-coder-v2'
  | 'gemini-2.0-flash'
  | 'claude-sonnet-4';

export interface GenerateRequest {
  system: string;
  user: string;
  maxTokens?: number;       // default 8000
  temperature?: number;     // default 0.4
  apiKey?: string;          // BYOK
}

export interface GenerateResult {
  text: string;
  model: Model;
  inputTokens?: number;
  outputTokens?: number;
}
