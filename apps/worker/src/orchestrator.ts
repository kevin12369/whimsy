import { buildPrompt, type Genre, type Locale } from '@whimsy/prompt';
import { extractHtml, sizeCheck, staticAnalysis } from '@whimsy/sandbox';
import { runWithRetry, buildFixPrompt, buildRetryPrompt } from '@whimsy/retry';
import type { Provider } from '@whimsy/llm';
import { newGameId } from './ids';
import type { Env, GenerateResponseBody, GenerateRequestBody } from './types';

export interface OrchestrateDeps {
  provider: Provider;
  storeHtml: (id: string, html: string) => Promise<void>;
  recordHistory: (row: Record<string, unknown>) => Promise<void>;
  userId: string;
  mode: 'self' | 'byok' | 'hybrid';
}

const MAX_TEXT = 500;

function validateHtml(html: string): { ok: boolean; reason?: string } {
  const extracted = extractHtml(html);
  if (!extracted) return { ok: false, reason: 'extract: no <!DOCTYPE>/</html>' };
  const size = sizeCheck(extracted);
  if (!size.ok) return { ok: false, reason: `size: ${size.reason}` };
  const sa = staticAnalysis(extracted);
  if (!sa.ok) return { ok: false, reason: `static: ${sa.reason}` };
  return { ok: true };
}

export async function orchestrate(
  body: GenerateRequestBody,
  env: Env,
  deps: OrchestrateDeps,
): Promise<GenerateResponseBody> {
  const text = (body.text ?? '').trim();
  if (!text) throw new Error('text is required');
  if (text.length > MAX_TEXT) throw new Error(`text must be <= ${MAX_TEXT} chars`);

  const genre: Genre = body.genre ?? 'auto';
  const locale: Locale = body.locale ?? 'en';
  const prompt = buildPrompt({ text, genre, locale });

  let lastPrompt = prompt.user;
  const result = await runWithRetry(prompt.user, {
    generateOnce: async () => {
      const r = await deps.provider.generate({
        system: prompt.system,
        user: lastPrompt,
        maxTokens: 8000,
        temperature: 0.4,
      });
      return { html: r.text };
    },
    validate: validateHtml,
    buildFixPrompt,
    buildRetryPrompt: (user, fix) => {
      lastPrompt = buildRetryPrompt(user, fix);
      return lastPrompt;
    },
  });

  const id = newGameId();
  if (result.ok && result.html) {
    const extracted = extractHtml(result.html)!;
    await deps.storeHtml(id, extracted);
    await deps.recordHistory({
      id, prompt: text, genre, llm_model: 'pending',
      attempts: result.attempts, final_status: 'ok',
      r2_key: `games/${id}.html`, error: null,
      byte_size: new TextEncoder().encode(extracted).length,
      created_at: Date.now(),
    });
    return { id, status: 'ok', attempts: result.attempts, url: `/g/${id}` };
  }
  await deps.recordHistory({
    id, prompt: text, genre, llm_model: 'pending',
    attempts: result.attempts, final_status: 'failed',
    r2_key: null, error: result.reason ?? 'unknown',
    byte_size: 0, created_at: Date.now(),
  });
  return {
    id, status: 'failed', attempts: result.attempts,
    url: null, error: result.reason ?? 'unknown',
  };
}
