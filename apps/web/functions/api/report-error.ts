import type { PagesFunction } from '../types';

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const target = (env as { API_BASE?: string }).API_BASE ?? '';
  const res = await fetch(`${target}/api/report-error`, {
    method: 'POST',
    headers: new Headers(request.headers),
    body: request.body,
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
};
