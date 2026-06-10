import type { Provider } from '../provider';
import type { GenerateRequest, GenerateResult } from '../types';
import { LlmError } from '../errors';

export class OpenAiCompatibleProvider implements Provider {
  readonly name = 'openai-compatible';
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
    private readonly apiKey?: string,
    private readonly timeoutMs = 30000,
  ) {}

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: req.system },
        { role: 'user', content: req.user },
      ],
      max_tokens: req.maxTokens ?? 8000,
      temperature: req.temperature ?? 0.4,
    };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST', headers, body: JSON.stringify(body), signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        const retriable = res.status === 429 || res.status >= 500;
        throw new LlmError(this.name, `${res.status} ${text}`, retriable);
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };
      const text = json.choices?.[0]?.message?.content ?? '';
      if (!text) throw new LlmError(this.name, 'empty response', true);
      return {
        text,
        model: 'openai-compatible',
        inputTokens: json.usage?.prompt_tokens,
        outputTokens: json.usage?.completion_tokens,
      };
    } catch (e) {
      if (e instanceof LlmError) throw e;
      if ((e as Error).name === 'AbortError') {
        throw new LlmError(this.name, `timeout after ${this.timeoutMs}ms`, true);
      }
      throw new LlmError(this.name, (e as Error).message, true);
    } finally {
      clearTimeout(timer);
    }
  }
}
