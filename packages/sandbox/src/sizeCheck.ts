import type { ValidationResult } from './types';

export const MAX_BYTES = 200 * 1024; // 200 KB

export function sizeCheck(html: string): ValidationResult {
  // TextEncoder measures UTF-8 bytes accurately.
  const bytes = new TextEncoder().encode(html).length;
  if (bytes > MAX_BYTES) {
    return { ok: false, reason: `size ${bytes} bytes exceeds limit ${MAX_BYTES}` };
  }
  return { ok: true };
}
