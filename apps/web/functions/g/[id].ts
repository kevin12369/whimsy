import type { PagesFunction } from '../types';

export const onRequestGet: PagesFunction = async ({ env, params }) => {
  const target = (env as { API_BASE?: string }).API_BASE ?? '';
  const id = (params as { id: string }).id;
  const res = await fetch(`${target}/g/${id}`);
  return new Response(res.body, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'text/html; charset=utf-8',
      'content-security-policy': res.headers.get('content-security-policy') ?? '',
    },
  });
};
