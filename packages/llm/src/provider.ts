import type { GenerateRequest, GenerateResult } from './types';

export interface Provider {
  readonly name: string;
  generate(req: GenerateRequest, signal?: AbortSignal): Promise<GenerateResult>;
}
