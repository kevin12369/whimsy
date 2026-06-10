import type { Provider } from '../provider';
import type { GenerateRequest, GenerateResult } from '../types';
import { LlmError } from '../errors';

const ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const MODEL = 'deepseek-coder';

export class DeepSeekProvider implements Provider {
  readonly name = 'deepseek';
  constructor(private readonly apiKey: string) {}

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.user },
      ],
      max_tokens: req.maxTokens ?? 8000,
      temperature: req.temperature ?? 0.4,
      stream: false,
    };
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new LlmError(this.name, `${res.status} ${text}`, res.status >= 500 || res.status === 429);
    }
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const text = json.choices?.[0]?.message?.content ?? '';
    if (!text) throw new LlmError(this.name, 'empty response', true);
    return {
      text,
      model: 'deepseek-coder-v2',
      inputTokens: json.usage?.prompt_tokens,
      outputTokens: json.usage?.completion_tokens,
    };
  }
}
