import { describe, it, expect } from 'vitest';
import { runWithRetry } from '../src/stateMachine';
import type { RetryDeps } from '../src/types';

const OK = '<!DOCTYPE html><html><body><canvas></canvas><script>new Phaser.Game({}); addEventListener("keydown",()=>{});</script></body></html>';

function makeDeps(overrides: Partial<RetryDeps> & { outputs?: string[] }): RetryDeps {
  const outs = overrides.outputs ?? [OK];
  let i = 0;
  return {
    generateOnce: async () => {
      const html = outs[Math.min(i++, outs.length - 1)] ?? '';
      return { html };
    },
    validate: overrides.validate ?? (() => ({ ok: true })),
    buildFixPrompt: overrides.buildFixPrompt ?? (() => 'fix'),
    buildRetryPrompt: overrides.buildRetryPrompt ?? ((u) => u + '+fix'),
  };
}

describe('runWithRetry', () => {
  it('returns ok on first attempt when validation passes', async () => {
    const r = await runWithRetry('user', makeDeps({}));
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(1);
  });

  it('retries up to 2 times on validation failure', async () => {
    const deps = makeDeps({ outputs: ['bad', 'still bad', OK] });
    deps.validate = (html) => html === OK ? { ok: true } : { ok: false, reason: 'bad' };
    const r = await runWithRetry('user', deps);
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(3);
  });

  it('returns ok=false after max 3 attempts (initial + 2 retries)', async () => {
    const deps = makeDeps({ outputs: ['bad1', 'bad2', 'bad3'] });
    deps.validate = () => ({ ok: false, reason: 'always bad' });
    const r = await runWithRetry('user', deps);
    expect(r.ok).toBe(false);
    expect(r.attempts).toBe(3);
    expect(r.errors).toEqual(['always bad', 'always bad', 'always bad']);
  });

  it('keeps bestHtml from the last attempt even on final failure', async () => {
    const deps = makeDeps({ outputs: ['b1', 'b2', 'b3'] });
    deps.validate = () => ({ ok: false, reason: 'nope' });
    const r = await runWithRetry('user', deps);
    expect(r.html).toBe('b3');
  });

  it('does not retry when MAX_RETRIES=0', async () => {
    const deps = makeDeps({ outputs: ['bad'] });
    deps.validate = () => ({ ok: false, reason: 'bad' });
    const r = await runWithRetry('user', deps, { maxRetries: 0 });
    expect(r.attempts).toBe(1);
    expect(r.ok).toBe(false);
  });
});
