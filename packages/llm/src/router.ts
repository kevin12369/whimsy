import type { Provider } from './provider';
import type { Model } from './types';
import { WorkersAiProvider } from './providers/workers-ai';
import { DeepSeekProvider } from './providers/deepseek';
import { GeminiProvider } from './providers/gemini';
import { AnthropicProvider } from './providers/anthropic';
import { OllamaProvider } from './providers/ollama';
import { OpenAiCompatibleProvider } from './providers/openai-compatible';
import { LlmError } from './errors';
import { validateLocalBaseUrl } from './base-url';

export interface LlmEnv {
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
  DEEPSEEK_API_KEY?: string;
  GEMINI_API_KEY?: string;
  USER_ANTHROPIC_KEY?: string;
}

export interface LocalProviderOpts {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  model: string;       // user-supplied (e.g. 'llama3.1:8b')
}

export function pickProvider(
  model: Model,
  env: LlmEnv,
  local?: LocalProviderOpts,
): Provider {
  switch (model) {
    case 'workers-ai-llama': {
      if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) {
        throw new LlmError('router', 'CF_ACCOUNT_ID / CF_API_TOKEN missing', false);
      }
      return new WorkersAiProvider({ accountId: env.CF_ACCOUNT_ID, apiKey: env.CF_API_TOKEN });
    }
    case 'deepseek-coder-v2': {
      if (!env.DEEPSEEK_API_KEY) {
        throw new LlmError('router', 'DEEPSEEK_API_KEY missing', false);
      }
      return new DeepSeekProvider(env.DEEPSEEK_API_KEY);
    }
    case 'gemini-2.0-flash': {
      if (!env.GEMINI_API_KEY) {
        throw new LlmError('router', 'GEMINI_API_KEY missing', false);
      }
      return new GeminiProvider(env.GEMINI_API_KEY);
    }
    case 'claude-sonnet-4': {
      if (!env.USER_ANTHROPIC_KEY) {
        throw new LlmError('router', 'No Anthropic API key provided (BYOK)', false);
      }
      return new AnthropicProvider(env.USER_ANTHROPIC_KEY);
    }
    case 'ollama': {
      if (!local?.baseUrl) throw new LlmError('router', 'local.baseUrl required for ollama', false);
      validateLocalBaseUrl(local.baseUrl);
      return new OllamaProvider(local.baseUrl, local.model, local.timeoutMs ?? 30000);
    }
    case 'openai-compatible': {
      if (!local?.baseUrl) throw new LlmError('router', 'local.baseUrl required for openai-compatible', false);
      validateLocalBaseUrl(local.baseUrl);
      return new OpenAiCompatibleProvider(local.baseUrl, local.model, local.apiKey, local.timeoutMs ?? 30000);
    }
    default: {
      const _exhaustive: never = model;
      throw new LlmError('router', `Unknown model: ${_exhaustive as string}`, false);
    }
  }
}
