import type { Provider } from '../provider';
import type { GenerateRequest, GenerateResult } from '../types';
import { LlmError } from '../errors';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export class AnthropicProvider implements Provider {
  readonly name = 'anthropic';
  constructor(private readonly apiKey: string) {}

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const body = {
      model: MODEL,
      max_tokens: req.maxTokens ?? 8000,
      temperature: req.temperature ?? 0.4,
      system: req.system,
      messages: [{ role: 'user', content: req.user }],
    };
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new LlmError(this.name, `${res.status} ${text}`, res.status >= 500 || res.status === 429);
    }
    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text = json.content?.[0]?.text ?? '';
    if (!text) throw new LlmError(this.name, 'empty response', true);
    return {
      text,
      model: 'claude-sonnet-4',
      inputTokens: json.usage?.input_tokens,
      outputTokens: json.usage?.output_tokens,
    };
  }
}
