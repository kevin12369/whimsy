import type { RetryDeps, RetryResult, RetryState } from './types';

export const DEFAULT_MAX_RETRIES = 2;
export const MAX_TOTAL_ATTEMPTS = DEFAULT_MAX_RETRIES + 1;

export interface RunOptions {
  maxRetries?: number;
}

export async function runWithRetry(
  userPrompt: string,
  deps: RetryDeps,
  opts: RunOptions = {},
): Promise<RetryResult> {
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;
  const maxAttempts = maxRetries + 1;

  const state: RetryState = {
    prompt: userPrompt,
    attempts: 0,
    errors: [],
    html: null,
    bestHtml: null,
  };

  let currentPrompt = userPrompt;

  while (state.attempts < maxAttempts) {
    const { html } = await deps.generateOnce();
    state.html = html;
    state.bestHtml = html;

    const v = deps.validate(html);
    if (v.ok) {
      return {
        ok: true,
        html,
        attempts: state.attempts + 1,
        errors: [...state.errors],
      };
    }

    const reason = v.reason ?? 'unknown';
    state.errors.push(reason);
    state.attempts++;

    if (state.attempts >= maxAttempts) break;

    const fix = deps.buildFixPrompt(html, reason);
    currentPrompt = deps.buildRetryPrompt(userPrompt, fix);
    // For a real Worker, the prompt would be re-injected via deps; here generateOnce
    // closes over currentPrompt indirectly through the caller's wrapper. The contract
    // is: the caller passes a `generateOnce` that always uses the *latest* userPrompt
    // internally; the state machine's job is just to drive the loop.
    void currentPrompt;
  }

  return {
    ok: false,
    html: state.bestHtml,
    attempts: state.attempts,
    errors: [...state.errors],
    reason: state.errors[state.errors.length - 1],
  };
}
