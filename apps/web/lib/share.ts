// URL hash + IndexedDB share helpers.
// Static-deploy friendly: no R2, no backend, just base64-in-hash with a local IndexedDB fallback for large payloads.

const DB_NAME = 'whimsy-share';
const DB_VERSION = 1;
const STORE_NAME = 'shares';
const URL_LENGTH_LIMIT = 8000; // safe under common 8KB URL caps
const PREFIX = 'g=';

function utf8ToBase64(s: string): string {
  // Browser-safe base64 for unicode strings.
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(s)));
  }
  // Node fallback (tests)
  return Buffer.from(s, 'utf-8').toString('base64');
}

function base64ToUtf8(b64: string): string {
  if (typeof atob !== 'undefined') {
    return decodeURIComponent(escape(atob(b64)));
  }
  return Buffer.from(b64, 'base64').toString('utf-8');
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
  });
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

export interface ShareResult {
  url: string;
  storedInIndexedDB: boolean;
  bytes: number;
}

export function encodeShareUrl(html: string): string {
  const b64 = utf8ToBase64(html);
  const origin = typeof location !== 'undefined' ? location.origin : '';
  const pathname = typeof location !== 'undefined'
    ? location.pathname.replace(/\/$/, '')
    : '';
  return `${origin}${pathname}/g/?#${PREFIX}${b64}`;
}

export function decodeShareUrl(hash?: string): string | null {
  if (typeof window === 'undefined') return null;
  const raw = hash ?? window.location.hash.slice(1);
  // URLSearchParams treats '+' as a literal space, which mangles base64.
  // Parse manually: take everything after `g=` until the next `&` (or end).
  const m = /(?:^|&)g=([^&]*)/.exec(raw);
  if (!m) return null;
  const g = m[1];
  if (!g) return null;
  try {
    return base64ToUtf8(g);
  } catch {
    return null;
  }
}

export async function saveShare(id: string, html: string): Promise<string> {
  const url = encodeShareUrl(html);
  if (url.length <= URL_LENGTH_LIMIT) return url;
  let db: IDBDatabase;
  try {
    db = await openDb();
  } catch {
    // Fallback: return the long URL anyway, callers can decide.
    return url;
  }
  await new Promise<void>((resolve, reject) => {
    const store = tx(db, 'readwrite');
    store.put(html, id);
    store.transaction.oncomplete = () => resolve();
    store.transaction.onerror = () => reject(store.transaction.error ?? new Error('IDB put failed'));
  });
  db.close();
  const origin = typeof location !== 'undefined' ? location.origin : '';
  const pathname = typeof location !== 'undefined'
    ? location.pathname.replace(/\/$/, '')
    : '';
  return `${origin}${pathname}/g/${id}/`;
}

export async function loadShare(id: string): Promise<string | null> {
  if (typeof indexedDB === 'undefined') return null;
  let db: IDBDatabase;
  try {
    db = await openDb();
  } catch {
    return null;
  }
  const html: string | null = await new Promise((resolve) => {
    const store = tx(db, 'readonly');
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
    req.onerror = () => resolve(null);
  });
  db.close();
  return html;
}

export function isOversize(url: string): boolean {
  return url.length > URL_LENGTH_LIMIT;
}

export function shareUrlBytes(url: string): number {
  return url.length;
}