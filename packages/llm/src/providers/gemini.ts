import type { Provider } from '../provider';
import type { GenerateRequest, GenerateResult } from '../types';
import { LlmError } from '../errors';

const MODEL = 'gemini-2.0-flash';

export class GeminiProvider implements Provider {
  readonly name = 'gemini';
  constructor(private readonly apiKey: string) {}

  async generate(req: GenerateRequest): Promise<GenerateResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${this.apiKey}`;
    const body = {
      systemInstruction: { parts: [{ text: req.system }] },
      contents: [{ role: 'user', parts: [{ text: req.user }] }],
      generationConfig: {
        maxOutputTokens: req.maxTokens ?? 8000,
        temperature: req.temperature ?? 0.4,
      },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new LlmError(this.name, `${res.status} ${text}`, res.status >= 500 || res.status === 429);
    }
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!text) throw new LlmError(this.name, 'empty response', true);
    return { text, model: 'gemini-2.0-flash' };
  }
}
