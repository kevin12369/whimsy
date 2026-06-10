export interface RetryDeps {
  generateOnce: () => Promise<{ html: string }>;
  validate: (html: string) => { ok: boolean; reason?: string };
  buildFixPrompt: (prevHtml: string, error: string) => string;
  buildRetryPrompt: (userPrompt: string, fixPrompt: string) => string;
}

export interface RetryState {
  prompt: string;
  attempts: number;
  errors: string[];
  html: string | null;
  bestHtml: string | null;
}

export interface RetryResult {
  ok: boolean;
  html: string | null;
  attempts: number;
  errors: string[];
  reason?: string;
}
