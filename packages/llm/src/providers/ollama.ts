import type { Provider } from '../provider';
import type { GenerateRequest, GenerateResult } from '../types';
import { LlmError } from '../errors';

export class OllamaProvider implements Provider {
  readonly name = 'ollama';
  constructor(
    private readonly baseUrl: string,
    private readonly model: string,
    private readonly timeoutMs = 30000,
  ) {}

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/generate`;
    const body = {
      model: this.model,
      prompt: `${req.system}\n\n${req.user}`,
      stream: false,
      options: {
        temperature: req.temperature ?? 0.4,
        num_predict: req.maxTokens ?? 8000,
      },
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        const retriable = res.status === 429 || res.status >= 500;
        throw new LlmError(this.name, `${res.status} ${text}`, retriable);
      }
      const json = (await res.json()) as {
        response?: string;
        prompt_eval_count?: number;
        eval_count?: number;
      };
      const text = json.response ?? '';
      if (!text) throw new LlmError(this.name, 'empty response', true);
      return {
        text,
        model: 'ollama',
        inputTokens: json.prompt_eval_count,
        outputTokens: json.eval_count,
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
