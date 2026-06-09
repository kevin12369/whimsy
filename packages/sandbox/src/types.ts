export interface DenylistHit {
  pattern: string;
  index: number;
  excerpt: string;
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
  hit?: DenylistHit;
}
