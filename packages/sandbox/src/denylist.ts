import type { DenylistHit } from './types';

// Normalize text to defeat trivial Unicode / string-concat bypasses.
// - NFKC normalizes full-width and compatibility forms back to ASCII lookalikes
// - strips zero-width chars (U+200B, U+200C, U+200D, U+FEFF)
// - decodes \uXXXX escapes that an attacker might embed
export function normalizeText(code: string): string {
  let s = code;
  if (typeof s.normalize === 'function') {
    s = s.normalize('NFKC');
  }
  s = s.replace(/[​-‍﻿]/g, '');
  // Decode \uXXXX escape sequences (very basic; one pass)
  s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex: string) => {
    const cp = parseInt(hex, 16);
    try {
      return String.fromCodePoint(cp);
    } catch {
      return _m;
    }
  });
  // Decode \xXX escapes
  s = s.replace(/\\x([0-9a-fA-F]{2})/g, (_m, hex: string) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  return s;
}

// SECURITY NOTE: strings below are *patterns we want to detect* inside
// user-submitted LLM output so the sandbox can reject the payload. They are
// never invoked at runtime — the static analyzer only does substring matching.
// The normalizeText() helper unescapes \uXXXX / \xXX so attackers cannot hide
// these tokens inside string literals to evade the scan.
export const FORBIDDEN_PATTERNS: readonly string[] = [
  // Original 11+
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

  // v2 additions — 12 more dangerous APIs that bypass the original 11.
  'SharedWorker',         // cross-origin same-origin tab pings
  'BroadcastChannel',     // same-origin cross-tab exfil
  'RTCPeerConnection',    // P2P data channels
  'RTCDataChannel',
  'getUserMedia',         // WebRTC media access
  'sendBeacon',           // one-way exfil, no CORS preflight
  'navigator.clipboard',  // data theft / pastejacking
  'window.open',          // popup phishing
  'document.domain',      // legacy same-origin flip
  'document.write',       // DOM clobbering
  'top.location',         // cross-origin redirect
  'location.href',        // navigation
  'Atomics.waitAsync',    // 2024 Spectre-ish side-channel
  'OffscreenCanvas',      // worker-bound canvas bypass
];

export function findDenylistHit(code: string): DenylistHit | null {
  const normalized = normalizeText(code);
  for (const pattern of FORBIDDEN_PATTERNS) {
    const idx = normalized.indexOf(pattern);
    if (idx !== -1) {
      const start = Math.max(0, idx - 20);
      const end = Math.min(normalized.length, idx + pattern.length + 20);
      return { pattern, index: idx, excerpt: normalized.slice(start, end) };
    }
  }
  return null;
}