import type { Provider } from '../provider';
import type { GenerateRequest, GenerateResult } from '../types';
import { LlmError } from '../errors';

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

export interface WorkersAiConfig {
  accountId: string;
  apiKey: string;
}

export class WorkersAiProvider implements Provider {
  readonly name = 'workers-ai';
  constructor(private readonly cfg: WorkersAiConfig) {}

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.cfg.accountId}/ai/run/${MODEL}`;
    const body = {
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.user },
      ],
      max_tokens: req.maxTokens ?? 8000,
      temperature: req.temperature ?? 0.4,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      const retriable = res.status === 429 || res.status >= 500;
      throw new LlmError(this.name, `${res.status} ${text}`, retriable);
    }
    const json = (await res.json()) as { result?: { response?: string } };
    const text = json.result?.response ?? '';
    if (!text) throw new LlmError(this.name, 'empty response', true);
    return { text, model: 'workers-ai-llama' };
  }
}
