export class LlmError extends Error {
  readonly provider: string;
  readonly retriable: boolean;
  constructor(provider: string, message: string, retriable: boolean) {
    super(`[${provider}] ${message}`);
    this.name = 'LlmError';
    this.provider = provider;
    this.retriable = retriable;
  }
}

export class QuotaExceeded extends Error {
  readonly scope: 'self' | 'byok';
  constructor(scope: 'self' | 'byok', message: string) {
    super(message);
    this.name = 'QuotaExceeded';
    this.scope = scope;
  }
}
