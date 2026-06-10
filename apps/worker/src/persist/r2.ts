import type { R2Bucket } from '@cloudflare/workers-types';

export function gameKey(id: string): string {
  return `games/${id}.html`;
}

export async function putGame(bucket: R2Bucket, id: string, html: string): Promise<void> {
  await bucket.put(gameKey(id), html, {
    httpMetadata: { contentType: 'text/html; charset=utf-8' },
  });
}

export async function getGame(bucket: R2Bucket, id: string): Promise<string | null> {
  const obj = await bucket.get(gameKey(id));
  if (!obj) return null;
  return await obj.text();
}
