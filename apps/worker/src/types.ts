import type { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types';
import type { LlmEnv } from '@whimsy/llm';

export interface Env extends LlmEnv {
  DB: D1Database;
  GAMES: R2Bucket;
  QUOTA: KVNamespace;
  CF_ACCOUNT_ID: string;
  CF_API_TOKEN: string;
  DEEPSEEK_API_KEY: string;
  GEMINI_API_KEY: string;
  USER_ANTHROPIC_KEY?: string;
  DEFAULT_MODEL: string;
  CSP_REPORT_ONLY: string;
}

export interface GenerateRequestBody {
  text: string;
  genre?: 'platformer' | 'shooter' | 'puzzle' | 'auto';
  locale?: 'en' | 'zh';
  model?: 'workers-ai-llama' | 'deepseek-coder-v2' | 'gemini-2.0-flash' | 'claude-sonnet-4' | 'ollama' | 'openai-compatible';
  localBaseUrl?: string;
  localModel?: string;
  localApiKey?: string;
  localTimeoutMs?: number;
}

export interface GenerateResponseBody {
  id: string;
  status: 'ok' | 'failed';
  attempts: number;
  url: string | null;
  error?: string;
}

export interface ReportErrorBody {
  id: string;
  error: string;
  console?: string[];
}
