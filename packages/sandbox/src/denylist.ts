import type { DenylistHit } from './types';

export const FORBIDDEN_PATTERNS: readonly string[] = [
  'eval(',
  'new Function(',
  'document.cookie',
  'window.parent',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'fetch(',
  'XMLHttpRequest',
  'importScripts(',
  'navigator.serviceWorker',
  'postMessage(',  // blocks arbitrary postMessage; we whitelist via protocol module
  'WebSocket(',
  'EventSource(',
  'new Worker(',
];

export function findDenylistHit(code: string): DenylistHit | null {
  for (const pattern of FORBIDDEN_PATTERNS) {
    const idx = code.indexOf(pattern);
    if (idx !== -1) {
      const start = Math.max(0, idx - 20);
      const end = Math.min(code.length, idx + pattern.length + 20);
      return { pattern, index: idx, excerpt: code.slice(start, end) };
    }
  }
  return null;
}
